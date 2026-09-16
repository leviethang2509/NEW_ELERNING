// Làm bài thi ở khu vực chính và kết quả (Step 13).
import type { AttemptSectionStatus, AttemptStatus, QuestionType } from './exam';
import type { ExamBlueprintRef } from './exam-content';
import type { Paginated } from './pagination';

/**
 * Sau `deadline_at` server vẫn nhận câu trả lời/nộp bài thêm chừng này giây
 * (trễ mạng); quá mốc này section bị chốt với câu trả lời đã lưu.
 */
export const ATTEMPT_GRACE_SECONDS = 10;

/** Ghi âm Speaking: tối đa mỗi file. */
export const RECORDING_MAX_BYTES = 10 * 1024 * 1024;

/** Chrome/Firefox/Edge ghi `audio/webm` (opus), Safari chỉ ghi `audio/mp4`. */
export const RECORDING_MIME_TYPES: readonly string[] = [
  'audio/webm',
  'audio/mp4',
];

/** Giới hạn câu trả lời gửi lên (chặn request bất thường). */
export const RESPONSE_TEXT_MAX_LENGTH = 20_000;
export const RESPONSE_MAX_ENTRIES = 1_000;

/**
 * Câu trả lời của một section, cùng dạng `Responses` của `@lang/exam-core`:
 * khoá là số câu (JSON nên thành chuỗi).
 */
export interface AttemptResponses {
  value: Record<number, string>;
  picks: Record<number, number[]>;
  order: Record<number, number[]>;
}

/** Đề đã publish, như học viên thấy (số liệu theo version hiện tại). */
export interface LearnerExamItem {
  id: string;
  title: string;
  description: string | null;
  blueprint: ExamBlueprintRef;
  sectionCount: number;
  questionCount: number;
  totalDurationMinutes: number;
  publishedAt: string | null;
}

export interface LearnerExamFilterOption {
  id: string;
  name: string;
  /** Loại đề: danh mục chứa nó (để lọc theo danh mục đã chọn). */
  categoryId?: string;
}

/** `GET t/:slug/learner/exams`: kèm bộ lọc lấy từ các đề đang publish. */
export interface LearnerExamList extends Paginated<LearnerExamItem> {
  categories: LearnerExamFilterOption[];
  blueprints: LearnerExamFilterOption[];
}

export interface LearnerExamSection {
  name: string;
  durationMinutes: number;
  questionCount: number;
}

/** Một lượt làm trong lịch sử. Số câu đúng chỉ có khi đã nộp hết. */
export interface LearnerAttemptItem {
  id: string;
  exam: { id: string; title: string };
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  sectionCount: number;
  submittedSectionCount: number;
  autoCorrect: number;
  autoTotal: number;
  manualCount: number;
  manualGradedCount: number;
}

/** `GET t/:slug/learner/exams/:id`. */
export interface LearnerExamDetail extends LearnerExamItem {
  /** `false` khi đề không còn publish (lưu trữ/xoá) — chỉ xem lịch sử. */
  isOpen: boolean;
  sections: LearnerExamSection[];
  /** Lượt đang làm dở của tôi (mỗi đề tối đa 1). */
  inProgressAttemptId: string | null;
  attempts: LearnerAttemptItem[];
}

export interface AttemptSectionSummary {
  id: string;
  name: string;
  durationMinutes: number;
  questionCount: number;
  status: AttemptSectionStatus;
  startedAt: string | null;
  deadlineAt: string | null;
  submittedAt: string | null;
  autoSubmitted: boolean;
}

/** Ghi âm đã tải lên cho một câu Speaking. */
export interface AttemptRecording {
  answerId: string;
  number: number;
  uploadedAt: string;
}

/**
 * Section đang tới lượt (section đầu tiên chưa nộp). Chưa bắt đầu thì chỉ có
 * phần hướng dẫn; đang làm thì có nội dung (không đáp án) và câu trả lời đã lưu.
 */
export type AttemptCurrentSection =
  | {
      sectionId: string;
      status: typeof AttemptSectionStatus.NOT_STARTED;
      /** Nội dung đứng trước indicator đầu tiên (`ExamValue`). */
      intro: unknown[];
    }
  | {
      sectionId: string;
      status: typeof AttemptSectionStatus.IN_PROGRESS;
      /** content_public đã xáo theo lượt làm (`ExamValue`). */
      content: unknown[];
      responses: AttemptResponses;
      recordings: AttemptRecording[];
    };

/** `GET t/:slug/learner/attempts/:id`. */
export interface AttemptView {
  id: string;
  exam: { id: string; title: string };
  status: AttemptStatus;
  /** Giờ server lúc trả lời, để client bù lệch đồng hồ khi đếm ngược. */
  serverNow: string;
  sections: AttemptSectionSummary[];
  /** `null` khi đã nộp hết. */
  current: AttemptCurrentSection | null;
}

export interface SaveAttemptResponsesInput {
  responses: AttemptResponses;
}

export interface SaveAttemptResponsesResult {
  savedAt: string;
}

/** Nộp section: gửi kèm câu trả lời mới nhất (nhận nếu còn trong hạn). */
export interface SubmitAttemptSectionInput {
  responses?: AttemptResponses;
}

/** Câu chấm tay trong kết quả: chưa chấm thì `score` là `null`. */
export interface AttemptResultManualItem {
  number: number;
  qtype: QuestionType;
  maxScore: number;
  score: number | null;
  comment: string | null;
  gradedAt: string | null;
}

export interface AttemptResultSection {
  id: string;
  name: string;
  /** Số câu chấm tự động đúng / tổng số câu chấm tự động. */
  correct: number;
  total: number;
  autoSubmitted: boolean;
  submittedAt: string | null;
  manual: AttemptResultManualItem[];
}

/** `GET t/:slug/learner/attempts/:id/result`: không có đáp án, không có đúng/sai từng câu. */
export interface AttemptResult {
  id: string;
  exam: { id: string; title: string };
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  gradedAt: string | null;
  autoCorrect: number;
  autoTotal: number;
  manualCount: number;
  manualGradedCount: number;
  sections: AttemptResultSection[];
}
