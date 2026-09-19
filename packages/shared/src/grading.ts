// Chấm bài Writing/Speaking trong dashboard tenant (Step 14).
import type { AttemptStatus, QuestionType } from './exam';
import type { Paginated } from './pagination';

/** Nhận xét cho một câu chấm tay. */
export const GRADING_COMMENT_MAX_LENGTH = 5_000;

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

/** `GET t/:slug/grading/attempts`: kèm danh sách đề có bài để lọc. */
export interface GradingAttemptList extends Paginated<GradingAttemptItem> {
  exams: GradingExamOption[];
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
