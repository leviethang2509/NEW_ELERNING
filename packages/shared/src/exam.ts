export const ExamStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;
export type ExamStatus = (typeof ExamStatus)[keyof typeof ExamStatus];

/** Chỉ các section thuộc `exams.current_version` là `active`. */
export const ExamSectionStatus = {
  ACTIVE: 'active',
  DEACTIVATED: 'deactivated',
} as const;
export type ExamSectionStatus =
  (typeof ExamSectionStatus)[keyof typeof ExamSectionStatus];

/** `submitted`: đã nộp nhưng còn câu chấm tay; `graded`: đã có đủ kết quả. */
export const AttemptStatus = {
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
} as const;
export type AttemptStatus = (typeof AttemptStatus)[keyof typeof AttemptStatus];

export const AttemptSectionStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
} as const;
export type AttemptSectionStatus =
  (typeof AttemptSectionStatus)[keyof typeof AttemptSectionStatus];

/** Speaking/Writing chấm tay, còn lại chấm tự động. */
export const QuestionGrading = {
  AUTO: 'auto',
  MANUAL: 'manual',
} as const;
export type QuestionGrading =
  (typeof QuestionGrading)[keyof typeof QuestionGrading];

/** Dạng câu hỏi: `qtype` của indicator trong nội dung Plate và `exam_questions.qtype`. */
export const QuestionType = {
  MC_SINGLE: 'mc-single',
  MC_MULTI: 'mc-multi',
  PICK_N: 'pick-n',
  MATCHING: 'matching',
  TFNG: 'tfng',
  YNNG: 'ynng',
  FILL_BLANK: 'fill-blank',
  ORDERING: 'ordering',
  POLYTOMOUS: 'polytomous',
  SPEAKING: 'speaking',
  WRITING: 'writing',
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

/** `exam_parts.kind`. */
export const ExamPartKind = {
  PART: 'part',
  SUBPART: 'subpart',
} as const;
export type ExamPartKind = (typeof ExamPartKind)[keyof typeof ExamPartKind];

// Duration của module (tham khảo) và section (thực tế): phút, bội số 5, tối đa 180.
export const DURATION_STEP_MINUTES = 5;
export const DURATION_MAX_MINUTES = 180;
export const DURATION_OPTIONS_MINUTES: readonly number[] = Array.from(
  { length: DURATION_MAX_MINUTES / DURATION_STEP_MINUTES },
  (_, i) => (i + 1) * DURATION_STEP_MINUTES,
);

export function isValidDurationMinutes(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= DURATION_STEP_MINUTES &&
    value <= DURATION_MAX_MINUTES &&
    value % DURATION_STEP_MINUTES === 0
  );
}

// Điểm chấm tay Writing/Speaking.
export const MANUAL_SCORE_MAX = 10;
export const MANUAL_SCORE_STEP = 0.5;
