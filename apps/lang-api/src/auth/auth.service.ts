import { createHash, randomBytes, randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { normalizeEmail, UserStatus, type AuthUser } from '@lang/shared';
import { IsNull, LessThan, Not, type Repository } from 'typeorm';
import { isUniqueViolation } from '../common/database-errors';
import { durationToSeconds } from '../common/duration';
import type { EnvironmentVariables } from '../config/env.validation';
import { toAuthUser } from '../users/auth-user';
import { User } from '../users/user.entity';
import type { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { getDummyPasswordHash, hashPassword, verifyPassword } from './password';
import { RefreshToken } from './refresh-token.entity';

/**
 * Token vừa bị xoay mà được gửi lại trong khoảng này (vd. nhiều tab cùng
 * refresh) thì cấp token mới cùng family, không coi là bị đánh cắp.
 */
export const REFRESH_REUSE_GRACE_MS = 30_000;

/** Payload access token: `tv` phải khớp `users.token_version`. */
export interface AccessTokenPayload {
  sub: string;
  tv: number;
}

export interface ClientInfo {
  userAgent: string | null;
  ip: string | null;
}

export interface Session {
  accessToken: string;
  /** Token gốc để đặt vào cookie; DB chỉ lưu sha256. */
  refreshToken: string;
  user: AuthUser;
}

const INVALID_SESSION = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
const EMAIL_TAKEN = 'Email đã được sử dụng';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly refreshTtlMs: number;

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    private readonly jwt: JwtService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.refreshTtlMs =
      durationToSeconds(config.get('REFRESH_EXPIRES_IN', { infer: true })) *
      1000;
  }

  async register(dto: RegisterDto, client: ClientInfo): Promise<Session> {
    const email = normalizeEmail(dto.email);
    if (await this.users.existsBy({ email })) {
      throw new ConflictException(EMAIL_TAKEN);
    }
    const user = this.users.create({
      email,
      passwordHash: await hashPassword(dto.password),
      fullName: dto.fullName,
      dateOfBirth: dto.dateOfBirth,
    });
    try {
      await this.users.save(user);
    } catch (error) {
      // Hai request đăng ký cùng email: unique index chặn request sau.
      if (isUniqueViolation(error)) throw new ConflictException(EMAIL_TAKEN);
      throw error;
    }
    return this.startSession(user, client);
  }

  async login(dto: LoginDto, client: ClientInfo): Promise<Session> {
    const user = await this.users.findOneBy({
      email: normalizeEmail(dto.email),
    });
    const passwordMatches = await verifyPassword(
      dto.password,
      user?.passwordHash ?? (await getDummyPasswordHash()),
    );
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        'Tài khoản đã bị khoá, vui lòng liên hệ quản trị viên',
      );
    }

    const now = new Date();
    await this.users.update(user.id, { lastLoginAt: now });
    // Dọn refresh token hết hạn của user để bảng không phình dần.
    await this.refreshTokens.delete({
      userId: user.id,
      expiresAt: LessThan(now),
    });
    return this.startSession({ ...user, lastLoginAt: now }, client);
  }

  /**
   * Xoay refresh token. Token đã thu hồi bị gửi lại (ngoài thời gian ân hạn)
   * được coi là bị lộ: thu hồi cả family, buộc đăng nhập lại.
   */
  async refresh(
    rawToken: string | undefined,
    client: ClientInfo,
  ): Promise<Session> {
    if (!rawToken) throw new UnauthorizedException(INVALID_SESSION);
    const now = new Date();
    const current = await this.refreshTokens.findOneBy({
      tokenHash: hashToken(rawToken),
    });
    if (!current || current.expiresAt <= now) {
      throw new UnauthorizedException(INVALID_SESSION);
    }
    if (current.revokedAt && !(await this.canReuse(current, now))) {
      await this.revokeFamily(current.familyId, now);
      throw new UnauthorizedException(INVALID_SESSION);
    }

    const user = await this.users.findOneBy({ id: current.userId });
    if (!user || user.status !== UserStatus.ACTIVE) {
      await this.revokeFamily(current.familyId, now);
      throw new UnauthorizedException(INVALID_SESSION);
    }

    const next = await this.issueRefreshToken(
      user.id,
      current.familyId,
      client,
      now,
    );
    if (!current.revokedAt) {
      // Chỉ thu hồi nếu chưa ai thu hồi, tránh hai request xoay cùng lúc ghi đè nhau.
      const { affected } = await this.refreshTokens.update(
        { id: current.id, revokedAt: IsNull() },
        { revokedAt: now, replacedById: next.id },
      );
      if (!affected) {
        const latest = await this.refreshTokens.findOneBy({ id: current.id });
        if (!latest || !(await this.canReuse(latest, now, next.id))) {
          await this.revokeFamily(current.familyId, now);
          throw new UnauthorizedException(INVALID_SESSION);
        }
      }
    }

    return {
      accessToken: await this.signAccessToken(user),
      refreshToken: next.raw,
      user: toAuthUser(user),
    };
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const token = await this.refreshTokens.findOneBy({
      tokenHash: hashToken(rawToken),
    });
    if (token) await this.revokeFamily(token.familyId, new Date());
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException(INVALID_SESSION);
    return toAuthUser(user);
  }

  /**
   * Đổi mật khẩu: tăng `token_version` (access token cũ mất hiệu lực), thu hồi
   * refresh token của các phiên khác, giữ phiên hiện tại và trả access token mới.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    rawToken: string | undefined,
  ): Promise<Omit<Session, 'refreshToken'>> {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException(INVALID_SESSION);
    if (!(await verifyPassword(dto.currentPassword, user.passwordHash))) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại');
    }

    const changes = {
      passwordHash: await hashPassword(dto.newPassword),
      tokenVersion: user.tokenVersion + 1,
      mustChangePassword: false,
    };
    await this.users.update(user.id, changes);
    const updated: User = { ...user, ...changes };

    const current = rawToken
      ? await this.refreshTokens.findOneBy({
          tokenHash: hashToken(rawToken),
          userId: user.id,
        })
      : null;
    const keepFamily = current && !current.revokedAt ? current.familyId : null;
    await this.refreshTokens.update(
      {
        userId: user.id,
        revokedAt: IsNull(),
        ...(keepFamily ? { familyId: Not(keepFamily) } : {}),
      },
      { revokedAt: new Date() },
    );

    return {
      accessToken: await this.signAccessToken(updated),
      user: toAuthUser(updated),
    };
  }

  private async startSession(user: User, client: ClientInfo): Promise<Session> {
    const refresh = await this.issueRefreshToken(
      user.id,
      randomUUID(),
      client,
      new Date(),
    );
    return {
      accessToken: await this.signAccessToken(user),
      refreshToken: refresh.raw,
      user: toAuthUser(user),
    };
  }

  private signAccessToken(user: User): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      tv: user.tokenVersion,
    };
    return this.jwt.signAsync(payload);
  }

  private async issueRefreshToken(
    userId: string,
    familyId: string,
    client: ClientInfo,
    now: Date,
  ): Promise<{ id: string; raw: string }> {
    const raw = randomBytes(32).toString('base64url');
    const token = await this.refreshTokens.save(
      this.refreshTokens.create({
        userId,
        familyId,
        tokenHash: hashToken(raw),
        expiresAt: new Date(now.getTime() + this.refreshTtlMs),
        revokedAt: null,
        replacedById: null,
        userAgent: client.userAgent,
        ip: client.ip,
      }),
    );
    return { id: token.id, raw };
  }

  /**
   * Được dùng lại token đã xoay khi: bị thu hồi do xoay (không phải đăng xuất),
   * còn trong thời gian ân hạn và family vẫn còn token hoạt động.
   */
  private async canReuse(
    token: RefreshToken,
    now: Date,
    ignoreTokenId?: string,
  ): Promise<boolean> {
    if (!token.revokedAt || !token.replacedById) return false;
    if (now.getTime() - token.revokedAt.getTime() > REFRESH_REUSE_GRACE_MS) {
      return false;
    }
    return this.refreshTokens.existsBy({
      familyId: token.familyId,
      revokedAt: IsNull(),
      ...(ignoreTokenId ? { id: Not(ignoreTokenId) } : {}),
    });
  }

  private async revokeFamily(familyId: string, now: Date): Promise<void> {
    await this.refreshTokens.update(
      { familyId, revokedAt: IsNull() },
      { revokedAt: now },
    );
  }
}
