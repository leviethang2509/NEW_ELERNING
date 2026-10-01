// Thời khoá biểu lớp, ngày nghỉ của trung tâm và lịch (req-3 Step 8; plan mục
// 1.3, 4.6). Buổi thường là "Buổi thứ N": ngày giờ tính lại từ lịch lặp và
// ngày nghỉ, nội dung map/ghi chú/phòng/giáo viên đi theo buổi (U1–U3, U5).
// Buổi bù có ngày cố định, không bao giờ bị dời (V1). Múi giờ cố định +07:00.
import {
  TRAINING_UTC_OFFSET,
  isValidCalendarDate,
  type ClassroomRef,
} from './classroom';
import type { CourseRef } from './training';

export const ClassSessionKind = {
  REGULAR: 'regular',
  MAKEUP: 'makeup',
} as const;
export type ClassSessionKind =
  (typeof ClassSessionKind)[keyof typeof ClassSessionKind];

export const ClassSessionStatus = {
  SCHEDULED: 'scheduled',
  CANCELLED: 'cancelled',
} as const;
export type ClassSessionStatus =
  (typeof ClassSessionStatus)[keyof typeof ClassSessionStatus];

/** Số ô lặp tối đa trong tuần của một lớp. */
export const SCHEDULE_MAX_SLOTS = 14;
export const SESSION_NOTE_MAX_LENGTH = 1000;
export const SESSION_CANCEL_REASON_MAX_LENGTH = 500;
export const SESSION_MAX_LINKS = 50;
export const HOLIDAY_NAME_MAX_LENGTH = 200;
/** Một ngày nghỉ dài tối đa 1 năm. */
export const HOLIDAY_MAX_DAYS = 366;
/** Khoảng ngày tối đa của một lần đọc lịch (tháng + phần tuần đầu/cuối, danh sách). */
export const CALENDAR_MAX_RANGE_DAYS = 93;
/** Tham số chuyên cần mặc định của tenant (R11.1–2). */
export const DEFAULT_LATE_WEIGHT = 0.5;
export const DEFAULT_WARNING_THRESHOLD = 70;

const DAY_MS = 24 * 60 * 60 * 1000;
const OFFSET_MS = 7 * 60 * 60 * 1000;
/** Giới hạn vòng lặp sinh ô (đủ cho 500 buổi kể cả nhiều ngày nghỉ). */
const MAX_SCAN_DAYS = 366 * 30;
const TIME_OF_DAY = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Giờ `HH:mm` (00:00–23:59). */
export function isValidTimeOfDay(value: string): boolean {
  return TIME_OF_DAY.test(value);
}

/** Ngày `YYYY-MM-DD` theo giờ Việt Nam của một thời điểm. */
export function trainingDateOf(value: string | Date): string {
  const ms = new Date(value).getTime() + OFFSET_MS;
  return new Date(ms).toISOString().slice(0, 10);
}

/** Giờ `HH:mm` theo giờ Việt Nam của một thời điểm. */
export function trainingTimeOf(value: string | Date): string {
  const ms = new Date(value).getTime() + OFFSET_MS;
  return new Date(ms).toISOString().slice(11, 16);
}

/** Thời điểm 00:00 ngày 1 của tháng (giờ Việt Nam) chứa `value`, dạng ISO (UTC). */
export function trainingMonthStartOf(value: string | Date): string {
  return trainingDateTimeToIso(
    `${trainingDateOf(value).slice(0, 8)}01`,
    '00:00',
  );
}

/** Ngày + giờ theo giờ Việt Nam → ISO 8601 (UTC). */
export function trainingDateTimeToIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00${TRAINING_UTC_OFFSET}`).toISOString();
}

/** Cộng ngày cho `YYYY-MM-DD`. */
export function addCalendarDays(date: string, days: number): string {
  const ms = Date.parse(`${date}T00:00:00Z`) + days * DAY_MS;
  return new Date(ms).toISOString().slice(0, 10);
}

/** Số ngày từ `from` đến `to` (âm khi `to` trước `from`). */
export function calendarDaysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS,
  );
}

/** Thứ trong tuần: 1 = Thứ 2 … 7 = Chủ nhật. */
export function weekdayOf(date: string): number {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

/** Ô lặp trong tuần của thời khoá biểu lớp (U1). */
export interface ScheduleSlot {
  /** 1 = Thứ 2 … 7 = Chủ nhật. */
  weekday: number;
  /** `HH:mm`, giờ Việt Nam. */
  startTime: string;
  endTime: string;
}

/** Khoảng ngày `YYYY-MM-DD`, tính cả hai đầu. */
export interface DateRange {
  startDate: string;
  endDate: string;
}

export function compareSlots(a: ScheduleSlot, b: ScheduleSlot): number {
  return (
    a.weekday - b.weekday ||
    a.startTime.localeCompare(b.startTime) ||
    a.endTime.localeCompare(b.endTime)
  );
}

export type ScheduleSlotError = 'weekday' | 'time' | 'order' | 'overlap';

/** Kiểm các ô lặp: thứ 1–7, giờ đúng định dạng, bắt đầu < kết thúc, không chồng nhau. */
export function validateScheduleSlots(
  slots: readonly ScheduleSlot[],
): ScheduleSlotError | null {
  for (const slot of slots) {
    if (!Number.isInteger(slot.weekday) || slot.weekday < 1 || slot.weekday > 7)
      return 'weekday';
    if (!isValidTimeOfDay(slot.startTime) || !isValidTimeOfDay(slot.endTime))
      return 'time';
    if (slot.startTime >= slot.endTime) return 'order';
  }
  const sorted = [...slots].sort(compareSlots);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const slot = sorted[i]!;
    if (prev.weekday === slot.weekday && slot.startTime < prev.endTime)
      return 'overlap';
  }
  return null;
}

/** Ngày thuộc một khoảng ngày nghỉ nào đó. */
export function isHolidayDate(
  date: string,
  holidays: readonly DateRange[],
): boolean {
  return holidays.some(
    (holiday) => holiday.startDate <= date && date <= holiday.endDate,
  );
}

export interface SlotOccurrence {
  date: string;
  startsAt: string;
  endsAt: string;
}

/**
 * Dãy ô lặp theo thứ tự thời gian bắt đầu từ ngày `fromDate`, bỏ ngày nghỉ.
 * Dừng sau `MAX_SCAN_DAYS` ngày (ô lặp rỗng hoặc ngày nghỉ phủ kín).
 */
export function* slotOccurrences(
  slots: readonly ScheduleSlot[],
  fromDate: string,
  holidays: readonly DateRange[] = [],
): Generator<SlotOccurrence> {
  if (slots.length === 0) return;
  const byWeekday = new Map<number, ScheduleSlot[]>();
  for (const slot of [...slots].sort(compareSlots)) {
    const list = byWeekday.get(slot.weekday) ?? [];
    list.push(slot);
    byWeekday.set(slot.weekday, list);
  }
  for (let offset = 0; offset < MAX_SCAN_DAYS; offset++) {
    const date = addCalendarDays(fromDate, offset);
    const daySlots = byWeekday.get(weekdayOf(date));
    if (!daySlots || isHolidayDate(date, holidays)) continue;
    for (const slot of daySlots) {
      yield {
        date,
        startsAt: trainingDateTimeToIso(date, slot.startTime),
        endsAt: trainingDateTimeToIso(date, slot.endTime),
      };
    }
  }
}

/** Buổi thường hiện có của lớp (đầu vào của `recomputeSchedule`). */
export interface RegularSessionState {
  id: string;
  seq: number;
  startsAt: string;
  endsAt: string;
  /** Giờ sửa tay; giữ khi buổi không đổi ngày (U2). */
  timeOverridden: boolean;
  /** Danh sách giáo viên riêng của buổi (dạy thế, R14). */
  customTeachers: boolean;
  movedWarning: boolean;
}

export interface RecomputeScheduleInput {
  startDate: string;
  plannedSessions: number;
  slots: readonly ScheduleSlot[];
  /** Ngày nghỉ đang áp dụng cho lớp (rỗng khi lớp tắt "Áp dụng ngày nghỉ"). */
  holidays: readonly DateRange[];
  sessions: readonly RegularSessionState[];
  now: Date;
}

export interface SessionTimeChange {
  id: string;
  seq: number;
  fromStartsAt: string;
  fromEndsAt: string;
  startsAt: string;
  endsAt: string;
  /** Đổi ngày (dời); `false` = cùng ngày, chỉ đổi giờ theo ô lặp. */
  dateChanged: boolean;
  /** Giá trị mới của `moved_warning`. */
  movedWarning: boolean;
}

export interface RecomputeScheduleResult {
  /** Số buổi thường đã diễn ra (giữ nguyên, không cho giảm số buổi dưới mức này). */
  heldCount: number;
  created: { seq: number; startsAt: string; endsAt: string }[];
  changed: SessionTimeChange[];
  removed: { id: string; seq: number; startsAt: string }[];
  /** Ngày của buổi thường cuối; `null` khi chưa có buổi nào. */
  endDate: string | null;
}

/**
 * Số buổi thường đã diễn ra: số thứ tự lớn nhất trong các buổi đã bắt đầu
 * (U3.1). Buổi có số nhỏ hơn cũng coi như đã qua.
 */
export function heldSessionCount(
  sessions: readonly Pick<RegularSessionState, 'seq' | 'startsAt'>[],
  now: Date,
): number {
  let held = 0;
  for (const session of sessions) {
    if (Date.parse(session.startsAt) <= now.getTime()) {
      held = Math.max(held, session.seq);
    }
  }
  return held;
}

/**
 * Tính lại ngày giờ buổi thường (plan 4.6). Buổi đã diễn ra giữ nguyên; buổi
 * thứ `held+1…plannedSessions` lần lượt nhận các ô lặp còn trống sau thời
 * điểm hiện tại, bỏ ngày nghỉ và ngày trước `startDate` (buổi huỷ vẫn chiếm ô,
 * V1). Buổi đổi ngày bỏ giờ sửa tay; có giáo viên riêng hoặc giờ sửa tay thì
 * bật cảnh báo dời (U2). Thiếu buổi thì tạo, thừa thì xoá buổi cuối (giả định
 * 6). Không có ô lặp nào thì không xếp được buổi tương lai: chỉ xoá buổi thừa.
 * `plannedSessions` nhỏ hơn số buổi đã diễn ra được coi bằng số đó (service
 * chặn trước).
 */
export function recomputeSchedule(
  input: RecomputeScheduleInput,
): RecomputeScheduleResult {
  const { now } = input;
  const sessions = [...input.sessions].sort((a, b) => a.seq - b.seq);
  const heldCount = heldSessionCount(sessions, now);
  const target = Math.max(input.plannedSessions, heldCount);
  const bySeq = new Map(sessions.map((session) => [session.seq, session]));

  const created: RecomputeScheduleResult['created'] = [];
  const changed: SessionTimeChange[] = [];
  const removed = sessions
    .filter((session) => session.seq > target)
    .map(({ id, seq, startsAt }) => ({ id, seq, startsAt }));
  const finalStarts = new Map<number, string>();
  for (const session of sessions) {
    if (session.seq <= heldCount)
      finalStarts.set(session.seq, session.startsAt);
  }

  if (input.slots.length > 0) {
    // Ô trống phải sau hiện tại và sau buổi đã diễn ra muộn nhất.
    const lastHeld = Math.max(
      now.getTime(),
      ...sessions
        .filter((session) => session.seq <= heldCount)
        .map((session) => Date.parse(session.startsAt)),
    );
    const today = trainingDateOf(now);
    const fromDate = input.startDate > today ? input.startDate : today;
    const free = slotOccurrences(input.slots, fromDate, input.holidays);
    for (let seq = heldCount + 1; seq <= target; seq++) {
      let slot = free.next();
      while (!slot.done && Date.parse(slot.value.startsAt) <= lastHeld) {
        slot = free.next();
      }
      if (slot.done) break;
      const { date, startsAt, endsAt } = slot.value;
      const old = bySeq.get(seq);
      if (!old) {
        created.push({ seq, startsAt, endsAt });
        finalStarts.set(seq, startsAt);
        continue;
      }
      const sameDate = trainingDateOf(old.startsAt) === date;
      const sameTime =
        Date.parse(old.startsAt) === Date.parse(startsAt) &&
        Date.parse(old.endsAt) === Date.parse(endsAt);
      if ((sameDate && old.timeOverridden) || sameTime) {
        finalStarts.set(seq, old.startsAt);
        continue;
      }
      changed.push({
        id: old.id,
        seq,
        fromStartsAt: old.startsAt,
        fromEndsAt: old.endsAt,
        startsAt,
        endsAt,
        dateChanged: !sameDate,
        movedWarning:
          old.movedWarning ||
          (!sameDate && (old.customTeachers || old.timeOverridden)),
      });
      finalStarts.set(seq, startsAt);
    }
  } else {
    for (const session of sessions) {
      if (session.seq <= target) finalStarts.set(session.seq, session.startsAt);
    }
  }

  const lastSeq = Math.max(0, ...finalStarts.keys());
  const last = finalStarts.get(lastSeq);
  return {
    heldCount,
    created,
    changed,
    removed,
    endDate: last ? trainingDateOf(last) : null,
  };
}

/** Hai khoảng thời gian `[start, end)` giao nhau. */
export function timeRangesOverlap(
  a: { startsAt: string; endsAt: string },
  b: { startsAt: string; endsAt: string },
): boolean {
  return (
    Date.parse(a.startsAt) < Date.parse(b.endsAt) &&
    Date.parse(b.startsAt) < Date.parse(a.endsAt)
  );
}

/** Buổi học kèm người tham gia (giáo viên hiệu lực, học viên đang học). */
export interface OverlapCandidate {
  id: string;
  /** Lớp của buổi; hai buổi cùng lớp không tính là trùng lịch. */
  classroomId: string;
  startsAt: string;
  endsAt: string;
  people: readonly string[];
}

export interface SessionOverlap<T extends OverlapCandidate> {
  other: T;
  /** Người có mặt ở cả hai buổi. */
  people: string[];
}

/**
 * Trùng lịch (R15): buổi của lớp khác chồng giờ và có chung ít nhất một người.
 * Trả về theo id buổi trong `targets`; buổi không trùng thì không có khoá.
 */
export function findSessionOverlaps<T extends OverlapCandidate>(
  targets: readonly OverlapCandidate[],
  others: readonly T[],
): Map<string, SessionOverlap<T>[]> {
  const result = new Map<string, SessionOverlap<T>[]>();
  for (const target of targets) {
    const people = new Set(target.people);
    if (people.size === 0) continue;
    for (const other of others) {
      if (
        other.id === target.id ||
        other.classroomId === target.classroomId ||
        !timeRangesOverlap(target, other)
      ) {
        continue;
      }
      const shared = other.people.filter((person) => people.has(person));
      if (shared.length === 0) continue;
      const list = result.get(target.id) ?? [];
      list.push({ other, people: [...new Set(shared)] });
      result.set(target.id, list);
    }
  }
  return result;
}

/** Khoảng ngày hợp lệ cho lần đọc lịch. */
export function isValidCalendarRange(from: string, to: string): boolean {
  if (!isValidCalendarDate(from) || !isValidCalendarDate(to)) return false;
  const days = calendarDaysBetween(from, to);
  return days >= 0 && days < CALENDAR_MAX_RANGE_DAYS;
}

// ---------------------------------------------------------------------------
// Kiểu dữ liệu API

/** Người (giáo viên/học viên) gắn với buổi học. */
export interface SessionPersonRef {
  membershipId: string;
  userId: string;
  fullName: string;
}

/** Buổi của lớp khác trùng giờ và có chung người (R15). */
export interface SessionConflict {
  sessionId: string;
  classroom: ClassroomRef;
  kind: ClassSessionKind;
  seq: number | null;
  startsAt: string;
  endsAt: string;
  /** Họ tên người bị trùng. */
  people: string[];
}

/** Chương hoặc mục giáo trình lớp map với buổi (R17). */
export interface SessionLinkView {
  groupId: string | null;
  itemId: string | null;
  title: string;
}

export interface ClassSessionView {
  id: string;
  kind: ClassSessionKind;
  /** Số buổi (buổi thường); buổi bù không đánh số. */
  seq: number | null;
  startsAt: string;
  endsAt: string;
  /** Giờ sửa tay (buổi thường). */
  timeOverridden: boolean;
  status: ClassSessionStatus;
  cancelReason: string | null;
  /** Phòng/link riêng của buổi; `null` = theo lớp. */
  location: string | null;
  note: string | null;
  /** Buổi bù: "Bù cho Buổi N". */
  makeupFor: { id: string; seq: number | null } | null;
  /** `false` = giáo viên của buổi là mọi giáo viên của lớp. */
  customTeachers: boolean;
  teachers: SessionPersonRef[];
  /** Buổi vừa bị dời mà có giáo viên riêng/giờ sửa tay: cần kiểm tra lại (U2). */
  movedWarning: boolean;
  links: SessionLinkView[];
  conflicts: SessionConflict[];
}

/** Ngày nghỉ của trung tâm (T4, U5). */
export interface HolidayView {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

/** `GET t/:slug/classes/:id/schedule`. */
export interface ClassScheduleView {
  classroomId: string;
  startDate: string;
  plannedSessions: number;
  endDate: string | null;
  applyTenantHolidays: boolean;
  /** Phòng/link mặc định của lớp. */
  location: string | null;
  slots: ScheduleSlot[];
  /** Buổi thường theo số, buổi bù xen theo thời gian. */
  sessions: ClassSessionView[];
  /** Ngày nghỉ của trung tâm trong khoảng thời gian của lớp. */
  holidays: HolidayView[];
  /** Số buổi thường đã diễn ra. */
  heldCount: number;
  /** Owner/Admin, lớp chưa kết thúc/huỷ: sửa lịch lặp, ngày bắt đầu, số buổi. */
  canManage: boolean;
  /** Giáo viên của lớp hoặc Owner/Admin, lớp chưa kết thúc/huỷ: thao tác trên buổi. */
  canEditSessions: boolean;
}

/** `PUT t/:slug/classes/:id/schedule` (và `POST …/schedule/preview`). */
export interface SaveClassScheduleInput {
  startDate: string;
  plannedSessions: number;
  applyTenantHolidays: boolean;
  slots: ScheduleSlot[];
}

/** Thay đổi của lịch lớp khi lưu (xem trước, xác nhận). */
export interface ScheduleChangeSummary {
  heldCount: number;
  created: number;
  moved: {
    seq: number;
    fromStartsAt: string;
    startsAt: string;
    dateChanged: boolean;
    /** Buổi có giáo viên riêng/giờ sửa tay bị dời. */
    movedWarning: boolean;
  }[];
  removed: { seq: number; startsAt: string; linkCount: number }[];
  previousEndDate: string | null;
  endDate: string | null;
}

export interface UpdateClassSessionInput {
  location?: string | null;
  note?: string | null;
  /** Buổi thường: cùng ngày (giờ sửa tay); buổi bù: tuỳ ý. */
  startsAt?: string;
  endsAt?: string;
  /** `null` = theo giáo viên của lớp. */
  teacherMembershipIds?: string[] | null;
  /** Bấm "Đã kiểm tra" cảnh báo buổi bị dời. */
  dismissMovedWarning?: boolean;
}

export interface CancelClassSessionInput {
  reason?: string | null;
}

export interface CreateMakeupSessionInput {
  startsAt: string;
  endsAt: string;
  location?: string | null;
  note?: string | null;
  /** Buổi thường được bù. */
  makeupForSessionId?: string | null;
  teacherMembershipIds?: string[] | null;
}

/** `PUT t/:slug/classes/:id/sessions/:sid/links`: thay toàn bộ map của buổi. */
export interface SaveSessionLinksInput {
  groupIds: string[];
  itemIds: string[];
}

/** `GET t/:slug/sessions/:sid`: chi tiết buổi (kể cả giáo viên dạy thế, R14.3). */
export interface ClassSessionDetail extends ClassSessionView {
  classroom: ClassroomRef & { location: string | null; course: CourseRef };
  classTeachers: SessionPersonRef[];
  students: SessionPersonRef[];
  /** Giáo viên của lớp hoặc Owner/Admin: vào được trang lớp. */
  canOpenClass: boolean;
  canEdit: boolean;
}

/** Một buổi trên lịch (lớp, khoá học, trung tâm, lịch dạy của tôi). */
export interface CalendarSession {
  id: string;
  classroom: ClassroomRef;
  course: CourseRef;
  kind: ClassSessionKind;
  seq: number | null;
  startsAt: string;
  endsAt: string;
  status: ClassSessionStatus;
  /** Phòng/link hiệu lực (buổi, không có thì của lớp). */
  location: string | null;
  teachers: SessionPersonRef[];
  /** Người xem dạy buổi này mà không phải giáo viên của lớp (dạy thế). */
  substitute: boolean;
  hasConflict: boolean;
  movedWarning: boolean;
}

/** `GET …/sessions`, `schedule/mine`, `schedule/center`: `from`–`to` tính cả hai đầu. */
export interface CalendarFeed {
  from: string;
  to: string;
  sessions: CalendarSession[];
  holidays: HolidayView[];
}

export interface CalendarRangeQuery {
  from: string;
  to: string;
}

/** `GET t/:slug/settings`. */
export interface TenantTrainingSettings {
  /** Hệ số nộp muộn k (0–1). */
  lateWeight: number;
  /** Ngưỡng cảnh báo chuyên cần X%. */
  warningThreshold: number;
  holidays: HolidayView[];
}

export interface UpdateTenantSettingsInput {
  lateWeight?: number;
  warningThreshold?: number;
}

export interface HolidayInput {
  name: string;
  startDate: string;
  endDate: string;
}

/**
 * `POST t/:slug/settings/holidays/impact`: xem trước ảnh hưởng khi thêm
 * (`holidayId` rỗng), sửa (`holidayId` + khoảng mới) hoặc xoá (`remove`).
 */
export interface HolidayImpactInput {
  holidayId?: string | null;
  startDate?: string;
  endDate?: string;
  remove?: boolean;
}

export interface HolidayImpact {
  classes: {
    classroom: ClassroomRef;
    moved: number;
    previousEndDate: string | null;
    endDate: string | null;
  }[];
}

/** `POST t/:slug/classes/:id/conflicts`: buổi của lớp trùng lịch với người sắp thêm. */
export interface MemberScheduleConflicts {
  membershipId: string;
  fullName: string;
  /** Buổi chưa diễn ra của lớp này và buổi trùng ở lớp khác. */
  sessions: {
    sessionId: string;
    kind: ClassSessionKind;
    seq: number | null;
    startsAt: string;
    endsAt: string;
    conflicts: SessionConflict[];
  }[];
}
