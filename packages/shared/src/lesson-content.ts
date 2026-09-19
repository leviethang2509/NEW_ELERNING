// Bài học (lessons), section theo version và API trình soạn bài học (req-3
// Step 4). Tách hẳn đề thi (A1) nhưng cùng cơ chế trạng thái/version (A10);
// section không có thời lượng.
import type { ContentVisibility } from './exam';
import { ExamSectionStatus, ExamStatus } from './exam';
import type { ExamBlueprintRef, ExamUserRef } from './exam-content';

/** Cùng giá trị và cạnh chuyển trạng thái với đề thi (A10). */
export const LessonStatus = ExamStatus;
export type LessonStatus = ExamStatus;

/** Chỉ các section thuộc `lessons.current_version` là `active`. */
export const LessonSectionStatus = ExamSectionStatus;
export type LessonSectionStatus = ExamSectionStatus;

export const LESSON_TITLE_MAX_LENGTH = 200;
export const LESSON_DESCRIPTION_MAX_LENGTH = 2000;
export const LESSON_SECTION_NAME_MAX_LENGTH = 100;
export const LESSON_MIN_SECTIONS = 1;
export const LESSON_MAX_SECTIONS = 20;

/** Mẫu bài học gắn kèm bài học (cùng dạng với loại đề của đề thi). */
export type LessonBlueprintRef = ExamBlueprintRef;

/** `GET t/:slug/lessons`. Số liệu tính trên section của version hiện tại. */
export interface LessonListItem {
  id: string;
  title: string;
  description: string | null;
  status: LessonStatus;
  visibility: ContentVisibility;
  blueprint: LessonBlueprintRef;
  sectionCount: number;
  questionCount: number;
  currentVersion: number;
  creator: ExamUserRef | null;
  /** Bài gốc khi bài này là bản nhân bản; `null` nếu bài gốc đã bị xoá hẳn. */
  clonedFrom: { id: string; title: string } | null;
  /** Owner/Admin sửa mọi bài; Teacher chỉ bài mình tạo. */
  canEdit: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export interface LessonSectionItem {
  id: string;
  /** Phần của mẫu bài học sinh ra section (chỉ tham khảo, có thể đã bị xoá). */
  moduleId: string | null;
  name: string;
  sortOrder: number;
  questionCount: number;
  /** Nội dung Plate nguyên văn (`ExamValue` của `@lang/exam-core`). */
  rawData: unknown[];
}

/** `GET t/:slug/lessons/:id`: kèm nội dung version hiện tại. */
export interface LessonDetail extends LessonListItem {
  /** Tăng mỗi lần lưu nội dung; gửi lại khi Save để phát hiện ghi đè lẫn nhau. */
  contentRevision: number;
  /** Lúc lưu nội dung gần nhất (so với bản nháp trong trình duyệt). */
  contentSavedAt: string;
  /** Version hiện tại đã có lượt học: Save sẽ tạo version mới. */
  hasAttempts: boolean;
  sections: LessonSectionItem[];
}

export interface CreateLessonInput {
  blueprintId: string;
  title: string;
  description?: string | null;
  /** Mặc định `private` (đề thi mặc định `tenant`). */
  visibility?: ContentVisibility;
}

/** Sửa metadata (kể cả hiển thị), không tạo version. */
export interface UpdateLessonInput {
  blueprintId?: string;
  title?: string;
  description?: string | null;
  visibility?: ContentVisibility;
}

export interface LessonSectionInput {
  moduleId?: string | null;
  name: string;
  rawData: unknown[];
}

/** `PUT t/:slug/lessons/:id/content`: thay toàn bộ section của version hiện tại. */
export interface SaveLessonContentInput {
  baseRevision: number;
  sections: LessonSectionInput[];
}

/** `POST …/versions/:version/restore`. */
export interface RestoreLessonVersionInput {
  baseRevision: number;
}

export interface LessonVersionItem {
  version: number;
  isCurrent: boolean;
  savedAt: string;
  savedBy: ExamUserRef | null;
  sectionCount: number;
  questionCount: number;
  attemptCount: number;
}

/** `GET t/:slug/lessons/:id/versions`, mới nhất trước. */
export interface LessonVersionList {
  lesson: LessonListItem;
  contentRevision: number;
  hasAttempts: boolean;
  items: LessonVersionItem[];
}

/** `GET t/:slug/lessons/:id/versions/:version`. */
export interface LessonVersionDetail {
  version: number;
  isCurrent: boolean;
  sections: LessonSectionItem[];
}
