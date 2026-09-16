import type { QuestionType } from '@lang/shared';
import { isIndicator, type TIndicatorElement } from './indicator';

// Tài liệu đề thi là một mảng block phẳng (list cũng là block phẳng có
// `listStyleType` + `indent`). Mọi ràng buộc — "chỉ tick 1 đáp án", "số thứ tự
// không trùng" — đều tính trong phạm vi một câu hỏi, nên gom về đây một chỗ.

interface ListLike {
  listStyleType?: string;
  indent?: number;
}

export interface QuestionScope {
  indicator: TIndicatorElement;
  /** Chỉ số block đầu tiên thuộc câu hỏi (ngay sau indicator). */
  from: number;
  /** Chỉ số block cuối + 1 (dừng ở indicator kế tiếp). */
  to: number;
}

function scopeEnd(blocks: readonly unknown[], from: number): number {
  for (let j = from; j < blocks.length; j += 1) {
    if (isIndicator(blocks[j])) return j;
  }
  return blocks.length;
}

/** Toàn bộ câu hỏi trong tài liệu, theo thứ tự xuất hiện. */
export function questionScopes(blocks: readonly unknown[]): QuestionScope[] {
  const out: QuestionScope[] = [];
  for (let i = 0; i < blocks.length; i += 1) {
    const node = blocks[i];
    if (!isIndicator(node) || node.kind !== 'question') continue;
    out.push({ indicator: node, from: i + 1, to: scopeEnd(blocks, i + 1) });
  }
  return out;
}

/**
 * Câu hỏi chứa block ở vị trí `index`.
 *
 * Đi ngược lên tới indicator gần nhất: nếu đó là `part`/`subpart` thì block này
 * là nội dung chung chứ không thuộc câu hỏi nào.
 */
export function questionScopeAt(
  blocks: readonly unknown[],
  index: number,
): QuestionScope | null {
  for (let i = Math.min(index, blocks.length - 1); i >= 0; i -= 1) {
    const node = blocks[i];
    if (!isIndicator(node)) continue;
    if (node.kind !== 'question') return null;
    return { indicator: node, from: i + 1, to: scopeEnd(blocks, i + 1) };
  }
  return null;
}

export function qtypeAt(
  blocks: readonly unknown[],
  index: number,
): QuestionType | undefined {
  return questionScopeAt(blocks, index)?.indicator.qtype;
}

/**
 * Dãy list item "cùng một list" với block ở `index`: các block liền nhau cùng
 * `listStyleType`, cùng mức thụt lề, không vượt qua ranh giới câu hỏi. List con
 * thụt sâu hơn nằm xen giữa không cắt dãy nhưng cũng không được tính vào.
 */
export function listRun(blocks: readonly unknown[], index: number): number[] {
  const node = blocks[index] as ListLike | undefined;
  const style = node?.listStyleType;
  if (!style) return [];
  const indent = node?.indent ?? 0;

  const scope = questionScopeAt(blocks, index);
  const lo = scope ? scope.from : 0;
  const hi = scope ? scope.to : blocks.length;

  const sameList = (i: number) => {
    const n = blocks[i] as ListLike | undefined;
    return n?.listStyleType === style && (n?.indent ?? 0) >= indent;
  };

  let start = index;
  while (start - 1 >= lo && sameList(start - 1)) start -= 1;
  let end = index;
  while (end + 1 < hi && sameList(end + 1)) end += 1;

  const out: number[] = [];
  for (let i = start; i <= end; i += 1) {
    if (((blocks[i] as ListLike).indent ?? 0) === indent) out.push(i);
  }
  return out;
}
