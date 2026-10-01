import { BLANK_KEY } from '../blank';
import {
  childrenOf,
  isText,
  plainText,
  type ExamElement,
  type ExamNode,
  type ExamText,
} from '../node';

// Tìm đoạn chữ AI trích nguyên văn trong một block và sửa đúng đoạn đó (xoá
// hoặc biến thành blank), giữ nguyên định dạng (mark) của phần chữ còn lại.
//
// "Container" là element có con là text – tức một dòng chữ: paragraph thường,
// hoặc paragraph trong ô bảng. Một đoạn khớp phải nằm gọn trong một container
// và không chồng lên inline element có sẵn (blank, link, furigana).

/** Vị trí đoạn khớp: container thứ mấy (theo thứ tự đọc) và khoảng ký tự. */
export interface TextRange {
  container: number;
  start: number;
  end: number;
}

export type TextEdit = { kind: 'remove' } | { kind: 'blank'; answer: string };

/** Các container của block theo thứ tự đọc. */
export function textContainers(block: ExamElement): ExamElement[] {
  const out: ExamElement[] = [];
  const walk = (node: ExamElement) => {
    const children = childrenOf(node);
    if (children.some(isText)) {
      out.push(node);
      return;
    }
    for (const child of children) {
      if (!isText(child)) walk(child as ExamElement);
    }
  };
  walk(block);
  return out;
}

/** Chữ của block như AI thấy: các container nối bằng ` | ` (ô bảng, dòng code). */
export function blockText(block: ExamElement): string {
  return textContainers(block).map(plainText).join(' | ');
}

/** Chữ gốc của đoạn `range` trong block. */
export function rangeText(block: ExamElement, range: TextRange): string {
  return plainText(textContainers(block)[range.container]).slice(
    range.start,
    range.end,
  );
}

// Chuẩn hoá 1-1 ký tự (không đổi độ dài) cho các ký tự AI hay chép sai:
// khoảng trắng không ngắt, nháy cong, gạch dài.
const LOOSE_CHARS: Record<string, string> = {
  '\u00a0': ' ',
  '\u2007': ' ',
  '\u202f': ' ',
  '\u2018': "'",
  '\u2019': "'",
  '\u201a': "'",
  '\u201b': "'",
  '\u201c': '"',
  '\u201d': '"',
  '\u201e': '"',
  '\u2013': '-',
  '\u2014': '-',
};

const loosen = (text: string) =>
  Array.from(text, (c) => LOOSE_CHARS[c] ?? c).join('');

function occurrencesOf(
  texts: readonly string[],
  match: string,
): { container: number; start: number }[] {
  const found: { container: number; start: number }[] = [];
  texts.forEach((text, container) => {
    let from = 0;
    for (;;) {
      const start = text.indexOf(match, from);
      if (start < 0) break;
      found.push({ container, start });
      from = start + match.length;
    }
  });
  return found;
}

/** Khoảng ký tự của từng con trong container (text và inline element). */
function childSpans(container: ExamElement) {
  let offset = 0;
  return (container.children as ExamNode[]).map((node) => {
    const length = plainText(node).length;
    const span = { node, start: offset, end: offset + length };
    offset += length;
    return span;
  });
}

/** Ký tự của ô trống in sẵn ("………", "____", "....."). */
const GAP_CHAR = /[.…_]/;
const GAP_RUN = /…|\.\.|__/;

/** Đoạn chữ có ô trống in sẵn (chuỗi chấm / gạch dưới). */
export const isPrintedGap = (text: string) => GAP_RUN.test(text);

/**
 * Đoạn khớp là ô trống in sẵn thì nới ra hết các ký tự chấm/gạch dưới liền kề:
 * AI hay đếm thiếu ký tự "…" nên để sót một phần ô trống trong câu.
 */
function widenGap(text: string, start: number, end: number) {
  if (!GAP_RUN.test(text.slice(start, end))) return { start, end };
  while (start > 0 && GAP_CHAR.test(text[start - 1])) start -= 1;
  while (end < text.length && GAP_CHAR.test(text[end])) end += 1;
  return { start, end };
}

/**
 * Tìm lần khớp thứ `occurrence` (từ 1) của `match` trong block. So nguyên văn
 * trước, không thấy thì so sau khi chuẩn hoá ký tự. Trả chuỗi lỗi nếu không
 * tìm được hoặc đoạn khớp chồng lên inline element. `gap` = nới đoạn khớp ra
 * hết ô trống in sẵn (`widenGap`, dùng cho blank).
 */
export function resolveTextRange(
  block: ExamElement,
  match: string,
  occurrence = 1,
  gap = false,
): TextRange | string {
  const containers = textContainers(block);
  const texts = containers.map(plainText);
  let found = occurrencesOf(texts, match);
  if (!found.length) found = occurrencesOf(texts.map(loosen), loosen(match));
  if (!found.length) return `Không tìm thấy nguyên văn "${match}" trong block.`;
  const hit = found[occurrence - 1];
  if (!hit) {
    return `"${match}" chỉ xuất hiện ${found.length} lần trong block.`;
  }
  const range = {
    container: hit.container,
    ...(gap
      ? widenGap(texts[hit.container], hit.start, hit.start + match.length)
      : { start: hit.start, end: hit.start + match.length }),
  };
  const overlapsInline = childSpans(containers[range.container]).some(
    (span) =>
      !isText(span.node) && span.start < range.end && range.start < span.end,
  );
  if (overlapsInline) {
    return `"${match}" chồng lên blank/link có sẵn trong block.`;
  }
  return range;
}

const cloneNode = <T>(node: T): T => JSON.parse(JSON.stringify(node)) as T;

function editContainer(
  container: ExamElement,
  start: number,
  end: number,
  edit: TextEdit,
) {
  const next: ExamNode[] = [];
  let inserted = false;
  for (const span of childSpans(container)) {
    if (span.end <= start || span.start >= end || !isText(span.node)) {
      next.push(span.node);
      continue;
    }
    const leaf = span.node as ExamText;
    if (span.start < start) {
      next.push({ ...leaf, text: leaf.text.slice(0, start - span.start) });
    }
    if (!inserted && edit.kind === 'blank') {
      // Inline element luôn có text đứng hai bên (quy tắc của Slate).
      if (!next.length || !isText(next[next.length - 1]))
        next.push({ text: '' });
      next.push({ type: BLANK_KEY, children: [{ text: edit.answer }] });
      next.push({ text: '' });
    }
    inserted = true;
    if (span.end > end) {
      next.push({ ...leaf, text: leaf.text.slice(end - span.start) });
    }
  }
  container.children = next.length ? next : [{ text: '' }];
}

/**
 * Bản sao của block với các đoạn đã sửa. Mọi `range` tính trên block gốc và
 * không chồng nhau (`resolveTextRange` + kiểm ở nơi gọi); sửa từ cuối lên đầu
 * để vị trí phía trước không bị lệch.
 */
export function applyTextEdits(
  block: ExamElement,
  edits: readonly { range: TextRange; edit: TextEdit }[],
): ExamElement {
  const copy = cloneNode(block);
  const containers = textContainers(copy);
  const ordered = [...edits].sort(
    (a, b) =>
      b.range.container - a.range.container || b.range.start - a.range.start,
  );
  for (const { range, edit } of ordered) {
    editContainer(containers[range.container], range.start, range.end, edit);
  }
  return copy;
}

export function rangesOverlap(a: TextRange, b: TextRange): boolean {
  return a.container === b.container && a.start < b.end && b.start < a.end;
}

/**
 * Vị trí tách của `split`: mỗi đoạn `at` tìm **sau** vị trí tách trước (nên chữ
 * lặp lại không cần `occurrence`). Block phải là một dòng chữ (một container là
 * chính nó); điểm tách không được ở giữa inline element, đoạn trùng đầu dòng bị
 * bỏ qua.
 */
export function resolveSplitOffsets(
  block: ExamElement,
  at: readonly string[],
): number[] | string {
  const containers = textContainers(block);
  if (containers.length !== 1 || containers[0] !== block) {
    return 'Chỉ tách được block là một dòng chữ.';
  }
  const text = plainText(block);
  const loose = loosen(text);
  const spans = childSpans(block);
  const offsets: number[] = [];
  let from = 1;
  for (const piece of at) {
    // AI hay liệt kê cả chữ đầu block (phần đầu): bỏ qua, không phải lỗi.
    if (!offsets.length && loose.startsWith(loosen(piece))) continue;
    let start = text.indexOf(piece, from);
    if (start < 0) start = loose.indexOf(loosen(piece), from);
    if (start < 0) {
      return `Không tìm thấy nguyên văn "${piece}" sau điểm tách trước trong block.`;
    }
    const insideInline = spans.some(
      (span) => !isText(span.node) && span.start < start && start < span.end,
    );
    if (insideInline) return `"${piece}" nằm trong blank/link có sẵn.`;
    offsets.push(start);
    from = start + 1;
  }
  return offsets;
}

/** Các phần của block sau khi tách tại `offsets` (tăng dần); nối lại bằng đúng chữ gốc. */
export function splitBlock(
  block: ExamElement,
  offsets: readonly number[],
): ExamElement[] {
  const bounds = [0, ...offsets, plainText(block).length];
  const spans = childSpans(block);
  return bounds.slice(0, -1).map((start, k) => {
    const end = bounds[k + 1];
    const children: ExamNode[] = [];
    for (const span of spans) {
      if (span.end <= start || span.start >= end) {
        // Inline element rỗng (blank chưa có chữ) đi theo phần chứa vị trí của nó.
        if (
          span.start === span.end &&
          span.start >= start &&
          span.start < end
        ) {
          children.push(cloneNode(span.node));
        }
        continue;
      }
      if (!isText(span.node)) {
        children.push(cloneNode(span.node));
        continue;
      }
      const leaf = span.node as ExamText;
      children.push({
        ...leaf,
        text: leaf.text.slice(
          Math.max(0, start - span.start),
          Math.min(leaf.text.length, end - span.start),
        ),
      });
    }
    // Inline element luôn có text đứng hai bên (quy tắc của Slate).
    if (!children.length || !isText(children[0]))
      children.unshift({ text: '' });
    if (!isText(children[children.length - 1])) children.push({ text: '' });
    return { ...cloneNode(block), children } as ExamElement;
  });
}
