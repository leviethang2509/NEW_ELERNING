import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { SystemRole, UserStatus } from '@lang/shared';
import type { AuthenticatedRequest } from '../../common/decorators/current-user.decorator';
import { InMemoryRepository } from '../../testing/in-memory-repository';
import type { User } from '../../users/user.entity';
import {
  ALLOW_PENDING_PASSWORD_CHANGE_KEY,
  IS_PUBLIC_KEY,
} from '../decorators';
import { JwtAuthGuard } from './jwt-auth.guard';

const secret = 'x'.repeat(32);

function contextFor(request: Partial<AuthenticatedRequest>): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function reflectorWith(metadata: Record<string, unknown> = {}): Reflector {
  return {
    getAllAndOverride: (key: string) => metadata[key],
  } as unknown as Reflector;
}

async function setup(metadata?: Record<string, unknown>) {
  const users = new InMemoryRepository<User>();
  users.rows.push({
    id: 'user-1',
    email: 'an@example.com',
    systemRole: SystemRole.REGISTERED_USER,
    status: UserStatus.ACTIVE,
    tokenVersion: 0,
    mustChangePassword: false,
  } as User);
  const jwt = new JwtService({ secret });
  const guard = new JwtAuthGuard(
    reflectorWith(metadata),
    jwt,
    users.asRepository(),
  );
  const token = await jwt.signAsync({ sub: 'user-1', tv: 0 });
  const request: Partial<AuthenticatedRequest> = {
    headers: { authorization: `Bearer ${token}` },
  };
  return { guard, users, jwt, request };
}

describe('JwtAuthGuard', () => {
  it('route @Public() không cần token', async () => {
    const { guard } = await setup({ [IS_PUBLIC_KEY]: true });
    await expect(guard.canActivate(contextFor({ headers: {} }))).resolves.toBe(
      true,
    );
  });

  it('thiếu token hoặc token sai chữ ký thì 401', async () => {
    const { guard } = await setup();
    await expect(
      guard.canActivate(contextFor({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    const forged = await new JwtService({ secret: 'y'.repeat(32) }).signAsync({
      sub: 'user-1',
      tv: 0,
    });
    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: `Bearer ${forged}` } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('token hợp lệ thì gắn user vào request', async () => {
    const { guard, request } = await setup();
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 'user-1',
      email: 'an@example.com',
      systemRole: SystemRole.REGISTERED_USER,
    });
  });

  it('khoá user trong DB thì token đang dùng bị 401 ngay', async () => {
    const { guard, users, request } = await setup();
    await users.update('user-1', { status: UserStatus.LOCKED });
    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('token_version đã tăng (đổi mật khẩu) thì token cũ bị 401', async () => {
    const { guard, users, request } = await setup();
    await users.update('user-1', { tokenVersion: 1 });
    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('còn cờ bắt đổi mật khẩu thì 403, trừ route cho phép', async () => {
    const blocked = await setup();
    await blocked.users.update('user-1', { mustChangePassword: true });
    await expect(
      blocked.guard.canActivate(contextFor(blocked.request)),
    ).rejects.toBeInstanceOf(ForbiddenException);

    const allowed = await setup({ [ALLOW_PENDING_PASSWORD_CHANGE_KEY]: true });
    await allowed.users.update('user-1', { mustChangePassword: true });
    await expect(
      allowed.guard.canActivate(contextFor(allowed.request)),
    ).resolves.toBe(true);
  });
});
