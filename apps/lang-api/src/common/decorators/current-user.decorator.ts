import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SystemRole } from '@lang/shared';
import type { Request } from 'express';

/** User đã xác thực, do JwtStrategy gắn vào `request.user` (Step 5). */
export interface RequestUser {
  id: string;
  email: string;
  systemRole: SystemRole;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestUser | undefined =>
    context.switchToHttp().getRequest<Request & { user?: RequestUser }>().user,
);
