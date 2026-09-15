/** Giới tính trên hồ sơ (cột `users.gender`, để trống được). */
export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

/** Giá trị mặc định của `users.locale` / `users.timezone`. */
export const DEFAULT_LOCALE = 'vi';
export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';
