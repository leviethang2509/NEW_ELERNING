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
