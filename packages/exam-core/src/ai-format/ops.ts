import type { QuestionType } from '@lang/shared';
import {
  INDICATOR_KINDS,
  isQuestionType,
  type IndicatorKind,
} from '../indicator';
import { isPositiveInteger } from '../node';

// Thao tác AI trả về khi định dạng một section (req-5 plan 4.2). AI không viết
// lại nội dung: mọi thao tác trỏ vào block của văn bản gốc theo chỉ số (`[i]`
// trong `formatAiBlocks`), và chỉ được chèn indicator, tách một dòng thành
// nhiều dòng, đổi loại block, xoá chữ khớp nguyên văn hoặc biến chữ khớp nguyên
// văn thành blank.
//
// Chỉ số block (`AiBlockRef`): `i` là block gốc; block `i` đã bị `split` thì
// `i.1`, `i.2`… (tối đa `AI_SPLIT_MAX_PIECES - 1`) là các phần sau, `i` (= `i.0`)
// là phần đầu.

/** Số lần gọi AI tối đa cho một lần bấm (plan 1.10). */
export const AI_FORMAT_MAX_ATTEMPTS = 3;
/** Giới hạn đầu vào của một section (plan, giả định 7). */
export const AI_FORMAT_MAX_BLOCKS = 2000;
export const AI_FORMAT_MAX_CHARS = 150_000;
/** Một block tách được tối đa bao nhiêu phần (chỉ số phần là một chữ số thập phân). */
export const AI_SPLIT_MAX_PIECES = 10;

/** Chỉ số block: số nguyên = block gốc, `i.k` = phần thứ k của block `i` đã tách. */
export type AiBlockRef = number;

/** Tách `ref` thành block gốc + phần (0 = phần đầu / block chưa tách). */
export function blockRefParts(ref: AiBlockRef): {
  block: number;
  piece: number;
} {
  const block = Math.floor(ref);
  return { block, piece: Math.round((ref - block) * 10) };
}

/** Tách block thành nhiều dòng ngay trước mỗi đoạn `at` (khớp nguyên văn, theo thứ tự). */
export interface AiSplitOp {
  op: 'split';
  block: number;
  at: string[];
}

/** Chèn indicator ngay trước block `before` (bằng số block = cuối section). */
export interface AiIndicatorOp {
  op: 'indicator';
  before: number;
  kind: IndicatorKind;
  qtype?: QuestionType;
  seconds?: number;
  maxChars?: number;
  maxPicks?: number;
  options?: string[];
}

/** Các block thành danh sách checkbox; `correct` là các block được tick. */
export interface AiChoicesOp {
  op: 'choices';
  blocks: number[];
  correct: number[];
}

/** Các block thành cặp ghép; `answers[k]` là đáp án của `blocks[k]` (rỗng = chưa có). */
export interface AiPairsOp {
  op: 'pairs';
  blocks: number[];
  answers: string[];
}

/** Các block thành dòng đánh số tay (ordering / polytomous); `null` = chưa có số. */
export interface AiNumberedOp {
  op: 'numbered';
  blocks: number[];
  nums: (number | null)[];
}

/** Đoạn chữ khớp nguyên văn `match` (lần thứ `occurrence`, từ 1) trong block thành blank chứa `answer`. */
export interface AiBlankOp {
  op: 'blank';
  block: number;
  match: string;
  occurrence?: number;
  answer: string;
}

/** Xoá đoạn chữ khớp nguyên văn (vd. "Answer: B" in ngay sau câu hỏi). */
export interface AiRemoveTextOp {
  op: 'removeText';
  block: number;
  match: string;
  occurrence?: number;
}

/** Xoá nguyên các block `from..to` (vd. bảng Answer key cuối đề đã dùng xong). */
export interface AiRemoveBlocksOp {
  op: 'removeBlocks';
  from: number;
  to: number;
}

export type AiFormatOp =
  | AiIndicatorOp
  | AiChoicesOp
  | AiPairsOp
  | AiNumberedOp
  | AiBlankOp
  | AiRemoveTextOp
  | AiRemoveBlocksOp
  | AiSplitOp;

/** Thao tác bị bỏ và lý do – gửi lại cho AI ở lần thử sau. */
export interface AiOpProblem {
  /** Vị trí thao tác trong danh sách AI trả về; `null` khi lỗi cả danh sách. */
  opIndex: number | null;
  message: string;
}

export interface ParsedAiOps {
  ops: { index: number; op: AiFormatOp }[];
  problems: AiOpProblem[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isIndex = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

/** `i` hoặc `i.k` (một chữ số thập phân) – xem `AiBlockRef`. */
const isRef = (value: unknown): value is AiBlockRef =>
  typeof value === 'number' &&
  value >= 0 &&
  Math.abs(value * 10 - Math.round(value * 10)) < 1e-6;

const isRefList = (value: unknown): value is AiBlockRef[] =>
  Array.isArray(value) && value.length > 0 && value.every(isRef);

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === 'string');

const optionalPositive = (value: unknown) =>
  value === undefined || value === null || isPositiveInteger(value);

/** Bỏ các trường `null` (schema JSON của AI hay trả `null` cho trường không dùng). */
const defined = <T extends object>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== null && v !== undefined),
  ) as T;

function parseOp(raw: unknown): AiFormatOp | string {
  if (!isRecord(raw)) return 'Thao tác không phải object.';
  switch (raw.op) {
    case 'indicator': {
      if (!isRef(raw.before)) return 'Thiếu `before` hợp lệ.';
      if (!INDICATOR_KINDS.includes(raw.kind as IndicatorKind)) {
        return `Kind không hợp lệ: ${String(raw.kind)}.`;
      }
      if (raw.qtype !== undefined && raw.qtype !== null) {
        if (raw.kind !== 'question') return 'Chỉ indicator question có qtype.';
        if (!isQuestionType(raw.qtype)) {
          return `Qtype không hợp lệ: ${String(raw.qtype)}.`;
        }
      }
      if (
        !optionalPositive(raw.seconds) ||
        !optionalPositive(raw.maxChars) ||
        !optionalPositive(raw.maxPicks)
      ) {
        return 'seconds / maxChars / maxPicks phải là số nguyên dương.';
      }
      if (
        raw.options !== undefined &&
        raw.options !== null &&
        !isStringList(raw.options)
      ) {
        return 'options phải là danh sách chuỗi.';
      }
      return defined<AiIndicatorOp>({
        op: 'indicator',
        before: raw.before,
        kind: raw.kind as IndicatorKind,
        qtype: raw.qtype as QuestionType | undefined,
        seconds: raw.seconds as number | undefined,
        maxChars: raw.maxChars as number | undefined,
        maxPicks: raw.maxPicks as number | undefined,
        options: raw.options as string[] | undefined,
      });
    }
    case 'choices': {
      if (!isRefList(raw.blocks)) return 'Thiếu `blocks`.';
      // Không có đáp án: AI hay trả `null` thay cho danh sách rỗng.
      const correct = raw.correct ?? [];
      if (!Array.isArray(correct) || !correct.every(isRef)) {
        return '`correct` phải là danh sách chỉ số block.';
      }
      const blocks = raw.blocks;
      if (!correct.every((i) => blocks.includes(i))) {
        return '`correct` có block không nằm trong `blocks`.';
      }
      return { op: 'choices', blocks, correct };
    }
    case 'pairs': {
      if (!isRefList(raw.blocks)) return 'Thiếu `blocks`.';
      // Đề không có đáp án: AI hay bỏ trống cả danh sách – coi như chưa có đáp án.
      const answers =
        raw.answers === undefined ||
        raw.answers === null ||
        (Array.isArray(raw.answers) && raw.answers.length === 0)
          ? raw.blocks.map(() => '')
          : raw.answers;
      if (!isStringList(answers)) return '`answers` phải là danh sách chuỗi.';
      if (answers.length !== raw.blocks.length) {
        return '`answers` phải có cùng số phần tử với `blocks`.';
      }
      return { op: 'pairs', blocks: raw.blocks, answers };
    }
    case 'numbered': {
      if (!isRefList(raw.blocks)) return 'Thiếu `blocks`.';
      const nums = raw.nums;
      if (
        !Array.isArray(nums) ||
        nums.length !== raw.blocks.length ||
        !nums.every((n) => n === null || Number.isFinite(n))
      ) {
        return '`nums` phải là danh sách số (hoặc null) cùng số phần tử với `blocks`.';
      }
      return { op: 'numbered', blocks: raw.blocks, nums };
    }
    case 'blank':
    case 'removeText': {
      if (!isRef(raw.block)) return 'Thiếu `block` hợp lệ.';
      if (typeof raw.match !== 'string' || raw.match === '') {
        return 'Thiếu `match`.';
      }
      if (raw.match.trim() === '') {
        return '`match` chỉ có khoảng trắng – không có ô trống/chữ thật để sửa.';
      }
      if (!optionalPositive(raw.occurrence)) {
        return '`occurrence` phải là số nguyên dương.';
      }
      const occurrence = (raw.occurrence as number | null | undefined) ?? 1;
      if (raw.op === 'removeText') {
        return {
          op: 'removeText',
          block: raw.block,
          match: raw.match,
          occurrence,
        };
      }
      // Không có đáp án: AI hay bỏ trường – coi như blank rỗng (giả định 4).
      const answer = raw.answer ?? '';
      if (typeof answer !== 'string') return '`answer` phải là chuỗi.';
      return {
        op: 'blank',
        block: raw.block,
        match: raw.match,
        occurrence,
        answer: answer.trim(),
      };
    }
    case 'removeBlocks': {
      if (!isRef(raw.from) || !isRef(raw.to) || raw.to < raw.from) {
        return '`from`/`to` không hợp lệ.';
      }
      return { op: 'removeBlocks', from: raw.from, to: raw.to };
    }
    case 'split': {
      if (!isIndex(raw.block)) {
        return '`block` của split phải là chỉ số block gốc (số nguyên).';
      }
      if (
        !isStringList(raw.at) ||
        !raw.at.length ||
        raw.at.some((a) => !a.trim())
      ) {
        return '`at` phải là danh sách đoạn chữ (không rỗng).';
      }
      if (raw.at.length >= AI_SPLIT_MAX_PIECES) {
        return `Một block tách được tối đa ${AI_SPLIT_MAX_PIECES} phần.`;
      }
      return { op: 'split', block: raw.block, at: raw.at };
    }
    default:
      return `Loại thao tác không hỗ trợ: ${String(raw.op)}.`;
  }
}

/**
 * Kiểm dữ liệu AI trả về (`{ ops: [...] }` hoặc mảng thao tác). Thao tác sai
 * dạng bị bỏ kèm lý do; chỉ số block chưa kiểm ở đây (xem `applyAiOps`).
 */
export function parseAiOps(raw: unknown): ParsedAiOps {
  const list = Array.isArray(raw) ? raw : isRecord(raw) ? raw.ops : undefined;
  if (!Array.isArray(list)) {
    return {
      ops: [],
      problems: [{ opIndex: null, message: 'Không có danh sách `ops`.' }],
    };
  }
  const result: ParsedAiOps = { ops: [], problems: [] };
  list.forEach((item, index) => {
    const parsed = parseOp(item);
    if (typeof parsed === 'string') {
      result.problems.push({ opIndex: index, message: parsed });
    } else {
      result.ops.push({ index, op: parsed });
    }
  });
  return result;
}
