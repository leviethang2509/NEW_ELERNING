import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { SystemRole } from '@lang/shared';
import type { AuthenticatedRequest } from '../../common/decorators/current-user.decorator';
import { SYSTEM_ROLES_KEY } from '../decorators';

/** Guard toàn cục, chạy sau `JwtAuthGuard`; chỉ kiểm tra route có `@SystemRoles()`. */
@Injectable()
export class SystemRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<SystemRole[] | undefined>(
      SYSTEM_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!roles?.length) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user || !roles.includes(user.systemRole)) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
    return true;
  }
}
