// Học bài học ở khu vực chính và chấm tay bài học (req-3 Step 5).
import type {
  AttemptRecording,
  AttemptResponses,
  LearnerExamFilterOption,
} from './attempt';
import type { QuestionType } from './exam';
import type {
  GradingAnswerState,
  GradingAttemptProgress,
  GradingAttemptStatus,
  GradingExamOption,
  GradingSection,
  GradingStudent,
} from './grading';
import type { LessonBlueprintRef } from './lesson-content';
import type { Paginated } from './pagination';

/** `completed`: đã mở mọi section và nộp mọi section có câu hỏi (A7). */
export const LessonAttemptStatus = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;
export type LessonAttemptStatus =
  (typeof LessonAttemptStatus)[keyof typeof LessonAttemptStatus];

/**
 * `open`: đang làm (chưa nộp lần nào hoặc đã bấm "Làm lại"); `submitted`: đang
 * hiện kết quả lần nộp gần nhất.
 */
export const LessonAttemptSectionStatus = {
  OPEN: 'open',
  SUBMITTED: 'submitted',
} as const;
export type LessonAttemptSectionStatus =
  (typeof LessonAttemptSectionStatus)[keyof typeof LessonAttemptSectionStatus];

/** Lượt học của tôi trên version hiện tại của bài. */
export interface LearnerLessonProgress {
  attemptId: string;
  status: LessonAttemptStatus;
  completedAt: string | null;
}

/** Bài học đã publish, hiển thị `tenant`, như học viên thấy. */
export interface LearnerLessonItem {
  id: string;
  title: string;
  description: string | null;
  blueprint: LessonBlueprintRef;
  sectionCount: number;
  questionCount: number;
  publishedAt: string | null;
  myAttempt: LearnerLessonProgress | null;
}

/** `GET t/:slug/learner/lessons`: kèm bộ lọc lấy từ các bài đang publish. */
export interface LearnerLessonList extends Paginated<LearnerLessonItem> {
  categories: LearnerExamFilterOption[];
  blueprints: LearnerExamFilterOption[];
}

/** Một lượt học (mỗi version bài học một lượt). */
export interface LessonAttemptItem {
  id: string;
  lessonVersion: number;
  status: LessonAttemptStatus;
  startedAt: string;
  completedAt: string | null;
  sectionCount: number;
  viewedSectionCount: number;
  /** Số section có câu hỏi / đã nộp ít nhất một lần. */
  questionSectionCount: number;
  submittedSectionCount: number;
  /** Cộng lần nộp gần nhất của mọi section. */
  autoCorrect: number;
  autoTotal: number;
  manualCount: number;
  manualGradedCount: number;
  /** Học tiếp được: lượt của version hiện tại và bài còn mở. */
  canSubmit: boolean;
}

/** `GET t/:slug/learner/lessons/:id`. */
export interface LearnerLessonDetail extends LearnerLessonItem {
  /** `false` khi bài không còn mở (lưu trữ, xoá, chỉ qua lớp) — chỉ xem lại. */
  isOpen: boolean;
  sections: { name: string; questionCount: number }[];
  /** Mới nhất trước. */
  attempts: LessonAttemptItem[];
}

export type LessonQuestionVerdict = 'correct' | 'wrong' | 'manual';

/** Kết quả một câu của lần nộp gần nhất, kèm đáp án. */
export interface LessonQuestionResult {
  number: number;
  qtype: QuestionType;
  verdict: LessonQuestionVerdict;
  /** `AnswerKey` của `@lang/exam-core`; `null` với câu chấm tay. */
  answerKey: unknown;
  maxScore: number;
  /** Chấm tay: `null` khi chưa chấm. */
  score: number | null;
  comment: string | null;
  gradedAt: string | null;
  /** Speaking: dòng câu trả lời có ghi âm đã nộp (nghe lại). */
  recordingAnswerId: string | null;
}

/** Giải thích của section: `blocks` chèn vào chỗ indicator `nodeId` trong nội dung. */
export interface LessonExplanation {
  nodeId: string;
  numbers: number[];
  blocks: unknown[];
}

/** Lần nộp gần nhất của một section: có đáp án và giải thích. */
export interface LessonSectionResult {
  submittedAt: string;
  correct: number;
  total: number;
  manualCount: number;
  manualGradedCount: number;
  responses: AttemptResponses;
  questions: LessonQuestionResult[];
  explanations: LessonExplanation[];
}

/** Ghi âm của lần đang làm (chưa nộp). */
export type LessonDraftRecording = Omit<AttemptRecording, 'answerId'>;

export interface LessonAttemptSectionView {
  id: string;
  name: string;
  questionCount: number;
  status: LessonAttemptSectionStatus;
  viewedAt: string | null;
  submitCount: number;
  /** content_public đã xáo theo lượt học (`ExamValue`, không đáp án/giải thích). */
  content: unknown[];
  /** Câu trả lời đang làm (autosave). */
  responses: AttemptResponses;
  recordings: LessonDraftRecording[];
  /** `null` khi chưa nộp lần nào. */
  result: LessonSectionResult | null;
}

/** `GET t/:slug/learner/lesson-attempts/:id`. */
export interface LessonAttemptView {
  id: string;
  lesson: { id: string; title: string };
  lessonVersion: number;
  status: LessonAttemptStatus;
  startedAt: string;
  completedAt: string | null;
  /** `false`: chỉ xem lại (version cũ hoặc bài không còn mở). */
  canSubmit: boolean;
  sections: LessonAttemptSectionView[];
}

/** `PUT t/:slug/learner/lesson-attempts/:id/sections/:sectionId/view`. */
export interface LessonSectionViewResult {
  status: LessonAttemptStatus;
  completedAt: string | null;
  viewedAt: string | null;
}

// --- Chấm bài học ------------------------------------------------------------

/** Lượt học có section đã nộp chứa câu chấm tay (tính theo lần nộp gần nhất). */
export interface LessonGradingAttemptItem {
  id: string;
  lesson: { id: string; title: string };
  lessonVersion: number;
  student: GradingStudent;
  status: GradingAttemptStatus;
  /** Lần nộp section gần nhất. */
  submittedAt: string | null;
  gradedAt: string | null;
  autoCorrect: number;
  autoTotal: number;
  manualCount: number;
  manualGradedCount: number;
}

/** `GET t/:slug/grading/lesson-attempts`: kèm danh sách bài học để lọc. */
export interface LessonGradingAttemptList extends Paginated<LessonGradingAttemptItem> {
  lessons: GradingExamOption[];
}

/** `GET t/:slug/grading/lesson-attempts/:id`. */
export interface LessonGradingAttemptDetail extends LessonGradingAttemptItem {
  startedAt: string;
  /** Section đã nộp có câu chấm tay (lần nộp gần nhất). */
  sections: GradingSection[];
  nextAttemptId: string | null;
}

/** `PUT t/:slug/grading/lesson-answers/:answerId`. */
export interface LessonGradeAnswerResult {
  answer: GradingAnswerState;
  attempt: GradingAttemptProgress;
}
