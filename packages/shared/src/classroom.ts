// Lớp học và giáo trình lớp (req-3 Step 7). Lớp tạo từ khoá học, chép giáo
// trình tham khảo (D1, R6); giáo viên của lớp sửa giáo trình lớp trực tiếp, có
// `revision` và nhật ký (E1–E3); mục đề thi có ngày mở, deadline, ngưỡng đậu,
// "Thi lại cho" (R7, R9, R10).
import type { ExamUserRef } from './exam-content';
import type {
  CourseRef,
  CurriculumContentRef,
  CurriculumItemLabel,
  CurriculumItemType,
} from './training';

export const ClassroomStatus = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
} as const;
export type ClassroomStatus =
  (typeof ClassroomStatus)[keyof typeof ClassroomStatus];

/**
 * Chuyển trạng thái bằng tay (D2, T6.2; người dùng chốt 2026-09-19): tự do giữa
 * sắp mở/đang học/đã kết thúc trừ nhảy thẳng sắp mở → đã kết thúc; huỷ từ sắp
 * mở/đang học; đã huỷ là trạng thái cuối.
 */
export const CLASSROOM_STATUS_TRANSITIONS: Readonly<
  Record<ClassroomStatus, readonly ClassroomStatus[]>
> = {
  [ClassroomStatus.UPCOMING]: [
    ClassroomStatus.ONGOING,
    ClassroomStatus.CANCELLED,
  ],
  [ClassroomStatus.ONGOING]: [
    ClassroomStatus.UPCOMING,
    ClassroomStatus.FINISHED,
    ClassroomStatus.CANCELLED,
  ],
  [ClassroomStatus.FINISHED]: [ClassroomStatus.ONGOING],
  [ClassroomStatus.CANCELLED]: [],
};

export function canChangeClassroomStatus(
  from: ClassroomStatus,
  to: ClassroomStatus,
): boolean {
  return CLASSROOM_STATUS_TRANSITIONS[from].includes(to);
}

/** Lớp đã kết thúc/huỷ: chỉ xem, không sửa giáo trình lớp và thành viên. */
export function isClassroomClosed(status: ClassroomStatus): boolean {
  return (
    status === ClassroomStatus.FINISHED || status === ClassroomStatus.CANCELLED
  );
}

/**
 * Múi giờ đào tạo cố định `+07:00` (giả định 1, R13.5; Việt Nam không có giờ
 * mùa hè): ngày mở/deadline/buổi học nhập và hiển thị theo giờ này.
 */
export const TRAINING_UTC_OFFSET = '+07:00';
const TRAINING_OFFSET_MS = 7 * 60 * 60 * 1000;

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Ngày `YYYY-MM-DD` đúng lịch, trong khoảng 2000–2100. */
export function isValidCalendarDate(value: string): boolean {
  const match = CALENDAR_DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number) as [
    number,
    number,
    number,
  ];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    year >= 2000 &&
    year <= 2100 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Ô `datetime-local` (`YYYY-MM-DDTHH:mm`, giờ Việt Nam) → ISO 8601; sai định dạng → `null`. */
export function trainingLocalToIso(local: string): string | null {
  if (!LOCAL_DATE_TIME.test(local)) return null;
  const date = new Date(`${local}:00${TRAINING_UTC_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** ISO 8601 → giá trị ô `datetime-local` theo giờ Việt Nam. */
export function isoToTrainingLocal(iso: string): string {
  return new Date(new Date(iso).getTime() + TRAINING_OFFSET_MS)
    .toISOString()
    .slice(0, 16);
}

/** Mã lớp theo quy tắc mã khoá học (`CATALOG_CODE_PATTERN`, tự in hoa). */
export const CLASSROOM_CODE_MAX_LENGTH = 32;
export const CLASSROOM_NAME_MAX_LENGTH = 200;
export const CLASSROOM_DESCRIPTION_MAX_LENGTH = 2000;
export const CLASSROOM_LOCATION_MAX_LENGTH = 500;
export const CLASSROOM_MAX_STUDENTS = 1000;
/** Số thành viên thêm vào lớp trong một lần. */
export const CLASSROOM_MAX_MEMBERS_PER_REQUEST = 200;
export const DEFAULT_PASS_THRESHOLD = 50;

export interface ClassroomRef {
  id: string;
  code: string;
  name: string;
  status: ClassroomStatus;
}

/** `GET t/:slug/classes`. Ngày dạng `YYYY-MM-DD`. */
export interface ClassroomListItem extends ClassroomRef {
  course: CourseRef;
  startDate: string;
  /** Tự tính từ thời khoá biểu (Step 8); `null` khi chưa có lịch. */
  endDate: string | null;
  plannedSessions: number;
  /** `null` = không giới hạn. */
  maxStudents: number | null;
  location: string | null;
  studentCount: number;
  teachers: ExamUserRef[];
  updatedAt: string;
}

/** `GET t/:slug/classes/:id`. */
export interface ClassroomDetail extends ClassroomListItem {
  description: string | null;
  /** Giáo trình tham khảo đã chép lúc tạo lớp; `null` nếu không chọn hoặc đã xoá. */
  sourceCurriculum: { id: string; name: string } | null;
  /** Owner/Admin: sửa thông tin, trạng thái, giáo viên, học viên. */
  canManage: boolean;
  /** Giáo viên của lớp hoặc Owner/Admin, lớp chưa kết thúc/huỷ. */
  canEditCurriculum: boolean;
  /** Lượt thi trong lớp đang làm dở (bị chốt khi chuyển "Đã kết thúc"). */
  inProgressAttemptCount: number;
  /** Đã có bài làm trong lớp → không xoá được, chỉ huỷ (giả định 4). */
  hasActivity: boolean;
  createdAt: string;
}

export interface CreateClassroomInput {
  courseId: string;
  code: string;
  name: string;
  description?: string | null;
  startDate: string;
  /** Bỏ trống = số buổi dự kiến của khoá học. */
  plannedSessions?: number | null;
  maxStudents?: number | null;
  location?: string | null;
  /** Giáo trình tham khảo của khoá học để chép sang giáo trình lớp. */
  sourceCurriculumId?: string | null;
}

/** PATCH: bỏ trường nào thì giữ nguyên; khoá học không đổi được (D1). */
export interface UpdateClassroomInput {
  code?: string;
  name?: string;
  description?: string | null;
  startDate?: string;
  plannedSessions?: number;
  maxStudents?: number | null;
  location?: string | null;
}

export interface ChangeClassroomStatusInput {
  status: ClassroomStatus;
}

/** Giáo viên/học viên của lớp. */
export interface ClassroomMemberView {
  membershipId: string;
  userId: string;
  fullName: string;
  email: string;
  /** Trạng thái membership trong tenant (`inactive` = đã ngừng). */
  membershipStatus: string;
  addedAt: string;
}

export interface ClassroomStudentView extends ClassroomMemberView {
  /** Đã xoá khỏi lớp (xoá mềm, bài làm giữ nguyên). */
  removedAt: string | null;
  /** Lớp khác của cùng khoá học mà học viên đang học (cảnh báo, D7.3). */
  otherClasses: ClassroomRef[];
}

/** `GET t/:slug/classes/:id/members`. */
export interface ClassroomMembers {
  teachers: ClassroomMemberView[];
  /** Học viên đang học rồi đến học viên đã xoá khỏi lớp. */
  students: ClassroomStudentView[];
}

export interface AddClassroomMembersInput {
  membershipIds: string[];
}

/** Mục giáo trình lớp. Thời điểm dạng ISO 8601. */
export interface ClassItemView {
  id: string;
  itemType: CurriculumItemType;
  title: string | null;
  label: CurriculumItemLabel;
  note: string | null;
  content: CurriculumContentRef;
  /** Trước lúc này mục hiện nhưng chưa vào được (R9). */
  opensAt: string | null;
  /** Bài học: chỉ để nhắc; đề thi: hạn bắt đầu làm (R10.3). */
  deadlineAt: string | null;
  /** Đề thi: cho bắt đầu sau deadline (tính muộn). */
  acceptLate: boolean;
  /** Đề thi: điểm % tối thiểu để đậu. */
  passThreshold: number;
  /** Mục gốc khi là lần thi lại (giả định 7). */
  retakeOfItemId: string | null;
  /** Số học viên đã có bài làm (cảnh báo khi xoá, E3). */
  learnerCount: number;
  /** Mục đã xoá (ẩn) vì đã có bài làm; khôi phục bằng cách thêm lại khi lưu. */
  removedAt: string | null;
}

export interface ClassGroupView {
  id: string;
  title: string;
  opensAt: string | null;
  items: ClassItemView[];
}

/** `GET t/:slug/classes/:id/curriculum`. */
export interface ClassCurriculum {
  classroomId: string;
  revision: number;
  canEdit: boolean;
  /** Mục chưa xếp chương, hiện ở đầu (giả định 5). */
  ungrouped: ClassItemView[];
  groups: ClassGroupView[];
  /** Mục đã xoá khỏi giáo trình nhưng còn bài làm. */
  removed: ClassItemView[];
}

/**
 * Mục gửi lên khi lưu. `id` của mục cũ giữ nguyên (kể cả mục đã ẩn để khôi
 * phục); mục mới có thể kèm uuid do client sinh để mục thi lại trỏ tới.
 */
export interface ClassItemInput {
  id?: string;
  itemType: CurriculumItemType;
  contentId: string;
  title?: string | null;
  label: CurriculumItemLabel;
  note?: string | null;
  opensAt?: string | null;
  deadlineAt?: string | null;
  acceptLate?: boolean;
  passThreshold?: number;
  retakeOfItemId?: string | null;
}

export interface ClassGroupInput {
  id?: string;
  title: string;
  opensAt?: string | null;
  items: ClassItemInput[];
}

/** `PUT t/:slug/classes/:id/curriculum`: thay toàn bộ chương + mục đang hiện. */
export interface SaveClassCurriculumInput {
  baseRevision: number;
  ungrouped: ClassItemInput[];
  groups: ClassGroupInput[];
}

/** Loại dòng nhật ký thay đổi của lớp. */
export const ClassLogAction = {
  CREATED: 'created',
  UPDATED: 'updated',
  STATUS_CHANGED: 'status_changed',
  TEACHERS_ADDED: 'teachers_added',
  TEACHER_REMOVED: 'teacher_removed',
  STUDENTS_ADDED: 'students_added',
  STUDENT_REMOVED: 'student_removed',
  CURRICULUM_SAVED: 'curriculum_saved',
} as const;
export type ClassLogAction =
  (typeof ClassLogAction)[keyof typeof ClassLogAction];

/** Trường của mục giáo trình lớp có thể đổi (nhật ký). */
export type ClassItemField =
  | 'title'
  | 'label'
  | 'note'
  | 'opensAt'
  | 'deadlineAt'
  | 'acceptLate'
  | 'passThreshold'
  | 'retakeOf'
  | 'group';

/**
 * Chi tiết nhật ký, lưu `jsonb`; chữ dựng ở client. Tên mục/chương/người ghi
 * lúc thay đổi (đổi tên về sau không sửa nhật ký cũ).
 */
export interface ClassLogDetail {
  /** `created`: giáo trình tham khảo đã chép. */
  curriculum?: string | null;
  /** `updated`: tên trường thông tin lớp đã đổi. */
  fields?: string[];
  /** `status_changed`. */
  from?: ClassroomStatus;
  to?: ClassroomStatus;
  /** `status_changed` sang đã kết thúc: số lượt thi bị chốt. */
  finalizedAttempts?: number;
  /** Thêm/xoá giáo viên, học viên: họ tên. */
  names?: string[];
  /** `curriculum_saved`. */
  added?: string[];
  removed?: string[];
  hidden?: string[];
  restored?: string[];
  changed?: { title: string; fields: ClassItemField[] }[];
  groupsAdded?: string[];
  groupsRemoved?: string[];
  groupsChanged?: string[];
  reordered?: boolean;
}

/** `GET t/:slug/classes/:id/logs`. */
export interface ClassLogEntry {
  id: string;
  action: ClassLogAction;
  detail: ClassLogDetail;
  actor: ExamUserRef | null;
  createdAt: string;
}
