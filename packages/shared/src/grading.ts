// Chấm bài Writing/Speaking trong dashboard tenant (Step 14).
import type { AttemptStatus, QuestionType } from './exam';
import type { Paginated } from './pagination';

/** Nhận xét cho một câu chấm tay. */
export const GRADING_COMMENT_MAX_LENGTH = 5_000;

/** Trang Chấm bài làm việc với hai loại bài: đề thi và bài học. */
export const GradingKind = {
  EXAM: 'exam',
  LESSON: 'lesson',
} as const;
export type GradingKind = (typeof GradingKind)[keyof typeof GradingKind];

/** Trạng thái lọc ở trang Chấm bài: chỉ lượt làm đã nộp hết. */
export type GradingAttemptStatus = Exclude<AttemptStatus, 'in_progress'>;

export interface GradingStudent {
  userId: string;
  fullName: string;
  email: string;
}

/** Một lượt làm có câu chấm tay (đã nộp hết). */
export interface GradingAttemptItem {
  id: string;
  exam: { id: string; title: string };
  student: GradingStudent;
  /** Mục giáo trình lớp sinh ra bài làm; `null` = bài làm tự do (req-3 Step 10). */
  classItem: GradingClassItemRef | null;
  status: GradingAttemptStatus;
  submittedAt: string | null;
  gradedAt: string | null;
  autoCorrect: number;
  autoTotal: number;
  manualCount: number;
  manualGradedCount: number;
}

export interface GradingExamOption {
  id: string;
  title: string;
}

/** Mục lớp của một bài làm (hiện ở cột Lớp/Mục trang Chấm bài). */
export interface GradingClassItemRef {
  itemId: string;
  itemTitle: string;
  classroomId: string;
  classroomCode: string;
  classroomName: string;
}

/** `GET t/:slug/grading/attempts`: kèm các giá trị lọc lấy từ bài mình chấm được. */
export interface GradingAttemptList extends Paginated<GradingAttemptItem> {
  exams: GradingExamOption[];
  /** Lớp có bài mình chấm được (req-3 Step 10). */
  classes: GradingClassOption[];
  /** Mục giáo trình của các lớp trên; lọc theo lớp đang chọn ở client. */
  classItems: GradingClassItemOption[];
}

/** Một câu Writing/Speaking trong bài cần chấm. */
export interface GradingQuestion {
  answerId: string;
  number: number;
  qtype: QuestionType;
  maxScore: number;
  /** Speaking: thời gian ghi tối đa (giây). */
  seconds: number | null;
  /** Writing: số ký tự tối đa. */
  maxChars: number | null;
  /** Vị trí part chứa câu trong `GradingSection.parts`; `null` khi không thuộc part nào. */
  partIndex: number | null;
  /** Đề bài: hướng dẫn subpart ngay trước câu + nội dung câu (`ExamValue`, không đáp án). */
  prompt: unknown[];
  /** Giải thích gắn với câu (mỗi phần tử là một `ExamValue`), chỉ người chấm thấy. */
  explanations: unknown[][];
  /** Bài viết; `null` khi bỏ trống hoặc là câu Speaking. */
  text: string | null;
  hasRecording: boolean;
  /** `null` khi chưa chấm. */
  score: number | null;
  comment: string | null;
  gradedAt: string | null;
  grader: { id: string; fullName: string } | null;
}

export interface GradingSection {
  id: string;
  name: string;
  /** Số câu chấm tự động đúng / tổng (chỉ để tham khảo, không sửa được). */
  correct: number;
  total: number;
  autoSubmitted: boolean;
  submittedAt: string | null;
  /** Passage của từng part trong section (`ExamValue`), đọc theo `partIndex`. */
  parts: unknown[][];
  questions: GradingQuestion[];
}

export interface GradingAttemptProgress {
  status: GradingAttemptStatus;
  gradedAt: string | null;
  manualCount: number;
  manualGradedCount: number;
}

/** `GET t/:slug/grading/attempts/:id`. */
export interface GradingAttemptDetail extends GradingAttemptItem {
  startedAt: string;
  /** Chỉ những section có câu chấm tay. */
  sections: GradingSection[];
  /** Bài chờ chấm kế tiếp (nộp sớm nhất) mà người chấm được chấm. */
  nextAttemptId: string | null;
}

export interface GradeAnswerInput {
  score: number;
  comment?: string | null;
}

/** Phần điểm của một câu sau khi lưu. */
export type GradingAnswerState = Pick<
  GradingQuestion,
  'answerId' | 'score' | 'comment' | 'gradedAt' | 'grader'
>;

/** `PUT t/:slug/grading/answers/:answerId`. */
export interface GradeAnswerResult {
  answer: GradingAnswerState;
  attempt: GradingAttemptProgress;
}

// --- Chuyển giao chấm (req-3 Step 10) ----------------------------------------

/**
 * Phạm vi một lượt chuyển giao chấm (plan mục 4.7). `exam`/`lesson` chỉ áp
 * dụng cho **bài làm tự do** của đề/bài đó (đúng bằng quyền của người soạn,
 * R20.2); bài làm trong lớp giao theo `class_item` hoặc theo từng lượt.
 */
export const GradingScopeType = {
  /** Một mục đề thi/bài học của giáo trình lớp. */
  CLASS_ITEM: 'class_item',
  /** Bài làm tự do của một đề thi. */
  EXAM: 'exam',
  /** Lượt học tự do của một bài học. */
  LESSON: 'lesson',
  EXAM_ATTEMPT: 'exam_attempt',
  LESSON_ATTEMPT: 'lesson_attempt',
} as const;
export type GradingScopeType =
  (typeof GradingScopeType)[keyof typeof GradingScopeType];

export const GRADING_SCOPE_TYPES: readonly GradingScopeType[] =
  Object.values(GradingScopeType);

/** Người được chuyển giao (Teacher của trung tâm). */
export interface GradingDelegateRef {
  membershipId: string;
  userId: string;
  fullName: string;
  email: string;
}

/** Một dòng `grading_delegations`. */
export interface GradingDelegation {
  id: string;
  scopeType: GradingScopeType;
  scopeId: string;
  /** Tên phạm vi để hiện ở danh sách (mục lớp, đề thi, bài học, lượt làm). */
  scopeTitle: string;
  delegate: GradingDelegateRef;
  createdBy: { id: string; fullName: string } | null;
  createdAt: string;
}

/** Phạm vi mà người đang xem giao được cho một lượt làm cụ thể. */
export interface GradingDelegationTarget {
  scopeType: GradingScopeType;
  scopeId: string;
  /** Chữ hiện ở ô chọn phạm vi (vd. "Mục: Kiểm tra chương 1 – lớp N5-2026-01"). */
  title: string;
}

/** `GET t/:slug/grading/delegations?attemptId=&kind=`. */
export interface GradingDelegationBox {
  /** Rỗng = người đang xem không được chuyển giao lượt này. */
  targets: GradingDelegationTarget[];
  /** Chuyển giao đang có trên các phạm vi ở `targets`. */
  delegations: GradingDelegation[];
}

/** `POST t/:slug/grading/delegations`. */
export interface CreateGradingDelegationInput {
  scopeType: GradingScopeType;
  scopeId: string;
  delegateMembershipIds: string[];
}

/** Giá trị lọc "bài làm tự do" ở ô lọc lớp của trang Chấm bài. */
export const GRADING_FREE_FILTER = 'free';

export interface GradingClassOption {
  id: string;
  code: string;
  name: string;
}

/** Mục giáo trình lớp có bài cần chấm (ô lọc "Mục"). */
export interface GradingClassItemOption {
  id: string;
  classroomId: string;
  title: string;
}
