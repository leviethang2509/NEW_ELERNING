import { SYSTEM_MANAGER_ROLES, type AuthUser } from '@lang/shared';

export function isSystemManager(user: Pick<AuthUser, 'systemRole'>): boolean {
  return SYSTEM_MANAGER_ROLES.includes(user.systemRole);
}

/**
 * Chỉ nhận đường dẫn nội bộ (chặn open redirect kiểu `//evil.com`), bỏ qua
 * trang đăng nhập/đăng ký để không quay vòng.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || /^\/[/\\]/.test(next)) return null;
  if (/^\/(login|register)(?:[/?#]|$)/.test(next)) return null;
  return next;
}

/**
 * Trang đích sau đăng nhập (plan mục 6.1). Chưa có tenant nên chỉ phân biệt
 * quản trị hệ thống; điều hướng theo danh sách ngữ cảnh bổ sung ở Step 8.
 */
export function destinationAfterLogin(
  user: AuthUser,
  next?: string | null,
): string {
  if (user.mustChangePassword) return '/me/account';
  return safeNextPath(next) ?? (isSystemManager(user) ? '/admin' : '/me');
}
