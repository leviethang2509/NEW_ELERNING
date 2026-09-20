// Học viên trong lớp (req-3 Step 9; plan mục 1.2, 5, 7): điểm %, đậu/trượt,
// nhóm thi lại và điều kiện vào từng mục của giáo trình lớp. Hàm thuần dùng
// chung cho API (chặn bắt đầu lượt) và UI (nhãn trạng thái).
import { ClassroomStatus } from './classroom';
import type { ClassroomRef } from './classroom';
import { MANUAL_SCORE_MAX } from './exam';
import type { ExamUserRef } from './exam-content';
import type {
  LearnerLessonProgress,
  LessonAttemptStatus,
  LessonSectionResult,
} from './lesson-attempt';
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
  /** Chuyên cần, trung bình chương, nhận xét — chỉ khi lớp `finished` (R11.3). */
  summary: LearnerClassSummary | null;
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

// ---------------------------------------------------------------------------
// Bài làm của học viên dưới góc nhìn giáo viên (req-3 Step 10, F4)

/** Học viên của lớp trong trang bài làm chi tiết (F4). */
export interface ClassStudentRef extends ExamUserRef {
  membershipId: string;
  email: string;
}

/** Một lượt thi của học viên trên một mục, kể cả lượt đã "Cho làm lại". */
export interface ClassStudentAttemptRow extends ClassAttemptSummary {
  voidedAt: string | null;
  /** Xem được chi tiết câu trả lời (đã nộp ít nhất một phần). */
  canReview: boolean;
}

/** Lượt học của học viên trên một mục bài học. */
export interface ClassStudentLessonRow {
  attemptId: string;
  lessonVersion: number;
  status: LessonAttemptStatus;
  completedAt: string | null;
  autoCorrect: number;
  autoTotal: number;
  manualCount: number;
  manualGradedCount: number;
  /** Đã nộp ít nhất một phần → xem được chi tiết câu trả lời. */
  canReview: boolean;
}

/** Một mục giáo trình lớp trong trang bài làm của học viên. */
export interface ClassStudentItemView {
  id: string;
  itemType: CurriculumItemType;
  title: string;
  label: CurriculumItemLabel;
  /** Chương chứa mục; `null` = chưa xếp chương. */
  groupTitle: string | null;
  opensAt: string | null;
  deadlineAt: string | null;
  passThreshold: number;
  /** Lần thứ mấy trong nhóm thi (1 = mục gốc); `null` = mục bài học. */
  attemptIndex: number | null;
  /** `false` = lần thi lại không bắt buộc vì đã đậu lần trước (T2.4). */
  required: boolean;
  /** Mục đã bị bỏ khỏi giáo trình lớp nhưng còn bài làm (E3). */
  removed: boolean;
  /** Mục đề thi: mọi lượt, mới nhất trước. */
  attempts: ClassStudentAttemptRow[];
  /** Mục bài học: lượt trên version hiện tại của bài. */
  lessonAttempt: ClassStudentLessonRow | null;
}

/** `GET t/:slug/classes/:id/students/:membershipId/attempts`. */
export interface ClassStudentAttempts {
  classroom: ClassroomRef;
  student: ClassStudentRef;
  /** Học viên đã bị xoá khỏi lớp (vẫn xem được bài làm cũ). */
  removed: boolean;
  /** Mục chưa xếp chương trước, rồi từng chương theo thứ tự giáo trình. */
  items: ClassStudentItemView[];
  /** Nhóm có ≥ 2 mục (mục gốc + lần thi lại). */
  examGroups: LearnerExamGroupView[];
}

/** Một phần của bài làm khi giáo viên xem lại (F4). */
export interface AttemptReviewSection {
  id: string;
  name: string;
  /** content_public đã xáo theo lượt (`ExamValue`, không đáp án). */
  content: unknown[];
  /** Câu trả lời + đúng/sai + đáp án + giải thích; `null` khi chưa nộp. */
  result: LessonSectionResult | null;
}

/**
 * `GET t/:slug/classes/:id/students/:membershipId/attempts/:attemptId`
 * (và `…/lesson-attempts/:attemptId`): bài làm của học viên với đáp án và
 * đúng/sai từng câu, chỉ giáo viên của lớp và Owner/Admin xem (F4).
 */
export interface AttemptReview {
  id: string;
  itemType: CurriculumItemType;
  /** Tên đề thi / bài học. */
  title: string;
  /** Tên mục trong giáo trình lớp. */
  itemTitle: string;
  student: ClassStudentRef;
  startedAt: string;
  submittedAt: string | null;
  /** `null` khi chưa chấm xong (đề thi) hoặc là lượt học. */
  percent: number | null;
  passed: boolean | null;
  voidedAt: string | null;
  autoCorrect: number;
  autoTotal: number;
  manualCount: number;
  manualGradedCount: number;
  sections: AttemptReviewSection[];
}

// ---------------------------------------------------------------------------
// Chuyên cần (req-3 Step 11; R11, T1, T2, E7)

/** Trạng thái chuyên cần của một học viên trên một mục đề thi có deadline. */
export const AttendanceMark = {
  /** Bắt đầu lượt trước hạn và đã nộp → 1 điểm. */
  ON_TIME: 'on_time',
  /** Bắt đầu lượt sau hạn và đã nộp → `lateWeight` điểm. */
  LATE: 'late',
  /** Quá hạn mà chưa nộp → 0 điểm. */
  MISSED: 'missed',
  /** Đang làm dở, chưa nộp → chưa tính (lượt bỏ dở sẽ bị chốt, T6). */
  IN_PROGRESS: 'in_progress',
  /** Chưa tới hạn và chưa nộp → chưa tính. */
  PENDING: 'pending',
  /** Không tính: lần thi lại không bắt buộc, mục đã bỏ khỏi giáo trình lớp. */
  EXCLUDED: 'excluded',
} as const;
export type AttendanceMark =
  (typeof AttendanceMark)[keyof typeof AttendanceMark];

/** Lượt thi còn hiệu lực của học viên trên mục (đã bỏ lượt "Cho làm lại"). */
export interface AttendanceAttemptInput {
  state: ClassAttemptState;
  startedAt: string;
}

export interface AttendanceItemInput {
  /** Hạn **bắt đầu** lượt thi (R10.3); `null` = mục không tính chuyên cần. */
  deadlineAt: string | null;
  /** Mục đã bỏ khỏi giáo trình lớp → không tính (E3). */
  removed: boolean;
  /** `false` = lần thi lại không bắt buộc vì đã đậu lần trước (T2.2). */
  required: boolean;
  attempt: AttendanceAttemptInput | null;
}

/**
 * Chuyên cần của một mục với một học viên. Mốc đúng hạn/muộn tính theo **lúc
 * bắt đầu** lượt (người dùng chốt Step 11): deadline là hạn bắt đầu nên học
 * viên vào thi trước hạn rồi làm hết giờ không bị tính muộn.
 */
export function attendanceMarkOf(
  input: AttendanceItemInput,
  now: Date,
): AttendanceMark {
  if (input.deadlineAt === null || input.removed || !input.required) {
    return AttendanceMark.EXCLUDED;
  }
  const deadline = Date.parse(input.deadlineAt);
  const attempt = input.attempt;
  if (!attempt) {
    return now.getTime() > deadline
      ? AttendanceMark.MISSED
      : AttendanceMark.PENDING;
  }
  if (attempt.state === ClassAttemptState.IN_PROGRESS) {
    return AttendanceMark.IN_PROGRESS;
  }
  return Date.parse(attempt.startedAt) > deadline
    ? AttendanceMark.LATE
    : AttendanceMark.ON_TIME;
}

/** Tỉ lệ chuyên cần của một học viên trong một lớp. */
export interface AttendanceRate {
  onTime: number;
  late: number;
  missed: number;
  /** Số mục được tính (đúng hạn + muộn + quá hạn chưa nộp). */
  counted: number;
  /** Tổng điểm chuyên cần (đúng hạn 1, muộn `lateWeight`). */
  score: number;
  /** `null` khi chưa có mục nào được tính. */
  percent: number | null;
}

/**
 * Tỉ lệ chuyên cần = tổng điểm / số mục được tính × 100, làm tròn 1 chữ số
 * thập phân (R11). Mục chưa tới hạn, đang làm dở và mục không tính không vào
 * mẫu số.
 */
export function attendanceRate(
  marks: readonly AttendanceMark[],
  lateWeight: number,
): AttendanceRate {
  let onTime = 0;
  let late = 0;
  let missed = 0;
  for (const mark of marks) {
    if (mark === AttendanceMark.ON_TIME) onTime += 1;
    else if (mark === AttendanceMark.LATE) late += 1;
    else if (mark === AttendanceMark.MISSED) missed += 1;
  }
  const counted = onTime + late + missed;
  const score = onTime + late * lateWeight;
  return {
    onTime,
    late,
    missed,
    counted,
    score: Math.round(score * 100) / 100,
    percent: counted === 0 ? null : Math.round((score / counted) * 1000) / 10,
  };
}

/** Dưới ngưỡng cảnh báo X% (R11.2); chưa có số liệu → không cảnh báo. */
export function isBelowAttendanceThreshold(
  percent: number | null,
  warningThreshold: number,
): boolean {
  return percent !== null && percent < warningThreshold;
}

/** Trung bình các điểm % đã có, làm tròn 1 chữ số thập phân (giả định 9). */
export function averagePercent(
  values: readonly (number | null)[],
): number | null {
  const known = values.filter((value): value is number => value !== null);
  if (known.length === 0) return null;
  const sum = known.reduce((total, value) => total + value, 0);
  return Math.round((sum / known.length) * 10) / 10;
}

/** % câu tự chấm đúng của một lượt học (người dùng chốt Step 11). */
export function autoScorePercent(
  autoCorrect: number,
  autoTotal: number,
): number | null {
  if (autoTotal <= 0) return null;
  return Math.round((autoCorrect / autoTotal) * 1000) / 10;
}

// ---------------------------------------------------------------------------
// Kiểu dữ liệu API chuyên cần, bảng điểm, nhận xét cuối khoá (Step 11)

/** Tham số chuyên cần đang áp dụng cho lớp (R11.1–2). */
export interface ClassProgressParams {
  /** Giá trị hiệu lực (của lớp nếu có, không thì của trung tâm). */
  lateWeight: number;
  warningThreshold: number;
  /** `null` = lớp không ghi đè, dùng của trung tâm. */
  classLateWeight: number | null;
  classWarningThreshold: number | null;
  tenantLateWeight: number;
  tenantWarningThreshold: number;
}

/** Một học viên trong bảng chuyên cần/bảng điểm. */
export interface ClassProgressStudent extends ClassStudentRef {
  /** Đã rời lớp (giả định 15): chỉ hiện khi bật "Hiện học viên đã rời lớp". */
  removed: boolean;
  /** Tài khoản trong trung tâm đã ngừng, vẫn tính chuyên cần (giả định 16). */
  inactive: boolean;
}

/** Cột bảng chuyên cần: mục đề thi có deadline, theo thứ tự giáo trình lớp. */
export interface AttendanceColumn {
  itemId: string;
  title: string;
  label: CurriculumItemLabel;
  /** Chương chứa mục; `null` = chưa xếp chương. */
  groupTitle: string | null;
  deadlineAt: string;
  acceptLate: boolean;
  /** Lần thứ mấy trong nhóm thi (1 = mục gốc). */
  attemptIndex: number;
}

export interface AttendanceCell {
  itemId: string;
  mark: AttendanceMark;
  /** Lượt còn hiệu lực: lúc bắt đầu (mốc xét đúng hạn/muộn). */
  startedAt: string | null;
  submittedAt: string | null;
}

export interface AttendanceRow {
  student: ClassProgressStudent;
  cells: AttendanceCell[];
  rate: AttendanceRate;
  /** Dưới ngưỡng cảnh báo của lớp. */
  belowThreshold: boolean;
}

/** `GET t/:slug/classes/:id/progress/attendance`. */
export interface ClassAttendance {
  classroom: ClassroomRef;
  params: ClassProgressParams;
  /** Owner/Admin sửa được tham số của lớp; giáo viên chỉ xem. */
  canManageParams: boolean;
  columns: AttendanceColumn[];
  rows: AttendanceRow[];
}

/** Cột bảng điểm: mục bài học, hoặc **nhóm thi** gộp mục gốc + lần thi lại. */
export const GradebookColumnKind = {
  LESSON: 'lesson',
  EXAM: 'exam',
} as const;
export type GradebookColumnKind =
  (typeof GradebookColumnKind)[keyof typeof GradebookColumnKind];

export interface GradebookColumn {
  /** Mục bài học: `itemId`; nhóm thi: `itemId` của mục gốc. */
  id: string;
  kind: GradebookColumnKind;
  title: string;
  label: CurriculumItemLabel;
  /** `null` = chưa xếp chương. */
  groupId: string | null;
  groupTitle: string | null;
  /** Nhóm thi: các mục theo thứ tự lần (1 mục = không có thi lại). */
  itemIds: string[];
  /** Nhóm thi: ngưỡng đậu của mục gốc; bài học `null`. */
  passThreshold: number | null;
}

/** Một lần trong nhóm thi (tooltip cột nhóm). */
export interface GradebookAttemptRef {
  itemId: string;
  attemptIndex: number;
  state: ClassAttemptState;
  percent: number | null;
  passed: boolean | null;
}

export interface GradebookExamCell {
  kind: typeof GradebookColumnKind.EXAM;
  columnId: string;
  /** Điểm cao nhất các lượt đã chấm xong; `null` = chưa có điểm. */
  percent: number | null;
  passed: boolean;
  /** Còn lượt chờ chấm → điểm có thể tăng (T3.1). */
  hasPending: boolean;
  attempts: GradebookAttemptRef[];
}

export interface GradebookLessonCell {
  kind: typeof GradebookColumnKind.LESSON;
  columnId: string;
  /** % câu tự chấm của lần nộp gần nhất (người dùng chốt Step 11). */
  percent: number | null;
  /** Đã học xong ở bất kỳ version nào (giả định 2). */
  completed: boolean;
  /** Đã mở bài (có lượt học). */
  started: boolean;
}

export type GradebookCell = GradebookExamCell | GradebookLessonCell;

/** Trung bình một chương = trung bình điểm nhóm thi đã có điểm (giả định 9). */
export interface GradebookGroupAverage {
  /** `null` = mục chưa xếp chương. */
  groupId: string | null;
  percent: number | null;
}

/** Nhận xét cuối khoá của một học viên (T5). */
export interface ClassFinalComment {
  text: string;
  updatedAt: string;
  /** Người sửa cuối; `null` khi tài khoản đã xoá. */
  author: ExamUserRef | null;
}

export interface GradebookRow {
  student: ClassProgressStudent;
  cells: GradebookCell[];
  groupAverages: GradebookGroupAverage[];
  comment: ClassFinalComment | null;
}

/** Chương của lớp (để lọc cột bảng điểm). */
export interface GradebookGroup {
  /** `null` = mục chưa xếp chương. */
  id: string | null;
  title: string;
}

/** `GET t/:slug/classes/:id/progress/gradebook`. */
export interface ClassGradebook {
  classroom: ClassroomRef;
  groups: GradebookGroup[];
  columns: GradebookColumn[];
  rows: GradebookRow[];
  /** Viết/sửa nhận xét cuối khoá được (lớp `ongoing`/`finished`, T5.2). */
  canComment: boolean;
}

export const FINAL_COMMENT_MAX_LENGTH = 4000;

/** `PUT t/:slug/classes/:id/students/:membershipId/comment`. */
export interface SaveFinalCommentInput {
  /** Chuỗi rỗng = xoá nhận xét. */
  text: string;
}

/** Một mục chuyên cần của chính học viên (chỉ khi lớp `finished`). */
export interface LearnerAttendanceItem {
  itemId: string;
  title: string;
  deadlineAt: string;
  mark: AttendanceMark;
  startedAt: string | null;
}

/**
 * Kết quả cuối khoá học viên (và phụ huynh, Step 13) thấy khi lớp `finished`
 * (R11.3–4, T5.3): trong khoá chỉ thấy trạng thái từng mục, không thấy tỉ lệ.
 */
export interface LearnerClassSummary {
  attendance: AttendanceRate;
  warningThreshold: number;
  belowThreshold: boolean;
  attendanceItems: LearnerAttendanceItem[];
  /** Trung bình theo chương (kèm tên chương). */
  groupAverages: (GradebookGroupAverage & { title: string })[];
  finalComment: ClassFinalComment | null;
}
