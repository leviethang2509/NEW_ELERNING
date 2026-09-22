// Thông báo trong ứng dụng (req-3 Step 12, R18, E11): chuông ở header gộp mọi
// trung tâm của người dùng, gọi lại mỗi 60 giây, giữ 90 ngày, không tắt được.
// Nội dung lưu `type` + `params`, chữ dựng ở client từ `vi.notifications`
// (giả định 11) nên đổi câu chữ không cần migration.

export const NotificationType = {
  /** Học viên được thêm vào lớp. */
  CLASS_STUDENT_ADDED: 'class_student_added',
  /** Giáo viên được thêm vào lớp. */
  CLASS_TEACHER_ADDED: 'class_teacher_added',
  /** Mục mới được giao trong giáo trình lớp (gộp 1 thông báo mỗi lần lưu). */
  CLASS_ITEMS_ASSIGNED: 'class_items_assigned',
  /** Có lần thi lại mới cho một mục đề thi (R7). */
  RETAKE_ASSIGNED: 'retake_assigned',
  /** Mục tới ngày mở (cron 15 phút). */
  CLASS_ITEM_OPENED: 'class_item_opened',
  /** Mục chưa nộp, còn dưới 24 giờ tới hạn (cron 15 phút). */
  ITEM_DEADLINE_SOON: 'item_deadline_soon',
  /** Mục quá hạn mà chưa nộp (cron 15 phút). */
  ITEM_OVERDUE: 'item_overdue',
  /** Bài của học viên đã chấm xong. */
  ATTEMPT_GRADED: 'attempt_graded',
  /** Buổi học bị huỷ. */
  SESSION_CANCELLED: 'session_cancelled',
  /** Buổi học đổi ngày hoặc giờ (dời lịch gộp 1 thông báo mỗi lớp). */
  SESSIONS_MOVED: 'sessions_moved',
  /** Có buổi học bù mới. */
  SESSION_MAKEUP_ADDED: 'session_makeup_added',
  /** Giáo viên được xếp dạy một buổi (dạy thế hoặc buổi bù). */
  SESSION_TEACHER_ASSIGNED: 'session_teacher_assigned',
  /** Có bài mới cần chấm. */
  GRADING_PENDING: 'grading_pending',
  /** Được chuyển giao chấm bài (R20). */
  GRADING_DELEGATED: 'grading_delegated',
  /** Giáo viên khác sửa giáo trình lớp. */
  CLASS_CURRICULUM_CHANGED: 'class_curriculum_changed',
  /** Nhận xét cuối khoá đã công bố (lớp kết thúc hoặc sửa sau đó – T5.3). */
  FINAL_COMMENT_PUBLISHED: 'final_comment_published',
  // Phụ huynh (Step 13, R19): gửi cho phụ huynh đã liên kết với học viên.
  /** Con có mục quá hạn mà chưa nộp (cron 15 phút). */
  CHILD_ITEM_OVERDUE: 'child_item_overdue',
  /** Bài của con đã chấm xong (kể cả đề tự chấm hết lúc nộp). */
  CHILD_ATTEMPT_GRADED: 'child_attempt_graded',
  /** Chuyên cần của con dưới ngưỡng khi lớp kết thúc. */
  CHILD_ATTENDANCE_LOW: 'child_attendance_low',
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NOTIFICATION_TYPES: readonly NotificationType[] =
  Object.values(NotificationType);

/**
 * Tham số dựng câu chữ ở client. Chỉ dữ liệu hiển thị (tên lớp, tên mục, số
 * lượng, ngày) – không lưu id để tra cứu, id đi trong `link`.
 */
export interface NotificationParams {
  /** Tên lớp học. */
  className?: string;
  /** Tên mục giáo trình, bài học, đề thi hoặc buổi học. */
  title?: string;
  /** Tên người gây ra sự kiện (giáo viên sửa giáo trình, người chuyển giao…). */
  actorName?: string;
  /** Số mục/số buổi khi thông báo gộp. */
  count?: number;
  /** Số thứ tự buổi học (`null`/thiếu = buổi bù). */
  seq?: number | null;
  /** Ngày giờ liên quan (ISO): hạn nộp, ngày buổi học… */
  at?: string;
  /** Điểm phần trăm của lượt đã chấm hoặc tỉ lệ chuyên cần. */
  percent?: number;
  /** Tên con trong thông báo gửi cho phụ huynh (Step 13). */
  childName?: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  params: NotificationParams;
  /** Đường dẫn trong ứng dụng (đã kèm `/t/{slug}`), `null` nếu không có đích. */
  link: string | null;
  /** Tên trung tâm để chuông gộp mọi trung tâm vẫn phân biệt được (R18.2). */
  tenantName: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationList {
  items: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount: number;
}

export interface NotificationUnreadCount {
  unreadCount: number;
}

/** Thông báo cũ hơn số ngày này bị cron hằng ngày xoá (R18.4). */
export const NOTIFICATION_RETENTION_DAYS = 90;

/** Báo "sắp hết hạn" khi hạn nộp còn dưới số giờ này (R18.1). */
export const NOTIFICATION_DEADLINE_SOON_HOURS = 24;

/** Số thông báo mới nhất hiện trong chuông ở header. */
export const NOTIFICATION_BELL_SIZE = 10;
