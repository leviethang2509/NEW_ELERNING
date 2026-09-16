// Tài liệu nội bộ `/user-manual` (req-2): nội dung là JSON trong lang-api, chỉ
// System Owner/Admin đọc được qua `GET /admin/user-manual`.
import { SystemRole, TenantRole } from './roles';
import { slugifyTenantName } from './tenant';

/** Role mà một trang tài liệu hướng tới (dùng cho bộ lọc theo role). */
export type ManualRole = SystemRole | TenantRole;

export const MANUAL_ROLES: readonly ManualRole[] = [
  SystemRole.SYSTEM_OWNER,
  SystemRole.SYSTEM_ADMIN,
  SystemRole.REGISTERED_USER,
  TenantRole.TENANT_OWNER,
  TenantRole.TENANT_ADMIN,
  TenantRole.TEACHER,
  TenantRole.STUDENT,
  TenantRole.PARENT,
];

export type ManualCalloutTone = 'info' | 'tip' | 'warning';

export const MANUAL_CALLOUT_TONES: readonly ManualCalloutTone[] = [
  'info',
  'tip',
  'warning',
];

/**
 * Khối nội dung. Mọi chuỗi (trừ `code`) hỗ trợ inline: `**đậm**`, `` `mã` `` và
 * liên kết `[chữ](page:id)` / `[chữ](page:id#heading)` tới trang tài liệu khác.
 */
export type ManualBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'steps'; items: { title: string; text?: string }[] }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | {
      type: 'callout';
      tone: ManualCalloutTone;
      title?: string;
      text: string;
    }
  | { type: 'roles'; roles: ManualRole[] }
  | { type: 'code'; text: string };

export interface ManualPage {
  /** Dùng làm đường dẫn `/user-manual/{id}`. */
  id: string;
  title: string;
  summary: string;
  /** Rỗng = trang chung, luôn hiện khi lọc theo role. */
  roles: ManualRole[];
  blocks: ManualBlock[];
}

export interface ManualGroup {
  id: string;
  title: string;
  pages: ManualPage[];
}

export interface UserManual {
  title: string;
  /** `YYYY-MM-DD` */
  updatedAt: string;
  groups: ManualGroup[];
}

export type ManualInline =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'link'; text: string; pageId: string; anchor: string | null };

const INLINE_PATTERN =
  /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(page:([^)#\s]+)(?:#([^)\s]+))?\)/g;

/** Tách chuỗi inline thành các đoạn để render (lang-app) và kiểm liên kết (test). */
export function parseManualInline(source: string): ManualInline[] {
  const parts: ManualInline[] = [];
  let last = 0;
  for (const match of source.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push({ kind: 'text', text: source.slice(last, index) });
    }
    if (match[1] !== undefined) {
      parts.push({ kind: 'strong', text: match[1] });
    } else if (match[2] !== undefined) {
      parts.push({ kind: 'code', text: match[2] });
    } else {
      parts.push({
        kind: 'link',
        text: match[3],
        pageId: match[4],
        anchor: match[5] ?? null,
      });
    }
    last = index + match[0].length;
  }
  if (last < source.length) {
    parts.push({ kind: 'text', text: source.slice(last) });
  }
  return parts;
}

/** Chữ thuần của chuỗi inline (bỏ ký hiệu định dạng). */
export function manualPlainText(source: string): string {
  return parseManualInline(source)
    .map((part) => part.text)
    .join('');
}

/** Id anchor của heading: chữ thường không dấu, nối bằng `-`. */
export function manualHeadingId(text: string): string {
  return slugifyTenantName(manualPlainText(text), Number.POSITIVE_INFINITY);
}

/** Mọi chuỗi của block (để tìm kiếm). */
export function manualBlockTexts(block: ManualBlock): string[] {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
    case 'code':
      return [block.text];
    case 'list':
      return block.items;
    case 'steps':
      return block.items.flatMap((item) =>
        item.text === undefined ? [item.title] : [item.title, item.text],
      );
    case 'table':
      return [...block.columns, ...block.rows.flat()];
    case 'callout':
      return block.title === undefined
        ? [block.text]
        : [block.title, block.text];
    case 'roles':
      return [];
  }
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every(isString);

function blockError(block: unknown): string | null {
  if (!isRecord(block)) return 'block không phải object';
  switch (block.type) {
    case 'heading':
      return (block.level === 2 || block.level === 3) && isString(block.text)
        ? null
        : 'heading cần level 2|3 và text';
    case 'paragraph':
    case 'code':
      return isString(block.text) ? null : `${block.type} cần text`;
    case 'list':
      return isStringArray(block.items) &&
        (block.ordered === undefined || typeof block.ordered === 'boolean')
        ? null
        : 'list cần items là mảng chuỗi';
    case 'steps':
      return Array.isArray(block.items) &&
        block.items.length > 0 &&
        block.items.every(
          (item) =>
            isRecord(item) &&
            isString(item.title) &&
            (item.text === undefined || isString(item.text)),
        )
        ? null
        : 'steps cần items { title, text? }';
    case 'table': {
      if (!isStringArray(block.columns)) return 'table cần columns';
      const width = block.columns.length;
      return Array.isArray(block.rows) &&
        block.rows.length > 0 &&
        block.rows.every(
          (row) =>
            Array.isArray(row) &&
            row.length === width &&
            row.every((cell) => typeof cell === 'string'),
        )
        ? null
        : `table cần rows đủ ${width} cột`;
    }
    case 'callout':
      return MANUAL_CALLOUT_TONES.includes(block.tone as ManualCalloutTone) &&
        isString(block.text) &&
        (block.title === undefined || isString(block.title))
        ? null
        : 'callout cần tone hợp lệ và text';
    case 'roles':
      return Array.isArray(block.roles) &&
        block.roles.length > 0 &&
        block.roles.every((role) => MANUAL_ROLES.includes(role as ManualRole))
        ? null
        : 'roles cần danh sách role hợp lệ';
    default:
      return `loại block không hỗ trợ: ${String(block.type)}`;
  }
}

/**
 * Kiểm cấu trúc tài liệu: kiểu block, id trang/nhóm duy nhất và đúng định dạng,
 * heading không trùng id trong trang, liên kết `page:` trỏ tới trang/heading có thật.
 * Trả về danh sách lỗi (rỗng = hợp lệ).
 */
export function validateUserManual(manual: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(manual)) return ['Tài liệu không phải object'];
  if (!isString(manual.title)) errors.push('Thiếu title');
  if (
    typeof manual.updatedAt !== 'string' ||
    !DATE_PATTERN.test(manual.updatedAt)
  ) {
    errors.push('updatedAt phải dạng YYYY-MM-DD');
  }
  if (!Array.isArray(manual.groups) || manual.groups.length === 0) {
    return [...errors, 'Thiếu groups'];
  }

  const groupIds = new Set<string>();
  const headings = new Map<string, Set<string>>();
  const pages: { id: string; blocks: ManualBlock[] }[] = [];

  manual.groups.forEach((group, g) => {
    if (!isRecord(group)) {
      errors.push(`groups[${g}] không phải object`);
      return;
    }
    const groupLabel = `nhóm ${String(group.id ?? g)}`;
    if (typeof group.id !== 'string' || !ID_PATTERN.test(group.id)) {
      errors.push(`${groupLabel}: id không hợp lệ`);
    } else if (groupIds.has(group.id)) {
      errors.push(`${groupLabel}: id bị trùng`);
    } else {
      groupIds.add(group.id);
    }
    if (!isString(group.title)) errors.push(`${groupLabel}: thiếu title`);
    if (!Array.isArray(group.pages) || group.pages.length === 0) {
      errors.push(`${groupLabel}: chưa có trang`);
      return;
    }

    group.pages.forEach((page, p) => {
      if (!isRecord(page)) {
        errors.push(`${groupLabel}.pages[${p}] không phải object`);
        return;
      }
      const label = `trang ${String(page.id ?? `${groupLabel}.pages[${p}]`)}`;
      const validId = typeof page.id === 'string' && ID_PATTERN.test(page.id);
      if (!validId) {
        errors.push(`${label}: id không hợp lệ`);
      } else if (headings.has(page.id as string)) {
        errors.push(`${label}: id bị trùng`);
      }
      if (!isString(page.title)) errors.push(`${label}: thiếu title`);
      if (!isString(page.summary)) errors.push(`${label}: thiếu summary`);
      if (
        !Array.isArray(page.roles) ||
        !page.roles.every((role) => MANUAL_ROLES.includes(role as ManualRole))
      ) {
        errors.push(`${label}: roles không hợp lệ`);
      }
      if (!Array.isArray(page.blocks) || page.blocks.length === 0) {
        errors.push(`${label}: chưa có nội dung`);
        return;
      }

      const ids = new Set<string>();
      let valid = true;
      page.blocks.forEach((block, b) => {
        const error = blockError(block);
        if (error) {
          valid = false;
          errors.push(`${label}.blocks[${b}]: ${error}`);
          return;
        }
        const typed = block as ManualBlock;
        if (typed.type === 'heading') {
          const id = manualHeadingId(typed.text);
          if (!id || ids.has(id)) {
            errors.push(`${label}: heading "${typed.text}" trùng hoặc rỗng id`);
          }
          ids.add(id);
        }
      });
      if (validId && !headings.has(page.id as string)) {
        headings.set(page.id as string, ids);
        if (valid) {
          pages.push({
            id: page.id as string,
            blocks: page.blocks as ManualBlock[],
          });
        }
      }
    });
  });

  // Liên kết kiểm sau cùng vì có thể trỏ tới trang nằm phía sau.
  for (const page of pages) {
    for (const block of page.blocks) {
      if (block.type === 'code') continue;
      for (const text of manualBlockTexts(block)) {
        for (const part of parseManualInline(text)) {
          if (part.kind !== 'link') continue;
          const target = headings.get(part.pageId);
          if (!target) {
            errors.push(
              `trang ${page.id}: liên kết tới trang không có "${part.pageId}"`,
            );
          } else if (part.anchor !== null && !target.has(part.anchor)) {
            errors.push(
              `trang ${page.id}: liên kết tới heading không có "${part.pageId}#${part.anchor}"`,
            );
          }
        }
      }
    }
  }
  return errors;
}
