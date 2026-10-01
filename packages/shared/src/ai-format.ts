/** Hạn mức lượt định dạng bằng AI mỗi tháng của tenant; `null` = không giới hạn (req-5 plan 1.15). */
export const AI_MONTHLY_QUOTA_OPTIONS = [100, 1000] as const;
export type AiMonthlyQuota = (typeof AI_MONTHLY_QUOTA_OPTIONS)[number];

/** Trạng thái một lần bấm "Định dạng bằng AI" (bảng `ai_format_runs`, plan 4.1). */
export const AiFormatRunStatus = {
  RUNNING: 'running',
  /** Hết lỗi cấu trúc. */
  SUCCEEDED: 'succeeded',
  /** Còn lỗi cấu trúc sau mọi lần thử. */
  PARTIAL: 'partial',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;
export type AiFormatRunStatus =
  (typeof AiFormatRunStatus)[keyof typeof AiFormatRunStatus];

export function isAiMonthlyQuota(value: unknown): value is AiMonthlyQuota {
  return (AI_MONTHLY_QUOTA_OPTIONS as readonly unknown[]).includes(value);
}

/** Cài đặt AI của tenant trong `/admin`. */
export interface TenantAiSettings {
  enabled: boolean;
  monthlyQuota: AiMonthlyQuota | null;
  /** Lượt đã tính trong tháng hiện tại (giờ Việt Nam), kể cả lượt đang chạy. */
  usedThisMonth: number;
}

/** Ô "Ghi chú cho AI" (plan 1.6): giới hạn độ dài. */
export const AI_FORMAT_NOTE_MAX_LENGTH = 2000;

/** `GET t/:slug/ai/status` – nút "Định dạng bằng AI" ẩn/disable theo đây (plan 1.17). */
export interface AiStatus {
  /** Tenant được System Admin bật AI. */
  enabled: boolean;
  /** Server có cấu hình Gemini (thiếu thì route định dạng trả 501). */
  configured: boolean;
  /** Lượt đã dùng trong tháng (giờ Việt Nam), kể cả lượt đang chạy. */
  used: number;
  /** `null` = không giới hạn. */
  limit: AiMonthlyQuota | null;
}

/** Body `POST t/:slug/exams/:id/ai-format`: section đang mở trong editor (plan 1.8). */
export interface AiFormatInput {
  /** Section đã lưu (tab mới chưa lưu thì không có) – chỉ ghi nhật ký. */
  sectionId?: string | null;
  /** Module của section: tên module được đưa vào prompt. */
  moduleId?: string | null;
  /** Nội dung Plate của section (chưa lưu cũng được). */
  value: unknown[];
  note?: string | null;
}

export interface AiFormatStarted {
  jobId: string;
}

/** Vấn đề còn lại của kết quả (giống `Issue` của `@lang/exam-core`). */
export interface AiFormatIssue {
  indicatorId: string | null;
  message: string;
  severity: 'error' | 'warning';
  category: 'structure' | 'answer';
}

export interface AiFormatResult {
  /** Nội dung section mới; `changed = false` thì là nội dung gốc. */
  value: unknown[];
  /** AI có áp được thao tác nào không (plan 1.11). */
  changed: boolean;
  issues: AiFormatIssue[];
  /** Thao tác AI trả về nhưng bị bỏ (chữ không khớp…) của lần được chọn. */
  skippedOps: number;
}

/** `GET t/:slug/exams/:id/ai-format/:jobId`. */
export interface AiFormatJob {
  id: string;
  status: AiFormatRunStatus;
  /** Lần gọi AI đang chạy (1..maxAttempts); xong rồi = số lần đã gọi. */
  attempt: number;
  maxAttempts: number;
  /** Có khi `succeeded` / `partial`. */
  result: AiFormatResult | null;
  /** Lý do `failed` (tiếng Việt). */
  error: string | null;
}
