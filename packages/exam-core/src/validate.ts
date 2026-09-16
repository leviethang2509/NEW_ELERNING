import { blanksIn } from './blank';
import { INDICATOR_KINDS, isIndicator, questionTypeMeta } from './indicator';
import { isOrderingItem, isTodo } from './list';
import { collectDataUrls } from './media';
import {
  MAX_NODE_ID_LENGTH,
  isExamValue,
  isPositiveInteger,
  plainText,
  type ExamElement,
} from './node';
import { isPair, pairAnswer, pairOptions } from './pair';
import { buildPlan } from './plan';
import { questionScopes } from './scope';

// Kiểm tra nội dung section. Chỉ nhìn dữ liệu, không đụng editor:
// - `validateExam`: lỗi soạn thảo (editor hiện ở bảng kiểm tra, chặn publish);
// - `validateSectionShape`: lỗi khiến server không lưu được (Save);
// - `validateSection`: gộp cả hai + cảnh báo, dùng khi publish.

export type IssueSeverity = 'error' | 'warning';

export interface Issue {
  key: string;
  /** `null` khi vấn đề thuộc cả section, không gắn với indicator nào. */
  indicatorId: string | null;
  message: string;
  severity: IssueSeverity;
}

const isEmptyText = (node: unknown) => plainText(node).trim() === '';

const STANDALONE = new Set(['img', 'audio', 'video', 'hr', 'table']);

export function validateExam(value: readonly ExamElement[]): Issue[] {
  const issues: Issue[] = [];

  for (const scope of questionScopes(value)) {
    const { indicator } = scope;
    const id = indicator.id;
    const add = (message: string) =>
      issues.push({
        key: `${id}:${issues.length}`,
        indicatorId: id,
        message,
        severity: 'error',
      });

    const meta = questionTypeMeta(indicator.qtype);
    if (!meta) {
      add('Chưa chọn dạng câu hỏi.');
      continue;
    }

    const blocks = value.slice(scope.from, scope.to);
    const hasContent = blocks.some(
      (b) => !isEmptyText(b) || STANDALONE.has(b.type ?? ''),
    );
    if (!hasContent) {
      add('Câu hỏi rỗng — chưa có nội dung nào.');
      continue;
    }

    if (meta.input === 'choice') {
      const items = blocks.filter(isTodo);
      if (!items.length) {
        add('Chưa có danh sách lựa chọn (danh sách checkbox).');
      } else {
        const checked = items.filter((i) => i.checked).length;
        if (!checked) add('Chưa tick đáp án nào.');
        else if (indicator.qtype === 'mc-single' && checked > 1) {
          add(`Dạng 1 đáp án nhưng đang tick ${checked} ô.`);
        }
        if (indicator.qtype === 'pick-n') {
          const { maxPicks } = indicator;
          if (!isPositiveInteger(maxPicks)) {
            add('Chưa đặt số đáp án cần chọn — bấm badge để nhập.');
          } else if (maxPicks > items.length) {
            add(
              `Cần chọn ${maxPicks} đáp án nhưng chỉ có ${items.length} lựa chọn.`,
            );
          } else if (checked && checked !== maxPicks) {
            add(`Cần ${maxPicks} đáp án đúng nhưng đang tick ${checked} ô.`);
          }
        }
      }
    }

    if (meta.input === 'pair') {
      const pairs = blocks.filter(isPair);
      const options = pairOptions(indicator);
      if (indicator.qtype === 'matching' && (options?.length ?? 0) < 2) {
        add('Chưa khai báo danh sách option — bấm badge để nhập.');
      } else if (options) {
        const outside = pairs.filter((p) => {
          const answer = pairAnswer(p);
          return answer && !options.includes(answer);
        }).length;
        if (outside) {
          add(`${outside} cặp có đáp án không nằm trong danh sách option.`);
        }
      }

      if (!pairs.length) {
        add('Chưa có cặp ghép nào — dùng nút "Cặp ghép" trên thanh công cụ.');
      } else {
        const noPrompt = pairs.filter(isEmptyText).length;
        const noAnswer = pairs.filter((p) => !pairAnswer(p)).length;
        if (noPrompt) add(`${noPrompt} cặp chưa nhập phần hiển thị.`);
        if (noAnswer) add(`${noAnswer} cặp chưa có đáp án.`);
      }
    }

    if (meta.input === 'blank' && !blanksIn(blocks).length) {
      add('Chưa đánh dấu ô trống nào (bôi đen rồi Ctrl+Shift+B).');
    }

    if (meta.input === 'ordering') {
      const items = blocks.filter(isOrderingItem);
      if (!items.length) {
        add('Chưa có danh sách đánh số — dùng nút "Danh sách đánh số tay".');
      } else {
        const nums = items
          .map((i) => i.num)
          .filter((n): n is number => Number.isFinite(n));
        const missing = items.length - nums.length;
        if (missing) add(`${missing} dòng chưa nhập số.`);

        if (indicator.qtype === 'ordering' && !missing) {
          const sorted = [...nums].sort((a, b) => a - b);
          const ok = sorted.every((n, i) => n === i + 1);
          if (new Set(nums).size !== nums.length) {
            add('Có số thứ tự bị trùng trong cùng danh sách.');
          } else if (!ok) {
            add(`Thứ tự phải là 1..${items.length} liên tục.`);
          }
        }
      }
    }

    if (
      indicator.qtype === 'speaking' &&
      !isPositiveInteger(indicator.seconds)
    ) {
      add('Chưa đặt thời gian nói.');
    }
    if (
      indicator.qtype === 'writing' &&
      !isPositiveInteger(indicator.maxChars)
    ) {
      add('Chưa đặt giới hạn số ký tự.');
    }
  }

  return issues;
}

const isStringList = (value: unknown) =>
  Array.isArray(value) && value.every((v) => typeof v === 'string');

/** Lỗi khiến server không lưu được nội dung section. Rỗng = lưu được. */
export function validateSectionShape(value: unknown): string[] {
  if (!isExamValue(value)) return ['Nội dung section không đúng định dạng.'];

  const errors: string[] = [];
  const ids = new Set<string>();
  let invalid = 0;
  let duplicated = 0;
  for (const node of value) {
    if (!isIndicator(node)) continue;
    if (
      typeof node.id !== 'string' ||
      node.id === '' ||
      node.id.length > MAX_NODE_ID_LENGTH ||
      !INDICATOR_KINDS.includes(node.kind) ||
      (node.options !== undefined && !isStringList(node.options))
    ) {
      invalid += 1;
    } else if (ids.has(node.id)) {
      duplicated += 1;
    } else {
      ids.add(node.id);
    }
  }
  if (invalid) errors.push(`${invalid} indicator thiếu id hoặc sai định dạng.`);
  if (duplicated) errors.push(`${duplicated} indicator bị trùng id.`);

  const dataUrls = collectDataUrls(value).length;
  if (dataUrls) {
    errors.push(
      `Còn ${dataUrls} media nhúng dạng data: URI — cần upload trước khi lưu.`,
    );
  }
  return errors;
}

/** Toàn bộ vấn đề của section; publish được khi không có `error`. */
export function validateSection(value: unknown): Issue[] {
  const issues: Issue[] = validateSectionShape(value).map((message, i) => ({
    key: `section:${i}`,
    indicatorId: null,
    message,
    severity: 'error',
  }));
  if (!isExamValue(value)) return issues;

  issues.push(...validateExam(value));
  if (buildPlan(value).parts.every((part) => part.numbers.length === 0)) {
    issues.push({
      key: 'section:no-question',
      indicatorId: null,
      message: 'Section chưa có câu hỏi nào.',
      severity: 'warning',
    });
  }
  return issues;
}

export function hasErrors(issues: readonly Issue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}
