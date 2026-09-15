/**
 * Cookie httpOnly chứa refresh token (backend đặt ở Step 5). Middleware của
 * lang-app chỉ dựa vào sự có mặt của cookie này để chặn sớm route cần đăng nhập.
 */
export const REFRESH_TOKEN_COOKIE = 'ls_rt';
