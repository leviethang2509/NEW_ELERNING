/** Message của lỗi API (`ApiError`) hoặc thông báo mặc định. */
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
