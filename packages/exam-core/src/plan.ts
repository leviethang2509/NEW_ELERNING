import type { QuestionType } from '@lang/shared';
import { blanksIn } from './blank';
import {
  isIndicator,
  isQuestionType,
  questionTypeMeta,
  type TIndicatorElement,
} from './indicator';
import { isTodo } from './list';
import { isPositiveInteger, type ExamElement } from './node';
import { isPair } from './pair';

// Bố cục + đánh số của bản giả lập, tính một lần từ nội dung một section.
//
// Số thứ tự câu chạy suốt section từ 1. Cách đếm theo dạng câu hỏi:
// - multiple choice (1 / nhiều đáp án), ordering, polytomous, speaking,
//   writing: mỗi indicator question là 1 câu.
// - pick-n: n câu, n = `maxPicks` ("Choose FOUR letters" = 4).
// - matching / TFNG / YNNG: mỗi cặp là 1 câu.
// - fill-blank: mỗi blank là 1 câu.
//
// Renderer, `extractStructure` và chấm điểm đều đánh số theo cùng thứ tự này.

export type NumberingMode = 'question' | 'pick' | 'pair' | 'blank';

export interface Segment {
  indicator: TIndicatorElement | null;
  blocks: ExamElement[];
  /** Số thứ tự đầu tiên của câu hỏi (0 nếu segment không phải câu hỏi). */
  start: number;
  /** Số câu tính cho segment. */
  count: number;
}

export interface PreviewPart {
  key: string;
  /** Indicator của part; `null` với part ngầm chứa nội dung trước part đầu tiên. */
  indicator: TIndicatorElement | null;
  /** Nội dung ngay dưới indicator part — passage, hiện ở cột trái. */
  passage: ExamElement[];
  /** Subpart, question và explanation thuộc part, hiện ở cột phải. */
  items: Segment[];
  /** Mọi số thứ tự nằm trong part, tăng dần. */
  numbers: number[];
}

export interface PreviewPlan {
  /** Nội dung đứng trước indicator đầu tiên. */
  intro: ExamElement[];
  parts: PreviewPart[];
}

export function numberingMode(qtype: QuestionType): NumberingMode {
  if (qtype === 'pick-n') return 'pick';
  const input = questionTypeMeta(qtype)?.input;
  if (input === 'pair') return 'pair';
  if (input === 'blank') return 'blank';
  return 'question';
}

/** Dạng của segment câu hỏi; `undefined` nếu không phải câu hỏi hoặc chưa chọn dạng hợp lệ. */
export function segmentQtype(seg: Segment): QuestionType | undefined {
  const qtype = seg.indicator?.kind === 'question' && seg.indicator.qtype;
  return isQuestionType(qtype) ? qtype : undefined;
}

export function range(start: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => start + i);
}

/**
 * Số câu của pick-n. Đề cũ chưa có `maxPicks` thì tạm đếm số ô đã tick; không
 * vượt quá số lựa chọn để dữ liệu hỏng không sinh ra hàng loạt câu.
 */
export function pickCount(
  indicator: TIndicatorElement,
  blocks: readonly ExamElement[],
): number {
  const items = blocks.filter(isTodo);
  if (isPositiveInteger(indicator.maxPicks)) {
    return Math.min(indicator.maxPicks, Math.max(1, items.length));
  }
  return Math.max(1, items.filter((n) => n.checked).length);
}

function questionCount(
  indicator: TIndicatorElement,
  qtype: QuestionType,
  blocks: ExamElement[],
): number {
  switch (numberingMode(qtype)) {
    case 'pair':
      return blocks.filter(isPair).length;
    case 'blank':
      return blanksIn(blocks).length;
    case 'pick':
      return pickCount(indicator, blocks);
    default:
      return 1;
  }
}

export function buildPlan(value: readonly ExamElement[]): PreviewPlan {
  const head: Segment = { indicator: null, blocks: [], start: 0, count: 0 };
  const rest: Segment[] = [];
  for (const node of value) {
    if (isIndicator(node)) {
      rest.push({ indicator: node, blocks: [], start: 0, count: 0 });
    } else {
      (rest.at(-1) ?? head).blocks.push(node);
    }
  }

  let next = 1;
  const parts: PreviewPart[] = [];

  for (const seg of rest) {
    const indicator = seg.indicator;
    if (!indicator) continue;
    if (indicator.kind === 'part') {
      parts.push({
        key: indicator.id,
        indicator,
        passage: seg.blocks,
        items: [],
        numbers: [],
      });
      continue;
    }
    // Subpart / question đứng trước part đầu tiên: gom vào một part ngầm.
    if (parts.length === 0) {
      parts.push({
        key: 'implicit',
        indicator: null,
        passage: [],
        items: [],
        numbers: [],
      });
    }
    const part = parts[parts.length - 1];
    const qtype = segmentQtype(seg);
    if (qtype) {
      seg.start = next;
      seg.count = questionCount(indicator, qtype, seg.blocks);
      next += seg.count;
      part.numbers.push(...range(seg.start, seg.count));
    }
    part.items.push(seg);
  }

  return { intro: head.blocks, parts };
}
