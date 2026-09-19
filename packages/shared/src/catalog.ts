// Danh mục (categories, dùng chung cho đề thi và bài học), loại đề
// (exam_blueprints) và module (exam_modules). Có 2 phạm vi: hệ thống
// (`tenant_id` NULL) và riêng tenant.

/** Phạm vi của danh mục/loại đề, suy ra từ `tenant_id`. */
export const CatalogScope = {
  SYSTEM: 'system',
  TENANT: 'tenant',
} as const;
export type CatalogScope = (typeof CatalogScope)[keyof typeof CatalogScope];

/** Màu danh mục: tên 8 màu nhấn Solarized (lang-app đổi sang mã màu). */
export const CategoryColor = {
  YELLOW: 'yellow',
  ORANGE: 'orange',
  RED: 'red',
  MAGENTA: 'magenta',
  VIOLET: 'violet',
  BLUE: 'blue',
  CYAN: 'cyan',
  GREEN: 'green',
} as const;
export type CategoryColor = (typeof CategoryColor)[keyof typeof CategoryColor];

/** Icon danh mục: tên icon lucide (lang-app ánh xạ sang component). */
export const CategoryIconName = {
  LANGUAGES: 'languages',
  GLOBE: 'globe',
  BOOK_OPEN: 'book-open',
  GRADUATION_CAP: 'graduation-cap',
  LIBRARY: 'library',
  AWARD: 'award',
  HEADPHONES: 'headphones',
  MIC: 'mic',
  PEN_LINE: 'pen-line',
  MESSAGE_CIRCLE: 'message-circle',
  FILE_TEXT: 'file-text',
  BRAIN: 'brain',
} as const;
export type CategoryIconName =
  (typeof CategoryIconName)[keyof typeof CategoryIconName];

export const DEFAULT_CATEGORY_COLOR: CategoryColor = CategoryColor.BLUE;
export const DEFAULT_CATEGORY_ICON: CategoryIconName =
  CategoryIconName.BOOK_OPEN;

/**
 * Mã danh mục/loại đề/module: chữ IN HOA không dấu, số, `-`/`_` ở giữa. Sửa
 * được (đề thi tham chiếu bằng id). Unique theo phạm vi; module unique trong
 * loại đề.
 */
export const CATALOG_CODE_PATTERN = /^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$/;
export const CATALOG_CODE_MAX_LENGTH = 32;
export const CATALOG_NAME_MAX_LENGTH = 100;
export const CATALOG_DESCRIPTION_MAX_LENGTH = 2000;
/** Loại đề phải có ít nhất 1 module vì đề thi cần ít nhất 1 section. */
export const EXAM_BLUEPRINT_MIN_MODULES = 1;
export const EXAM_BLUEPRINT_MAX_MODULES = 20;

/** Chuẩn hoá mã người dùng nhập: bỏ khoảng trắng hai đầu, đổi sang in hoa. */
export function normalizeCatalogCode(value: string): string {
  return value.trim().toUpperCase();
}

/** `GET …/categories`. */
export interface CategoryItem {
  id: string;
  scope: CatalogScope;
  name: string;
  code: string;
  description: string | null;
  icon: CategoryIconName;
  color: CategoryColor;
  sortOrder: number;
  isActive: boolean;
  /**
   * Số loại đề thuộc danh mục. Trang hệ thống đếm mọi loại đề (kể cả của
   * tenant); trang tenant đếm loại đề hệ thống + của tenant.
   */
  blueprintCount: number;
  updatedAt: string;
}

/** Danh mục gắn kèm loại đề. */
export type CategoryRef = Pick<
  CategoryItem,
  'id' | 'scope' | 'name' | 'code' | 'icon' | 'color' | 'isActive'
>;

export interface ExamModuleItem {
  id: string;
  name: string;
  code: string;
  sortOrder: number;
  /** Phút, bội số 5, tối đa 180 (`isValidDurationMinutes`). */
  referenceDurationMinutes: number;
  description: string | null;
}

/** `GET …/exam-blueprints`. */
export interface ExamBlueprintItem {
  id: string;
  scope: CatalogScope;
  category: CategoryRef;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  /** Theo `sortOrder`. */
  modules: ExamModuleItem[];
  /**
   * Số đề dùng loại đề (kể cả đề đã xoá mềm vì vẫn chặn xoá loại đề). Trang hệ
   * thống đếm đề mọi tenant; trang tenant đếm đề của tenant.
   */
  examCount: number;
  updatedAt: string;
}

/** Module gửi lên khi lưu loại đề; có `id` là sửa module cũ, không có là thêm mới. */
export interface ExamModuleInput {
  id?: string;
  name: string;
  code: string;
  referenceDurationMinutes: number;
  description?: string | null;
}
