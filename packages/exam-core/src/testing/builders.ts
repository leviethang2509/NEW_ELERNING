import type { ExamElement, ExamNode } from '../node';

// Dựng nhanh nội dung section cho test.

type Props = Record<string, unknown>;

export const text = (value: string): ExamNode => ({ text: value });

export const p = (
  content: string | ExamNode[],
  props: Props = {},
): ExamElement => ({
  type: 'p',
  ...props,
  children: typeof content === 'string' ? [text(content)] : content,
});

export const part = (id: string): ExamElement => ({
  type: 'indicator',
  id,
  kind: 'part',
  children: [text('')],
});

export const subpart = (id: string): ExamElement => ({
  type: 'indicator',
  id,
  kind: 'subpart',
  children: [text('')],
});

export const question = (
  id: string,
  qtype: string,
  props: Props = {},
): ExamElement => ({
  type: 'indicator',
  id,
  kind: 'question',
  qtype,
  ...props,
  children: [text('')],
});

export const todo = (label: string, checked = false): ExamElement =>
  p(label, { listStyleType: 'todo', indent: 1, checked });

export const orderingItem = (label: string, num?: number): ExamElement =>
  p(label, {
    listStyleType: 'ordering',
    ...(num === undefined ? {} : { num }),
  });

export const pair = (label: string, answer: string): ExamElement => ({
  type: 'pair',
  id: `pair-${label}`,
  answer,
  children: [text(label)],
});

export const blank = (answer: string): ExamElement => ({
  type: 'blank',
  children: [text(answer)],
});

export const explanation = (id: string): ExamElement => ({
  type: 'indicator',
  id,
  kind: 'explanation',
  children: [text('')],
});

/**
 * Chèn một giải thích sau mỗi câu hỏi. Nội dung cố tình có checkbox đã tick,
 * blank, cặp ghép, dòng đánh số — không được ảnh hưởng đánh số hay chấm điểm.
 */
export function withExplanations(value: readonly ExamElement[]): ExamElement[] {
  const out: ExamElement[] = [];
  const flush = (id: string) =>
    out.push(
      explanation(`${id}-explain`),
      p([text('Vì '), blank('bí mật'), text(' nên đúng.')]),
      todo('Lựa chọn trong giải thích', true),
      pair('Cặp trong giải thích', 'A'),
      orderingItem('Dòng trong giải thích', 1),
    );
  let pending: string | null = null;
  for (const node of value) {
    const isIndicatorNode = node.type === 'indicator';
    if (isIndicatorNode && pending) {
      flush(pending);
      pending = null;
    }
    if (isIndicatorNode && node.kind === 'question') pending = String(node.id);
    out.push(node);
  }
  if (pending) flush(pending);
  return out;
}
