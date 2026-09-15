import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from '@lang/shared';
import type { Repository } from 'typeorm';
import type { AuthenticatedRequest } from '../../common/decorators/current-user.decorator';
import { User } from '../../users/user.entity';
import type { AccessTokenPayload } from '../auth.service';
import {
  ALLOW_PENDING_PASSWORD_CHANGE_KEY,
  IS_PUBLIC_KEY,
} from '../decorators';

/**
 * Guard toàn cục: mọi route cần access token trừ `@Public()`. User được tải lại
 * từ DB mỗi request để khoá tài khoản hay đổi mật khẩu có hiệu lực ngay.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Bạn chưa đăng nhập');
    }

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
    }

    const user =
      typeof payload.sub === 'string'
        ? await this.users.findOneBy({ id: payload.sub })
        : null;
    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      user.tokenVersion !== payload.tv
    ) {
      throw new UnauthorizedException('Phiên đăng nhập không còn hiệu lực');
    }
    if (
      user.mustChangePassword &&
      !this.reflector.getAllAndOverride<boolean>(
        ALLOW_PENDING_PASSWORD_CHANGE_KEY,
        targets,
      )
    ) {
      throw new ForbiddenException('Bạn cần đổi mật khẩu trước khi tiếp tục');
    }

    request.user = {
      id: user.id,
      email: user.email,
      systemRole: user.systemRole,
    };
    return true;
  }
}
