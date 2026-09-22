// Khu vực phụ huynh "Con của tôi" (req-3 Step 13; R19, D12): phụ huynh đã liên
// kết với học viên qua `student_guardians` xem lớp, lịch, giáo trình + trạng
// thái từng mục và kết quả của con. Không xem nội dung bài học/đề thi, không
// xem đáp án và không làm bài thay con (R19.2).
import type { AttemptStatus } from './exam';
import type { LearnerClassDetail, LearnerClassItem } from './class-progress';
import type { LessonAttemptStatus } from './lesson-attempt';

/** Số lượt làm tự do mới nhất của con hiện trên trang tổng quan. */
export const CHILD_FREE_ATTEMPT_LIMIT = 20;

/** Một người con đã liên kết với phụ huynh đang đăng nhập. */
export interface GuardianChild {
  /** Membership của con trong trung tâm (khoá của mọi route phụ huynh). */
  membershipId: string;
  fullName: string;
  email: string;
  /** Quan hệ do trung tâm nhập ("Mẹ", "Bố"…); `null` khi bỏ trống. */
  relationship: string | null;
  /** Membership của con đã ngừng hoạt động (vẫn xem được kết quả cũ). */
  inactive: boolean;
  /** Số lớp con còn là học viên. */
  classCount: number;
}

/**
 * Một câu chấm tay của con: điểm và nhận xét của giáo viên (R19.1). Không kèm
 * đề bài, câu trả lời hay đáp án vì phụ huynh không xem nội dung đề (R19.2).
 */
export interface ChildManualAnswer {
  /** Tên phần chứa câu (số câu đánh lại từ 1 ở mỗi phần). */
  sectionName: string;
  number: number;
  score: number | null;
  maxScore: number;
  comment: string | null;
  gradedAt: string | null;
}

/** Nhận xét chấm tay theo lượt thi/lượt học; khoá là id của lượt. */
export type ChildManualAnswers = Record<string, ChildManualAnswer[]>;

/** Lượt thi tự do (ngoài lớp) của con. */
export interface ChildExamAttempt {
  id: string;
  title: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  autoCorrect: number;
  autoTotal: number;
  manualCount: number;
  manualGradedCount: number;
  /** Điểm % khi đã chấm xong; `null` khi chưa chấm xong. */
  percent: number | null;
}

/** Lượt học bài học tự do (ngoài lớp) của con. */
export interface ChildLessonAttempt {
  id: string;
  title: string;
  status: LessonAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  completedAt: string | null;
  autoCorrect: number;
  autoTotal: number;
  manualCount: number;
  manualGradedCount: number;
}

/** `GET t/:slug/children/:membershipId`. */
export interface ChildOverview {
  child: GuardianChild;
  /** Lớp con còn là học viên (như con thấy ở "Lớp của tôi"). */
  classes: LearnerClassItem[];
  examAttempts: ChildExamAttempt[];
  lessonAttempts: ChildLessonAttempt[];
  manualAnswers: ChildManualAnswers;
}

/**
 * `GET t/:slug/children/:membershipId/classes/:classId`: đúng dữ liệu con thấy
 * ở trang lớp (kể cả `summary` chỉ có khi lớp đã kết thúc – R11.3), kèm nhận
 * xét chấm tay của từng lượt.
 */
export interface ChildClassDetail {
  child: GuardianChild;
  classroom: LearnerClassDetail;
  manualAnswers: ChildManualAnswers;
}
