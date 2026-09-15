import { SetMetadata } from '@nestjs/common';
import type { SystemRole } from '@lang/shared';

export const IS_PUBLIC_KEY = 'auth:public';
export const ALLOW_PENDING_PASSWORD_CHANGE_KEY =
  'auth:allowPendingPasswordChange';
export const SYSTEM_ROLES_KEY = 'auth:systemRoles';

/** Bỏ qua `JwtAuthGuard` (mặc định mọi route đều cần đăng nhập). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Vẫn cho gọi khi user còn cờ `must_change_password` (xem mình, đổi mật khẩu). */
export const AllowPendingPasswordChange = () =>
  SetMetadata(ALLOW_PENDING_PASSWORD_CHANGE_KEY, true);

/** Chỉ các system role này được gọi (kiểm tra ở `SystemRolesGuard`). */
export const SystemRoles = (...roles: SystemRole[]) =>
  SetMetadata(SYSTEM_ROLES_KEY, roles);
