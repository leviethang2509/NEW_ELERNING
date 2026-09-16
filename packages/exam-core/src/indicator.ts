import type { QuestionType } from '@lang/shared';
import { createNodeId } from './id';
import type { ExamElement } from './node';

// Indicator: block void đánh dấu ranh giới các phần trong đề thi. Không gõ chữ
// vào được — mọi thao tác đi qua menu chèn và popup sửa tham số (plugin Plate
// nằm ở lang-app).
//
// Hai chiều tách bạch: `kind` là cấu trúc đề (part / subpart / question), còn
// dạng câu hỏi nằm ở `qtype`. Nhờ vậy thêm một dạng câu hỏi mới chỉ là thêm một
// giá trị `qtype`, không phình danh sách `kind`.

export const INDICATOR_KEY = 'indicator';

export type IndicatorKind = 'part' | 'subpart' | 'question';

export const INDICATOR_KINDS: readonly IndicatorKind[] = [
  'part',
  'subpart',
  'question',
];

/** Kiểu nội dung mà một dạng câu hỏi cần soạn. */
export type QuestionInput = 'choice' | 'pair' | 'blank' | 'ordering' | 'free';

export interface TIndicatorElement extends ExamElement {
  type: typeof INDICATOR_KEY;
  /** Id ổn định — dùng để minimap cuộn tới, và làm `node_id` khi lưu. */
  id: string;
  kind: IndicatorKind;
  /** Chỉ có ở `kind = 'question'`; để trống nghĩa là chưa chọn dạng. */
  qtype?: QuestionType;
  /** Chỉ có ở qtype `speaking`. */
  seconds?: number;
  /** Chỉ có ở qtype `writing`. */
  maxChars?: number;
  /** Chỉ có ở qtype `pick-n`: số đáp án cần chọn = số câu tính điểm. */
  maxPicks?: number;
  /** Chỉ có ở qtype `matching`: tập option dùng chung cho mọi cặp, gồm cả đáp án nhiễu. */
  options?: string[];
}

export interface IndicatorMeta {
  kind: IndicatorKind;
  label: string;
  hint: string;
  color: string;
  soft: string;
}

export interface QuestionTypeMeta {
  qtype: QuestionType;
  label: string;
  hint: string;
  color: string;
  soft: string;
  input: QuestionInput;
  /** Tham số đi kèm, nếu có. */
  param?: 'seconds' | 'maxChars' | 'maxPicks' | 'options';
}

const soften = (hex: string, alpha = 0.12) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

// Nhãn giữ nguyên tiếng Anh cho khớp với `kind` trong dữ liệu; phần mô tả
// tiếng Việt nằm ở `hint` (tooltip + menu chèn).
const STRUCTURE_BASE: Omit<IndicatorMeta, 'soft'>[] = [
  {
    kind: 'part',
    label: 'Part',
    hint: 'Phần lớn của đề',
    color: '#4c6ef5',
  },
  {
    kind: 'subpart',
    label: 'Subpart',
    hint: 'Phần con trong một Part',
    color: '#7950f2',
  },
  {
    kind: 'question',
    label: 'Question',
    hint: 'Một câu hỏi — chọn dạng khi chèn',
    color: '#0ca678',
  },
];

export const INDICATORS: IndicatorMeta[] = STRUCTURE_BASE.map((m) => ({
  ...m,
  soft: soften(m.color),
}));

const QUESTION_BASE: Omit<QuestionTypeMeta, 'soft'>[] = [
  {
    qtype: 'mc-single',
    label: 'Multiple choice · 1 đáp án',
    hint: 'checkbox list, đúng một ô được tick',
    color: '#0ca678',
    input: 'choice',
  },
  {
    qtype: 'mc-multi',
    label: 'Multiple choice · nhiều đáp án',
    hint: 'checkbox list, đúng hết mới tính điểm',
    color: '#087f5b',
    input: 'choice',
  },
  {
    qtype: 'pick-n',
    label: 'Pick n trong m',
    hint: 'như trên nhưng mỗi đáp án đúng tính 1 câu',
    color: '#2f9e44',
    input: 'choice',
    param: 'maxPicks',
  },
  {
    qtype: 'matching',
    label: 'Matching',
    hint: 'cặp: nội dung — chọn trong danh sách option',
    color: '#e8590c',
    input: 'pair',
    param: 'options',
  },
  {
    qtype: 'tfng',
    label: 'True / False / Not Given',
    hint: 'cặp: nội dung — chọn 1 trong 3',
    color: '#d9480f',
    input: 'pair',
  },
  {
    qtype: 'ynng',
    label: 'Yes / No / Not Given',
    hint: 'cặp: nội dung — chọn 1 trong 3',
    color: '#f76707',
    input: 'pair',
  },
  {
    qtype: 'fill-blank',
    label: 'Điền vào chỗ trống',
    hint: 'bôi đen từ/cụm từ rồi bấm Blank',
    color: '#1971c2',
    input: 'blank',
  },
  {
    qtype: 'ordering',
    label: 'Sắp xếp thứ tự',
    hint: 'danh sách đánh số 1..n, không trùng',
    color: '#c2255c',
    input: 'ordering',
  },
  {
    qtype: 'polytomous',
    label: 'Polytomous · trọng số',
    hint: 'danh sách gắn điểm, cho phép trùng',
    color: '#a61e4d',
    input: 'ordering',
  },
  {
    qtype: 'speaking',
    label: 'Speaking',
    hint: 'phần nói — kèm số giây',
    color: '#1098ad',
    input: 'free',
    param: 'seconds',
  },
  {
    qtype: 'writing',
    label: 'Writing',
    hint: 'phần viết — kèm số ký tự',
    color: '#f08c00',
    input: 'free',
    param: 'maxChars',
  },
];

export const QUESTION_TYPES: QuestionTypeMeta[] = QUESTION_BASE.map((m) => ({
  ...m,
  soft: soften(m.color),
}));

const KIND_META = new Map(INDICATORS.map((m) => [m.kind, m]));
const QTYPE_META = new Map(QUESTION_TYPES.map((m) => [m.qtype, m]));

export function isQuestionType(value: unknown): value is QuestionType {
  return QTYPE_META.has(value as QuestionType);
}

export function indicatorMeta(kind: IndicatorKind): IndicatorMeta {
  return KIND_META.get(kind) ?? INDICATORS[0];
}

export function questionTypeMeta(
  qtype: QuestionType | undefined,
): QuestionTypeMeta | undefined {
  return qtype ? QTYPE_META.get(qtype) : undefined;
}

/** Dạng nội dung cần soạn cho một indicator; `null` nếu không phải câu hỏi. */
export function questionInput(el: TIndicatorElement): QuestionInput | null {
  if (el.kind !== 'question') return null;
  return questionTypeMeta(el.qtype)?.input ?? null;
}

/** Màu badge: theo dạng câu hỏi nếu có, không thì theo `kind`. */
export function indicatorColor(el: TIndicatorElement): {
  color: string;
  soft: string;
} {
  const qt = questionTypeMeta(el.qtype);
  if (qt) return { color: qt.color, soft: qt.soft };
  const meta = indicatorMeta(el.kind);
  return { color: meta.color, soft: meta.soft };
}

/** Nhãn hiển thị trên badge và trong minimap (chưa kèm số thứ tự). */
export function indicatorLabel(el: TIndicatorElement): string {
  const meta = indicatorMeta(el.kind);
  if (el.kind !== 'question') return meta.label;
  const qt = questionTypeMeta(el.qtype);
  return qt ? `${meta.label} · ${qt.label}` : `${meta.label} · chưa chọn dạng`;
}

/** Phần đuôi hiển thị sau nhãn: số giây / số ký tự. */
export function indicatorSuffix(el: TIndicatorElement): string {
  if (el.qtype === 'speaking' && typeof el.seconds === 'number') {
    return `${el.seconds} giây`;
  }
  if (el.qtype === 'writing' && typeof el.maxChars === 'number') {
    return `${el.maxChars} ký tự`;
  }
  if (el.qtype === 'pick-n' && typeof el.maxPicks === 'number') {
    return `chọn ${el.maxPicks}`;
  }
  if (el.qtype === 'matching' && el.options?.length) {
    return `${el.options.length} option`;
  }
  return '';
}

export function isIndicator(node: unknown): node is TIndicatorElement {
  return (
    (node as { type?: unknown } | null | undefined)?.type === INDICATOR_KEY
  );
}

export interface IndicatorProps {
  qtype?: QuestionType;
  seconds?: number;
  maxChars?: number;
  maxPicks?: number;
  options?: string[];
}

export function createIndicator(
  kind: IndicatorKind,
  extra?: IndicatorProps,
  id: string = createNodeId(),
): TIndicatorElement {
  return {
    type: INDICATOR_KEY,
    id,
    kind,
    ...(extra ?? {}),
    children: [{ text: '' }],
  };
}
