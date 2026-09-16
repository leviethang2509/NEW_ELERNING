import { childrenOf, type ExamElement } from './node';

// Blank: ô trống trong đề. Là inline element (không phải mark) để mỗi ô giữ
// được ranh giới riêng — hai ô nằm sát nhau vẫn là hai ô, và bước xử lý dữ
// liệu đánh số / gắn đáp án được theo từng ô. Chữ trong ô là đáp án, nhiều đáp
// án chấp nhận ngăn bằng `|`.

export const BLANK_KEY = 'blank';

export interface TBlankElement extends ExamElement {
  type: typeof BLANK_KEY;
}

export function isBlank(node: unknown): node is TBlankElement {
  return (node as { type?: unknown } | null | undefined)?.type === BLANK_KEY;
}

/** Mọi blank trong các node theo thứ tự đọc — cũng là thứ tự đánh số câu. */
export function blanksIn(nodes: readonly unknown[]): TBlankElement[] {
  const out: TBlankElement[] = [];
  for (const node of nodes) {
    if (isBlank(node)) out.push(node);
    else out.push(...blanksIn(childrenOf(node)));
  }
  return out;
}
