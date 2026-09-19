// Khoá học (courses) và giáo trình tham khảo (curricula) của tenant (req-3
// Step 6). Khoá học m-m giáo trình (R6); giáo trình gồm chương 1 cấp và mục
// trỏ tới bài học hoặc đề thi đã publish (C3–C5).
import type { CategoryRef } from './catalog';
import type { ExamStatus } from './exam';
import type { ExamUserRef } from './exam-content';

export const CourseStatus = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;
export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];

/** Mục giáo trình trỏ tới bài học hoặc đề thi. */
export const CurriculumItemType = {
  LESSON: 'lesson',
  EXAM: 'exam',
} as const;
export type CurriculumItemType =
  (typeof CurriculumItemType)[keyof typeof CurriculumItemType];

/**
 * Nhãn mục (T1), chỉ để hiển thị/lọc: bài học là `Bài học`/`Bài tập`, đề thi là
 * `Bài kiểm tra`/`Bài thi`.
 */
export const CurriculumItemLabel = {
  LESSON: 'lesson',
  HOMEWORK: 'homework',
  QUIZ: 'quiz',
  FINAL: 'final',
} as const;
export type CurriculumItemLabel =
  (typeof CurriculumItemLabel)[keyof typeof CurriculumItemLabel];

/** Nhãn hợp lệ theo loại mục; phần tử đầu là nhãn mặc định. */
export const CURRICULUM_LABELS_BY_TYPE: Record<
  CurriculumItemType,
  readonly CurriculumItemLabel[]
> = {
  [CurriculumItemType.LESSON]: [
    CurriculumItemLabel.LESSON,
    CurriculumItemLabel.HOMEWORK,
  ],
  [CurriculumItemType.EXAM]: [
    CurriculumItemLabel.QUIZ,
    CurriculumItemLabel.FINAL,
  ],
};

export function defaultCurriculumLabel(
  type: CurriculumItemType,
): CurriculumItemLabel {
  return CURRICULUM_LABELS_BY_TYPE[type][0];
}

export function isLabelOfType(
  type: CurriculumItemType,
  label: CurriculumItemLabel,
): boolean {
  return CURRICULUM_LABELS_BY_TYPE[type].includes(label);
}

/** Mã khoá học dùng quy tắc mã danh mục (`CATALOG_CODE_PATTERN`, in hoa). */
export const COURSE_CODE_MAX_LENGTH = 32;
export const COURSE_NAME_MAX_LENGTH = 200;
export const COURSE_DESCRIPTION_MAX_LENGTH = 2000;
export const COURSE_LEVEL_MAX_LENGTH = 50;
export const COURSE_COVER_URL_MAX_LENGTH = 1024;
export const COURSE_MAX_PLANNED_SESSIONS = 500;

export const CURRICULUM_NAME_MAX_LENGTH = 200;
export const CURRICULUM_DESCRIPTION_MAX_LENGTH = 2000;
export const CURRICULUM_GROUP_TITLE_MAX_LENGTH = 200;
export const CURRICULUM_ITEM_TITLE_MAX_LENGTH = 200;
export const CURRICULUM_ITEM_NOTE_MAX_LENGTH = 1000;
export const CURRICULUM_MAX_GROUPS = 100;
export const CURRICULUM_MAX_ITEMS = 300;

/** `GET t/:slug/courses`. */
export interface CourseListItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: CategoryRef | null;
  coverUrl: string | null;
  /** Trình độ, chữ tự do (vd. "N5", "A2"). */
  level: string | null;
  plannedSessions: number | null;
  status: CourseStatus;
  curriculumCount: number;
  /** Số lớp của khoá học; có lớp thì không xoá được, chỉ lưu trữ (B3). */
  classCount: number;
  updatedAt: string;
}

/** `GET t/:slug/courses/:id`: kèm giáo trình tham khảo đang gắn. */
export interface CourseDetail extends CourseListItem {
  curricula: CurriculumListItem[];
}

export interface CreateCourseInput {
  code: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  coverUrl?: string | null;
  level?: string | null;
  plannedSessions?: number | null;
}

/** PATCH: bỏ trường nào thì giữ nguyên. */
export interface UpdateCourseInput extends Partial<CreateCourseInput> {
  status?: CourseStatus;
}

/** Khoá học gắn kèm giáo trình. */
export interface CourseRef {
  id: string;
  code: string;
  name: string;
  status: CourseStatus;
}

/** `GET t/:slug/curricula`. */
export interface CurriculumListItem {
  id: string;
  name: string;
  description: string | null;
  creator: ExamUserRef | null;
  /** Giáo trình gốc khi là bản nhân bản; `null` nếu bản gốc đã bị xoá. */
  clonedFrom: { id: string; name: string } | null;
  groupCount: number;
  itemCount: number;
  /** Khoá học đang gắn giáo trình (theo tên). */
  courses: CourseRef[];
  /** Owner/Admin sửa mọi giáo trình; Teacher chỉ giáo trình mình tạo. */
  canEdit: boolean;
  updatedAt: string;
}

/** Bài học/đề thi mà mục trỏ tới. */
export interface CurriculumContentRef {
  id: string;
  title: string;
  /** `archived`: vẫn nằm trong giáo trình nhưng hiện cảnh báo (C5). */
  status: ExamStatus;
}

export interface CurriculumItemView {
  id: string;
  itemType: CurriculumItemType;
  /** Tên hiển thị ghi đè; `null` = dùng tên bài học/đề. */
  title: string | null;
  label: CurriculumItemLabel;
  note: string | null;
  content: CurriculumContentRef;
}

export interface CurriculumGroupView {
  id: string;
  title: string;
  items: CurriculumItemView[];
}

/** `GET t/:slug/curricula/:id`. */
export interface CurriculumDetail extends CurriculumListItem {
  /** Tăng mỗi lần lưu chương + mục; gửi lại khi lưu để không ghi đè lẫn nhau. */
  revision: number;
  /** Mục chưa xếp chương, hiện ở đầu giáo trình (giả định 5). */
  ungrouped: CurriculumItemView[];
  groups: CurriculumGroupView[];
}

export interface CreateCurriculumInput {
  name: string;
  description?: string | null;
}

export type UpdateCurriculumInput = Partial<CreateCurriculumInput>;

/** Mục gửi lên khi lưu; có `id` là mục cũ (giữ id), không có là thêm mới. */
export interface CurriculumItemInput {
  id?: string;
  itemType: CurriculumItemType;
  /** Id bài học (`itemType = lesson`) hoặc đề thi (`exam`). */
  contentId: string;
  title?: string | null;
  label: CurriculumItemLabel;
  note?: string | null;
}

export interface CurriculumGroupInput {
  id?: string;
  title: string;
  items: CurriculumItemInput[];
}

/** `PUT t/:slug/curricula/:id/items`: thay toàn bộ chương + mục theo thứ tự gửi lên. */
export interface SaveCurriculumItemsInput {
  baseRevision: number;
  ungrouped: CurriculumItemInput[];
  groups: CurriculumGroupInput[];
}
