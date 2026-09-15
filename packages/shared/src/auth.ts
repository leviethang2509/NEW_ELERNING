import type { SystemRole } from './roles';
import type { Gender } from './user';

/**
 * Cookie httpOnly chứa refresh token (backend đặt khi đăng nhập). Middleware của
 * lang-app chỉ dựa vào sự có mặt của cookie này để chặn sớm route cần đăng nhập.
 */
export const REFRESH_TOKEN_COOKIE = 'ls_rt';

/** Ràng buộc mật khẩu khi đăng ký, đổi mật khẩu, tạo mật khẩu tạm. */
export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt chỉ dùng 72 byte đầu nên chặn mật khẩu dài hơn. */
export const PASSWORD_MAX_LENGTH = 72;

/** Email lưu và so sánh ở dạng chữ thường, bỏ khoảng trắng hai đầu. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Thông tin user trả về cho client (`/auth/me`, đăng nhập, cập nhật hồ sơ). */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  /** `YYYY-MM-DD` */
  dateOfBirth: string;
  gender: Gender | null;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  locale: string;
  timezone: string;
  systemRole: SystemRole;
  mustChangePassword: boolean;
}

/** Kết quả đăng ký / đăng nhập / refresh / đổi mật khẩu. Refresh token nằm trong cookie. */
export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
