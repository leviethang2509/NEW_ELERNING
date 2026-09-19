import { isIndicator } from './indicator';
import type { ExamElement } from './node';

// Khối trình bày thêm cho đề thi / bài học (A8): callout, khối gập/mở, furigana.
// Chỉ để hiển thị, không ảnh hưởng đánh số hay chấm điểm; tài liệu vẫn là mảng
// block phẳng như mọi khối khác.

export const CALLOUT_KEY = 'callout';
export const TOGGLE_KEY = 'toggle';
export const RUBY_KEY = 'ruby';

export const CALLOUT_VARIANTS = ['note', 'example', 'tip'] as const;
export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

/** Màu viền/nhãn của từng loại callout (nhãn chữ ở lang-app). */
export const CALLOUT_COLORS: Record<CalloutVariant, string> = {
  note: '#268bd2',
  example: '#859900',
  tip: '#b58900',
};

/** Callout: một block chữ (xuống dòng bằng `\n`) kèm loại. */
export interface TCalloutElement extends ExamElement {
  type: typeof CALLOUT_KEY;
  variant?: CalloutVariant;
}

/** Furigana: inline element, chữ gốc là `children`, cách đọc ở `rt`. */
export interface TRubyElement extends ExamElement {
  type: typeof RUBY_KEY;
  rt?: string;
}

export function isCallout(node: unknown): node is TCalloutElement {
  return (node as { type?: unknown } | null | undefined)?.type === CALLOUT_KEY;
}

export function calloutVariant(node: TCalloutElement): CalloutVariant {
  return CALLOUT_VARIANTS.includes(node.variant as CalloutVariant)
    ? (node.variant as CalloutVariant)
    : 'note';
}

export function isRuby(node: unknown): node is TRubyElement {
  return (node as { type?: unknown } | null | undefined)?.type === RUBY_KEY;
}

export function isToggle(node: unknown): boolean {
  return (node as { type?: unknown } | null | undefined)?.type === TOGGLE_KEY;
}

/**
 * Mức thụt lề nhìn thấy của một block. Dòng danh sách ở mức ngoài cùng đã có
 * `indent: 1` nên trừ đi 1 — danh sách ngay sau khối gập/mở không bị tính là
 * nội dung của nó.
 */
export function blockDepth(node: unknown): number {
  const { indent, listStyleType } = node as {
    indent?: unknown;
    listStyleType?: unknown;
  };
  const value = typeof indent === 'number' && indent > 0 ? indent : 0;
  return listStyleType ? Math.max(0, value - 1) : value;
}

/**
 * Khối gập/mở ở `index`: nội dung là các block liền sau thụt sâu hơn tiêu đề,
 * dừng ở indicator hoặc khi `stop` trả về true. Trả về chỉ số block cuối + 1.
 */
export function toggleEnd(
  blocks: readonly unknown[],
  index: number,
  stop?: (node: unknown) => boolean,
): number {
  const depth = blockDepth(blocks[index]);
  let end = index + 1;
  while (
    end < blocks.length &&
    !isIndicator(blocks[end]) &&
    blockDepth(blocks[end]) > depth &&
    !stop?.(blocks[end])
  ) {
    end += 1;
  }
  return end;
}
