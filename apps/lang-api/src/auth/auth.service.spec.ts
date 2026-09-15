import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SystemRole, UserStatus } from '@lang/shared';
import type { EnvironmentVariables } from '../config/env.validation';
import { fakeDate } from '../testing/fake-clock';
import { InMemoryRepository } from '../testing/in-memory-repository';
import type { User } from '../users/user.entity';
import {
  AuthService,
  REFRESH_REUSE_GRACE_MS,
  type AccessTokenPayload,
} from './auth.service';
import type { RefreshToken } from './refresh-token.entity';

// bcrypt thật chậm (cost 12); logic auth không phụ thuộc thuật toán hash.
jest.mock('./password', () => ({
  hashPassword: async (plain: string) => `hashed:${plain}`,
  verifyPassword: async (plain: string, hash: string) =>
    hash === `hashed:${plain}`,
  getDummyPasswordHash: async () => 'hashed:không-trùng-mật-khẩu-nào',
}));

const client = { userAgent: 'jest', ip: '127.0.0.1' };
const registerDto = {
  email: 'an@example.com',
  password: 'matkhau123',
  fullName: 'Nguyễn An',
  dateOfBirth: '2000-01-01',
};
const loginDto = { email: registerDto.email, password: registerDto.password };

function setup() {
  const users = new InMemoryRepository<User>(() => ({
    systemRole: SystemRole.REGISTERED_USER,
    status: UserStatus.ACTIVE,
    mustChangePassword: false,
    tokenVersion: 0,
    gender: null,
    phone: null,
    address: null,
    avatarUrl: null,
    locale: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    lastLoginAt: null,
  }));
  const refreshTokens = new InMemoryRepository<RefreshToken>();
  const jwt = new JwtService({ secret: 'x'.repeat(32) });
  const config = {
    get: (key: string) => ({ REFRESH_EXPIRES_IN: '30d' })[key],
  } as unknown as ConfigService<EnvironmentVariables, true>;
  const service = new AuthService(
    users.asRepository(),
    refreshTokens.asRepository(),
    jwt,
    config,
  );
  return { service, users, refreshTokens, jwt };
}

const useFakeClock = () => fakeDate('2026-09-15T08:00:00Z');

describe('AuthService', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('register', () => {
    it('chuẩn hoá email, tạo user và phiên đăng nhập', async () => {
      const { service, users, refreshTokens, jwt } = setup();
      const session = await service.register(
        { ...registerDto, email: '  An@Example.COM ' },
        client,
      );

      expect(session.user.email).toBe('an@example.com');
      expect(users.rows[0].passwordHash).toBe('hashed:matkhau123');
      expect(refreshTokens.rows).toHaveLength(1);
      expect(refreshTokens.rows[0].tokenHash).not.toBe(session.refreshToken);
      await expect(
        jwt.verifyAsync<AccessTokenPayload>(session.accessToken),
      ).resolves.toMatchObject({ sub: session.user.id, tv: 0 });
    });

    it('email đã dùng (khác hoa thường) thì 409', async () => {
      const { service } = setup();
      await service.register(registerDto, client);
      await expect(
        service.register({ ...registerDto, email: 'AN@example.com' }, client),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('sai mật khẩu hoặc email không tồn tại thì 401', async () => {
      const { service } = setup();
      await service.register(registerDto, client);
      await expect(
        service.login({ ...loginDto, password: 'sai-mat-khau' }, client),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(
        service.login({ ...loginDto, email: 'khac@example.com' }, client),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('tài khoản bị khoá thì 403', async () => {
      const { service, users } = setup();
      const { user } = await service.register(registerDto, client);
      await users.update(user.id, { status: UserStatus.LOCKED });
      await expect(service.login(loginDto, client)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('đăng nhập đúng (email khác hoa thường) cập nhật last_login_at', async () => {
      const { service, users } = setup();
      await service.register(registerDto, client);
      const session = await service.login(
        { ...loginDto, email: 'An@Example.com' },
        client,
      );
      expect(session.accessToken).toBeTruthy();
      expect(users.rows[0].lastLoginAt).toBeInstanceOf(Date);
    });
  });

  describe('refresh', () => {
    it('xoay token: token cũ bị thu hồi, token mới dùng tiếp được', async () => {
      const { service, refreshTokens } = setup();
      const first = await service.register(registerDto, client);
      const second = await service.refresh(first.refreshToken, client);

      expect(second.refreshToken).not.toBe(first.refreshToken);
      const [old, replacement] = refreshTokens.rows;
      expect(old.revokedAt).toBeInstanceOf(Date);
      expect(old.replacedById).toBe(replacement.id);
      expect(replacement.familyId).toBe(old.familyId);
      await expect(
        service.refresh(second.refreshToken, client),
      ).resolves.toBeDefined();
    });

    it('thiếu token hoặc token lạ thì 401', async () => {
      const { service } = setup();
      await expect(service.refresh(undefined, client)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      await expect(
        service.refresh('khong-ton-tai', client),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('dùng lại token cũ sau thời gian ân hạn thì thu hồi cả family', async () => {
      useFakeClock();
      const { service, refreshTokens } = setup();
      const first = await service.register(registerDto, client);
      const second = await service.refresh(first.refreshToken, client);

      jest.setSystemTime(Date.now() + REFRESH_REUSE_GRACE_MS + 1000);
      await expect(
        service.refresh(first.refreshToken, client),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      // Token hợp lệ mới nhất (có thể đang nằm trong tay kẻ gian) cũng mất hiệu lực.
      await expect(
        service.refresh(second.refreshToken, client),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(refreshTokens.rows.every((row) => row.revokedAt)).toBe(true);
    });

    it('dùng lại token cũ trong thời gian ân hạn (nhiều tab) vẫn được cấp token mới', async () => {
      useFakeClock();
      const { service } = setup();
      const first = await service.register(registerDto, client);
      const second = await service.refresh(first.refreshToken, client);

      jest.setSystemTime(Date.now() + 5000);
      const third = await service.refresh(first.refreshToken, client);
      expect(third.refreshToken).not.toBe(second.refreshToken);
      await expect(
        service.refresh(second.refreshToken, client),
      ).resolves.toBeDefined();
    });

    it('không ân hạn khi family đã bị thu hồi (đã đăng xuất)', async () => {
      const { service } = setup();
      const first = await service.register(registerDto, client);
      const second = await service.refresh(first.refreshToken, client);
      await service.logout(second.refreshToken);

      await expect(
        service.refresh(first.refreshToken, client),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(
        service.refresh(second.refreshToken, client),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('user bị khoá thì refresh bị từ chối', async () => {
      const { service, users } = setup();
      const session = await service.register(registerDto, client);
      await users.update(session.user.id, { status: UserStatus.LOCKED });
      await expect(
        service.refresh(session.refreshToken, client),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('sai mật khẩu hiện tại hoặc trùng mật khẩu cũ thì 400', async () => {
      const { service } = setup();
      const { user, refreshToken } = await service.register(
        registerDto,
        client,
      );
      await expect(
        service.changePassword(
          user.id,
          { currentPassword: 'sai-mat-khau', newPassword: 'matkhaumoi456' },
          refreshToken,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.changePassword(
          user.id,
          { currentPassword: 'matkhau123', newPassword: 'matkhau123' },
          refreshToken,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('tăng token_version, bỏ cờ bắt đổi mật khẩu, thu hồi phiên khác và giữ phiên hiện tại', async () => {
      const { service, users, jwt } = setup();
      const deviceA = await service.register(registerDto, client);
      const deviceB = await service.login(loginDto, client);
      await users.update(deviceA.user.id, { mustChangePassword: true });

      const result = await service.changePassword(
        deviceA.user.id,
        { currentPassword: 'matkhau123', newPassword: 'matkhaumoi456' },
        deviceA.refreshToken,
      );

      expect(users.rows[0]).toMatchObject({
        tokenVersion: 1,
        mustChangePassword: false,
        passwordHash: 'hashed:matkhaumoi456',
      });
      expect(result.user.mustChangePassword).toBe(false);
      await expect(
        jwt.verifyAsync<AccessTokenPayload>(result.accessToken),
      ).resolves.toMatchObject({ tv: 1 });
      await expect(
        service.refresh(deviceB.refreshToken, client),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(
        service.refresh(deviceA.refreshToken, client),
      ).resolves.toBeDefined();
    });
  });
});
