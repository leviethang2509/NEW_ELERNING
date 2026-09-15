import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SystemRole } from '@lang/shared';
import type { Request } from 'express';

/** User đã xác thực, do `JwtAuthGuard` gắn vào `request.user`. */
export interface RequestUser {
  id: string;
  email: string;
  systemRole: SystemRole;
}

export type AuthenticatedRequest = Request & { user?: RequestUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestUser | undefined =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
