// Đề thi (exams), section theo version và API trình soạn đề (Step 12).
import type { ContentVisibility, ExamStatus } from './exam';
import type { CatalogScope, CategoryRef } from './catalog';

export const EXAM_TITLE_MAX_LENGTH = 200;
export const EXAM_DESCRIPTION_MAX_LENGTH = 2000;
export const EXAM_SECTION_NAME_MAX_LENGTH = 100;
/** Đề cần ít nhất 1 section (plan: section là tab editor, có timer). */
export const EXAM_MIN_SECTIONS = 1;
export const EXAM_MAX_SECTIONS = 20;

/** Chủ sở hữu đề chuyển trạng thái được theo các cạnh này. */
export const EXAM_STATUS_TRANSITIONS: Readonly<
  Record<ExamStatus, readonly ExamStatus[]>
> = {
  draft: ['published'],
  published: ['archived'],
  // Đề lưu trữ publish lại được (validate lại); không có đường về nháp.
  archived: ['published'],
};

export interface ExamUserRef {
  id: string;
  fullName: string;
}

/** Loại đề gắn kèm đề thi. */
export interface ExamBlueprintRef {
  id: string;
  scope: CatalogScope;
  name: string;
  code: string;
  isActive: boolean;
  category: CategoryRef;
}

/** `GET t/:slug/exams`. Số liệu tính trên section của version hiện tại. */
export interface ExamListItem {
  id: string;
  title: string;
  description: string | null;
  status: ExamStatus;
  visibility: ContentVisibility;
  blueprint: ExamBlueprintRef;
  sectionCount: number;
  questionCount: number;
  totalDurationMinutes: number;
  currentVersion: number;
  creator: ExamUserRef | null;
  /** Đề gốc khi đề này là bản nhân bản; `null` nếu đề gốc đã bị xoá hẳn. */
  clonedFrom: { id: string; title: string } | null;
  /** Owner/Admin sửa mọi đề; Teacher chỉ đề mình tạo. */
  canEdit: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export interface ExamSectionItem {
  id: string;
  /** Module của loại đề sinh ra section (chỉ tham khảo, module có thể đã bị xoá). */
  moduleId: string | null;
  name: string;
  sortOrder: number;
  durationMinutes: number;
  questionCount: number;
  /** Nội dung Plate nguyên văn (`ExamValue` của `@lang/exam-core`). */
  rawData: unknown[];
}

/** `GET t/:slug/exams/:id`: kèm nội dung version hiện tại. */
export interface ExamDetail extends ExamListItem {
  /** Tăng mỗi lần lưu nội dung; gửi lại khi Save để phát hiện ghi đè lẫn nhau. */
  contentRevision: number;
  /** Lúc lưu nội dung gần nhất (so với bản nháp trong trình duyệt). */
  contentSavedAt: string;
  /** Version hiện tại đã có bài làm: Save sẽ tạo version mới. */
  hasAttempts: boolean;
  sections: ExamSectionItem[];
}

export interface CreateExamInput {
  blueprintId: string;
  title: string;
  description?: string | null;
  /** Mặc định `tenant`. */
  visibility?: ContentVisibility;
}

/** Sửa metadata (kể cả hiển thị), không tạo version. */
export interface UpdateExamInput {
  blueprintId?: string;
  title?: string;
  description?: string | null;
  visibility?: ContentVisibility;
}

/** Hậu tố tên của bản nhân bản (`POST t/:slug/exams/:id/clone`). */
export const CLONE_TITLE_SUFFIX = ' (bản sao)';

export interface ExamSectionInput {
  moduleId?: string | null;
  name: string;
  durationMinutes: number;
  rawData: unknown[];
}

/** `PUT t/:slug/exams/:id/content`: thay toàn bộ section của version hiện tại. */
export interface SaveExamContentInput {
  baseRevision: number;
  sections: ExamSectionInput[];
}

/** `POST …/versions/:version/restore`. */
export interface RestoreExamVersionInput {
  baseRevision: number;
}

export interface ExamVersionItem {
  version: number;
  isCurrent: boolean;
  savedAt: string;
  savedBy: ExamUserRef | null;
  sectionCount: number;
  questionCount: number;
  totalDurationMinutes: number;
  attemptCount: number;
}

/** `GET t/:slug/exams/:id/versions`, mới nhất trước. */
export interface ExamVersionList {
  exam: ExamListItem;
  contentRevision: number;
  hasAttempts: boolean;
  items: ExamVersionItem[];
}

/** `GET t/:slug/exams/:id/versions/:version`. */
export interface ExamVersionDetail {
  version: number;
  isCurrent: boolean;
  sections: ExamSectionItem[];
}

/** Lỗi nội dung khi publish (hoặc lưu đề đã publish), trả kèm body 422. */
export interface ExamContentIssue {
  sectionIndex: number;
  sectionName: string;
  indicatorId: string | null;
  message: string;
  severity: 'error' | 'warning';
}
