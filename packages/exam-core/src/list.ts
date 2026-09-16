import type { ExamElement } from './node';

// List của Plate là block phẳng có `listStyleType` + `indent`. Hai kiểu mang
// đáp án: `todo` (tick = lựa chọn đúng) và `ordering` (số tay `num` = thứ tự
// đúng / trọng số điểm).

export const TODO_STYLE = 'todo';

/** listStyleType cho danh sách có đánh số tay (Ordering / Polytomous). */
export const ORDERING_STYLE = 'ordering';

export interface TListItem extends ExamElement {
  listStyleType?: string;
  indent?: number;
  /** Dòng `todo` được tick. Bị bỏ trong content_public. */
  checked?: boolean;
  /** Số thứ tự / trọng số người soạn gán cho dòng `ordering`. Bị bỏ trong content_public. */
  num?: number;
  /** Chỉ số gốc của dòng `ordering` trong câu hỏi, chỉ có trong content_public. */
  key?: number;
}

/** Tên cũ ở lightc-general. */
export type TOrderingItem = TListItem;

export function isTodo(node: unknown): node is TListItem {
  return (node as TListItem | null | undefined)?.listStyleType === TODO_STYLE;
}

export function isOrderingItem(node: unknown): node is TListItem {
  return (
    (node as TListItem | null | undefined)?.listStyleType === ORDERING_STYLE
  );
}
