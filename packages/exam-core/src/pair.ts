import type { QuestionType } from '@lang/shared';
import { createNodeId } from './id';
import type { TIndicatorElement } from './indicator';
import type { ExamElement } from './node';

// Cặp ghép dùng cho Matching / True-False-Not Given / Yes-No-Not Given.
//
// Mỗi cặp là MỘT block: phần hiển thị là nội dung soạn thảo bình thường, còn
// đáp án nằm ở node prop `answer` (editor nhập qua input / select).

export const PAIR_KEY = 'pair';

export interface TPairElement extends ExamElement {
  type: typeof PAIR_KEY;
  id: string;
  /** Đáp án của cặp — text tự do (matching) hoặc một giá trị cố định. */
  answer?: string;
}

export const TFNG_OPTIONS: readonly string[] = ['True', 'False', 'Not Given'];
export const YNNG_OPTIONS: readonly string[] = ['Yes', 'No', 'Not Given'];

/** Bộ đáp án cố định của dạng câu hỏi; `null` nghĩa là nhập tự do. */
export function fixedOptions(
  qtype: QuestionType | undefined,
): readonly string[] | null {
  if (qtype === 'tfng') return TFNG_OPTIONS;
  if (qtype === 'ynng') return YNNG_OPTIONS;
  return null;
}

/**
 * Tập đáp án của các cặp trong một câu hỏi: TFNG/YNNG cố định, matching lấy từ
 * `options` khai báo trên indicator. `null` nghĩa là nhập tự do — matching đời
 * cũ chưa khai báo option.
 */
export function pairOptions(
  indicator: TIndicatorElement | null | undefined,
): readonly string[] | null {
  const fixed = fixedOptions(indicator?.qtype);
  if (fixed) return fixed;
  const options: unknown =
    indicator?.qtype === 'matching' ? indicator.options : undefined;
  return Array.isArray(options) &&
    options.length > 0 &&
    options.every((o) => typeof o === 'string')
    ? options
    : null;
}

/** Đáp án của cặp đã bỏ khoảng trắng hai đầu; chưa nhập thì rỗng. */
export function pairAnswer(pair: TPairElement): string {
  return typeof pair.answer === 'string' ? pair.answer.trim() : '';
}

/**
 * Lựa chọn hiển thị cho người làm bài: như `pairOptions`; matching đời cũ chưa
 * khai báo option thì gom đáp án của các cặp, bỏ trùng và sắp xếp lại để không
 * lộ thứ tự.
 */
export function pairChoices(
  indicator: TIndicatorElement | null | undefined,
  pairs: readonly TPairElement[],
): string[] {
  const options = pairOptions(indicator);
  if (options) return [...options];
  const seen = new Set<string>();
  for (const pair of pairs) {
    const answer = pairAnswer(pair);
    if (answer) seen.add(answer);
  }
  return [...seen].sort((a, b) => a.localeCompare(b, 'en'));
}

export function isPair(node: unknown): node is TPairElement {
  return (node as { type?: unknown } | null | undefined)?.type === PAIR_KEY;
}

export function createPair(id: string = createNodeId()): TPairElement {
  return {
    type: PAIR_KEY,
    id,
    answer: '',
    children: [{ text: '' }],
  };
}
