import { QueryFailedError } from 'typeorm';

/** Lỗi vi phạm unique của Postgres (vd. hai request tạo cùng email/slug). */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string }).code === '23505'
  );
}
