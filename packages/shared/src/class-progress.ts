// Học viên trong lớp (req-3 Step 9; plan mục 1.2, 5, 7): điểm %, đậu/trượt,
// nhóm thi lại và điều kiện vào từng mục của giáo trình lớp. Hàm thuần dùng
// chung cho API (chặn bắt đầu lượt) và UI (nhãn trạng thái).
import { ClassroomStatus } from './classroom';
import type { ClassroomRef } from './classroom';
import { MANUAL_SCORE_MAX } from './exam';
import type { ExamUserRef } from './exam-content';
import type { LearnerLessonProgress } from './lesson-attempt';
import type {
  ClassSessionKind,
  ClassSessionStatus,
  SessionPersonRef,
} from './schedule';
import { CurriculumItemType } from './training';
import type {
  CourseRef,
  CurriculumContentRef,
  CurriculumItemLabel,
} from './training';

/** Số liệu chấm của một lượt thi, đủ để tính điểm %. */
export interface AttemptScoreInput {
  /** Số câu chấm tự động đúng (mỗi câu 1 điểm). */
  autoCorrect: number;
  /** Tổng số câu chấm tự động. */
  autoTotal: number;
  /** Tổng điểm các câu chấm tay đã chấm (mỗi câu 0–10). */
  manualScore: number;
  /** Tổng số câu chấm tay của đề. */
  manualCount: number;
}

/**
 * Điểm % của một lượt thi (R8.1): `(câu tự chấm đúng + tổng điểm chấm tay) /
 * (số câu tự chấm + số câu chấm tay × 10) × 100`, làm tròn 1 chữ số thập phân.
 * Đề không có câu nào chấm được → `null`.
 */
export function attemptScorePercent({
  autoCorrect,
  autoTotal,
  manualScore,
  manualCount,
}: AttemptScoreInput): number | null {
  const max = autoTotal + manualCount * MANUAL_SCORE_MAX;
  if (max <= 0) return null;
  return Math.round(((autoCorrect + manualScore) / max) * 1000) / 10;
}

/** Trạng thái lượt thi của một mục lớp với học viên. */
export const ClassAttemptState = {
  /** Đang làm dở. */
  IN_PROGRESS: 'in_progress',
  /** Đã nộp hết nhưng còn câu chấm tay chưa chấm → chưa biết điểm (T3.1). */
  PENDING_GRADING: 'pending_grading',
  /** Đã chấm xong, có điểm %. */
  GRADED: 'graded',
} as const;
export type ClassAttemptState =
  (typeof ClassAttemptState)[keyof typeof ClassAttemptState];

/** Lượt thi của học viên trên một mục đề thi của lớp (bỏ lượt đã "Cho làm lại"). */
export interface ClassAttemptSummary {
  id: string;
  state: ClassAttemptState;
  startedAt: string;
  /** Lúc nộp xong section cuối. */
  submittedAt: string | null;
  /** `null` khi chưa chấm xong. */
  percent: number | null;
  /** Điểm đạt ngưỡng của **mục sinh ra lượt này** (R8.2); `null` khi chưa chấm xong. */
  passed: boolean | null;
}

/**
 * Một mục đề thi trong nhóm thi, theo thứ tự lần 1 (mục gốc), lần 2… (giả định
 * 7: mục thi lại luôn đứng sau mục gốc trong giáo trình).
 */
export interface ExamGroupMember {
  itemId: string;
  passThreshold: number;
  attempt: ClassAttemptSummary | null;
}

/** Kết quả nhóm thi của một học viên (R7.4, T3). */
export interface ExamGroupResult {
  /** Điểm cao nhất trong các lượt **đã chấm xong**; `null` khi chưa có lượt nào. */
  bestPercent: number | null;
  /** Đậu nhóm: có ≥ 1 lượt đạt ngưỡng của mục sinh ra lượt đó (T3.3). */
  passed: boolean;
  /** Còn lượt đã nộp nhưng chưa chấm xong → điểm còn có thể tăng. */
  hasPending: boolean;
}

export function examGroupResult(
  members: readonly ExamGroupMember[],
): ExamGroupResult {
  let bestPercent: number | null = null;
  let passed = false;
  let hasPending = false;
  for (const member of members) {
    const attempt = member.attempt;
    if (!attempt) continue;
    if (attempt.state === ClassAttemptState.PENDING_GRADING) hasPending = true;
    if (attempt.state !== ClassAttemptState.GRADED) continue;
    if (attempt.percent !== null) {
      bestPercent =
        bestPercent === null
          ? attempt.percent
          : Math.max(bestPercent, attempt.percent);
    }
    if (attempt.passed) passed = true;
  }
  return { bestPercent, passed, hasPending };
}

/**
 * Lần thi lại có bắt buộc với học viên này không (T2.1–T2.3): đã đậu ở một lần
 * **trước đó** trong nhóm thì lần này không bắt buộc (không tính chuyên cần,
 * không hiện "quá hạn"), vẫn thi được để cải thiện điểm. Mục gốc luôn bắt buộc.
 */
export function isGroupMemberRequired(
  members: readonly ExamGroupMember[],
  itemId: string,
): boolean {
  const index = members.findIndex((member) => member.itemId === itemId);
  if (index <= 0) return true;
  return !members
    .slice(0, index)
    .some((member) => member.attempt?.passed === true);
}

/** Lý do mục của lớp chưa vào được. */
export const ClassItemLock = {
  /** Lớp chưa bắt đầu hoặc đã kết thúc/huỷ (giả định 3). */
  CLASSROOM: 'classroom',
  /** Chưa tới ngày mở của mục hoặc của chương (R9). */
  NOT_OPEN: 'not_open',
  /** Đề thi đã qua deadline và mục không nhận bài quá hạn (R10.1). */
  DEADLINE: 'deadline',
  /** Mục đề thi đã có lượt thi — mỗi mục làm 1 lần (E4.3). */
  DONE: 'done',
  /** Bài học/đề thi đã bị xoá (lưu trữ vẫn học được — người dùng chốt Step 9). */
  CONTENT: 'content',
} as const;
export type ClassItemLock = (typeof ClassItemLock)[keyof typeof ClassItemLock];

export interface ClassItemGateInput {
  classroomStatus: ClassroomStatus;
  itemType: CurriculumItemType;
  /** Mốc mở hiệu lực (đã gộp ngày mở của chương qua `effectiveOpensAt`). */
  opensAt: string | null;
  /** Đề thi: hạn **bắt đầu** lượt thi (R10.3). */
  deadlineAt: string | null;
  acceptLate: boolean;
  /** Đề thi: học viên đã có lượt chưa bị "Cho làm lại". */
  hasAttempt: boolean;
  /** Bài học/đề thi còn tồn tại (chưa xoá mềm). */
  contentAvailable: boolean;
}

/**
 * Vào được mục không: `null` = vào được. Thứ tự kiểm theo mức độ "cứng": lớp →
 * nội dung → ngày mở → đã làm → deadline.
 */
export function classItemLock(
  input: ClassItemGateInput,
  now: Date,
): ClassItemLock | null {
  if (input.classroomStatus !== ClassroomStatus.ONGOING) {
    return ClassItemLock.CLASSROOM;
  }
  if (!input.contentAvailable) return ClassItemLock.CONTENT;
  if (input.opensAt !== null && now.getTime() < Date.parse(input.opensAt)) {
    return ClassItemLock.NOT_OPEN;
  }
  const isExam = input.itemType === CurriculumItemType.EXAM;
  if (isExam && input.hasAttempt) return ClassItemLock.DONE;
  if (
    isExam &&
    !input.acceptLate &&
    input.deadlineAt !== null &&
    now.getTime() > Date.parse(input.deadlineAt)
  ) {
    return ClassItemLock.DEADLINE;
  }
  return null;
}

/**
 * Mốc mở hiệu lực khi cả chương và mục đều đặt ngày mở: lấy mốc **muộn hơn**
 * (người dùng chốt Step 9) — cả hai phải qua thì mục mới vào được.
 */
export function effectiveOpensAt(
  groupOpensAt: string | null,
  itemOpensAt: string | null,
): string | null {
  if (groupOpensAt === null) return itemOpensAt;
  if (itemOpensAt === null) return groupOpensAt;
  return Date.parse(groupOpensAt) >= Date.parse(itemOpensAt)
    ? groupOpensAt
    : itemOpensAt;
}

// ---------------------------------------------------------------------------
// Kiểu dữ liệu API khu vực học viên

/** Buổi học rút gọn trên trang lớp của học viên. */
export interface LearnerSessionRef {
  id: string;
  kind: ClassSessionKind;
  seq: number | null;
  startsAt: string;
  endsAt: string;
  status: ClassSessionStatus;
  /** Phòng/link hiệu lực (buổi, không có thì của lớp). */
  location: string | null;
}

/** `GET t/:slug/learner/classes`: lớp mình đang học. */
export interface LearnerClassItem extends ClassroomRef {
  course: CourseRef;
  startDate: string;
  endDate: string | null;
  location: string | null;
  teachers: ExamUserRef[];
  studentCount: number;
  /** Số mục đang hiện trong giáo trình lớp. */
  itemCount: number;
  /** Mục đã học xong / đã thi (nhóm thi tính theo mục). */
  doneCount: number;
  /** Buổi kế tiếp chưa diễn ra và chưa huỷ; `null` khi hết buổi. */
  nextSession: LearnerSessionRef | null;
}

/** Một mục giáo trình lớp như học viên thấy. */
export interface LearnerClassItemView {
  id: string;
  itemType: CurriculumItemType;
  /** Tên hiển thị (đã lấy tên bài học/đề khi mục không đặt tên riêng). */
  title: string;
  label: CurriculumItemLabel;
  note: string | null;
  content: CurriculumContentRef;
  /** Mốc mở hiệu lực (đã gộp ngày mở của chương). */
  opensAt: string | null;
  deadlineAt: string | null;
  acceptLate: boolean;
  passThreshold: number;
  /** Mục gốc khi là lần thi lại. */
  retakeOfItemId: string | null;
  /** Lần thứ mấy trong nhóm thi (1 = mục gốc); `null` = mục bài học. */
  attemptIndex: number | null;
  /** `false` = lần thi lại không bắt buộc vì đã đậu lần trước (T2.4). */
  required: boolean;
  /** `null` = vào được. */
  lock: ClassItemLock | null;
  /** Buổi học có map mục hoặc chương của mục (R17). */
  sessions: LearnerSessionRef[];
  /** Mục đề thi: lượt của tôi (bỏ lượt đã "Cho làm lại"). */
  attempt: ClassAttemptSummary | null;
  /** Mục bài học: lượt học của tôi trên version hiện tại của bài. */
  lessonAttempt: LearnerLessonProgress | null;
  /** Mục bài học: đã học xong ở **bất kỳ** version nào (giả định 2). */
  lessonCompletedAt: string | null;
}

export interface LearnerClassGroupView {
  id: string;
  title: string;
  opensAt: string | null;
  items: LearnerClassItemView[];
}

/** Kết quả nhóm thi hiện trên trang lớp (gộp mục gốc + các lần thi lại). */
export interface LearnerExamGroupView extends ExamGroupResult {
  rootItemId: string;
  title: string;
  /** Mục gốc trước, rồi các lần thi lại theo thứ tự giáo trình. */
  itemIds: string[];
}

/** `GET t/:slug/learner/classes/:id`. */
export interface LearnerClassDetail extends LearnerClassItem {
  description: string | null;
  /** Vào học/làm bài được: lớp `ongoing` và mình còn trong lớp. */
  isOpen: boolean;
  /** Mục chưa xếp chương, hiện ở đầu (giả định 5). */
  ungrouped: LearnerClassItemView[];
  groups: LearnerClassGroupView[];
  /** Nhóm có ≥ 2 mục (mục gốc + lần thi lại). */
  examGroups: LearnerExamGroupView[];
  /** Buổi sắp tới, sớm nhất trước. */
  upcomingSessions: LearnerSessionRef[];
}

/** `POST t/:slug/learner/classes/:id/items/:itemId/start`. */
export interface StartClassItemResult {
  itemType: CurriculumItemType;
  /** Lượt thi (`exam`) hoặc lượt học (`lesson`) để chuyển trang. */
  attemptId: string;
}

/**
 * `GET t/:slug/classes/:id/items/:itemId/attempts`: lượt thi của học viên trên
 * một mục đề thi (giáo viên của lớp dùng để "Cho làm lại").
 */
export interface ClassItemAttemptRow extends ClassAttemptSummary {
  student: SessionPersonRef;
  /** Đã "Cho làm lại": giữ lịch sử, không tính điểm/nhóm thi (giả định 8). */
  voidedAt: string | null;
}

/** `POST t/:slug/classes/:id/items/:itemId/void/:attemptId`. */
export interface VoidClassAttemptResult {
  attemptId: string;
  voidedAt: string;
}
