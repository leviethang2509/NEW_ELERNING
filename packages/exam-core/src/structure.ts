import {
  ExamPartKind,
  MANUAL_SCORE_MAX,
  QuestionGrading,
  type QuestionType,
} from '@lang/shared';
import { acceptedAnswers } from './answer';
import { blanksIn } from './blank';
import type { TIndicatorElement } from './indicator';
import { isOrderingItem, isTodo, type TListItem } from './list';
import type { ExamElement } from './node';
import { isPair, pairAnswer, pairChoices } from './pair';
import {
  buildPlan,
  range,
  segmentQtype,
  type PreviewPlan,
  type Segment,
} from './plan';

// Tách cấu trúc một section để lưu `exam_parts` / `exam_questions`: mỗi số câu
// là một dòng kèm đáp án. Đánh số theo `buildPlan` nên khớp số hiển thị trong
// simulator, bắt đầu từ 1 ở mỗi section.

/** Điểm tối đa của câu chấm tự động; câu chấm tay dùng `MANUAL_SCORE_MAX`. */
export const AUTO_SCORE_MAX = 1;

export interface ChoiceAnswerKey {
  /** Chỉ số (trong các dòng checkbox của câu hỏi) của lựa chọn đúng. */
  indexes: number[];
}

export interface PickAnswerKey {
  indexes: number[];
  /** Vị trí của dòng trong n câu của câu hỏi, từ 0. Số câu đầu = `number - pickIndex`. */
  pickIndex: number;
}

export interface PairAnswerKey {
  answer: string;
}

export interface BlankAnswerKey {
  /** Các đáp án chấp nhận, đã chuẩn hoá bằng `normalizeAnswer`. */
  accepted: string[];
}

export interface OrderingAnswerKey {
  /** Chỉ số gốc (`key`) của các dòng theo thứ tự đúng. */
  order: number[];
}

export interface PolytomousAnswerKey {
  /** Trọng số theo chỉ số gốc; `null` khi dòng chưa nhập số. */
  weights: (number | null)[];
}

export interface AnswerKeyMap {
  'mc-single': ChoiceAnswerKey;
  'mc-multi': ChoiceAnswerKey;
  'pick-n': PickAnswerKey;
  matching: PairAnswerKey;
  tfng: PairAnswerKey;
  ynng: PairAnswerKey;
  'fill-blank': BlankAnswerKey;
  ordering: OrderingAnswerKey;
  polytomous: PolytomousAnswerKey;
  speaking: null;
  writing: null;
}

export type AnswerKey = AnswerKeyMap[QuestionType];

/** Đủ để chấm: dựng lại được từ một dòng `exam_questions`. */
export type GradableQuestion = {
  [Q in QuestionType]: {
    number: number;
    /** Id của indicator câu hỏi. */
    nodeId: string;
    qtype: Q;
    answerKey: AnswerKeyMap[Q];
  };
}[QuestionType];

export interface QuestionParams {
  seconds?: number;
  maxChars?: number;
  maxPicks?: number;
}

export type ExtractedQuestion = GradableQuestion & {
  /** Vị trí blank / cặp / lượt chọn trong indicator, từ 0. */
  subIndex: number;
  /** Part hoặc subpart gần nhất chứa câu hỏi; `null` khi đứng trước part đầu tiên. */
  partNodeId: string | null;
  grading: QuestionGrading;
  /** Lựa chọn của câu cặp ghép (matching / TFNG / YNNG). */
  options: string[] | null;
  params: QuestionParams;
  maxScore: number;
};

export interface ExtractedPart {
  nodeId: string;
  kind: ExamPartKind;
  parentNodeId: string | null;
  /** Thứ tự trong section, từ 0. */
  sortOrder: number;
  firstNumber: number | null;
  lastNumber: number | null;
}

export interface SectionStructure {
  parts: ExtractedPart[];
  questions: ExtractedQuestion[];
}

const checkedIndexes = (items: readonly TListItem[]) =>
  items.flatMap((n, i) => (n.checked ? [i] : []));

const finiteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

function questionsOf(
  seg: Segment,
  partNodeId: string | null,
): ExtractedQuestion[] {
  const qtype = segmentQtype(seg);
  const indicator = seg.indicator;
  if (!qtype || !indicator || seg.count === 0) return [];
  const { blocks } = seg;

  const common = (subIndex: number) => ({
    number: seg.start + subIndex,
    nodeId: indicator.id,
    subIndex,
    partNodeId,
    grading: QuestionGrading.AUTO as QuestionGrading,
    options: null,
    params: {},
    maxScore: AUTO_SCORE_MAX,
  });
  const manual = (params: QuestionParams) => ({
    ...common(0),
    grading: QuestionGrading.MANUAL,
    params,
    maxScore: MANUAL_SCORE_MAX,
  });

  switch (qtype) {
    case 'mc-single':
    case 'mc-multi':
      return [
        {
          ...common(0),
          qtype,
          answerKey: { indexes: checkedIndexes(blocks.filter(isTodo)) },
        },
      ];

    case 'pick-n': {
      const indexes = checkedIndexes(blocks.filter(isTodo));
      return range(0, seg.count).map((pickIndex) => ({
        ...common(pickIndex),
        qtype,
        answerKey: { indexes, pickIndex },
        params: { maxPicks: seg.count },
      }));
    }

    case 'matching':
    case 'tfng':
    case 'ynng': {
      const pairs = blocks.filter(isPair);
      const options = pairChoices(indicator, pairs);
      return pairs.map((pair, k) => ({
        ...common(k),
        qtype,
        answerKey: { answer: pairAnswer(pair) },
        options,
      }));
    }

    case 'fill-blank':
      return blanksIn(blocks).map((blank, k) => ({
        ...common(k),
        qtype,
        answerKey: { accepted: acceptedAnswers(blank) },
      }));

    case 'ordering': {
      // Dòng chưa nhập số xếp cuối, giữ thứ tự soạn.
      const nums = blocks
        .filter(isOrderingItem)
        .map((n) => finiteNumber(n.num) ?? Infinity);
      const order = range(0, nums.length).sort((a, b) =>
        nums[a] === nums[b] ? a - b : nums[a] < nums[b] ? -1 : 1,
      );
      return [{ ...common(0), qtype, answerKey: { order } }];
    }

    case 'polytomous': {
      const weights = blocks
        .filter(isOrderingItem)
        .map((n) => finiteNumber(n.num));
      return [{ ...common(0), qtype, answerKey: { weights } }];
    }

    case 'speaking': {
      const seconds = finiteNumber(indicator.seconds);
      return [
        {
          ...manual(seconds === null ? {} : { seconds }),
          qtype,
          answerKey: null,
        },
      ];
    }

    case 'writing': {
      const maxChars = finiteNumber(indicator.maxChars);
      return [
        {
          ...manual(maxChars === null ? {} : { maxChars }),
          qtype,
          answerKey: null,
        },
      ];
    }
  }
}

export function structureFromPlan(plan: PreviewPlan): SectionStructure {
  const parts: ExtractedPart[] = [];
  const questions: ExtractedQuestion[] = [];

  const addPart = (
    indicator: TIndicatorElement,
    kind: ExamPartKind,
    parent: ExtractedPart | null,
  ): ExtractedPart => {
    const part: ExtractedPart = {
      nodeId: indicator.id,
      kind,
      parentNodeId: parent?.nodeId ?? null,
      sortOrder: parts.length,
      firstNumber: null,
      lastNumber: null,
    };
    parts.push(part);
    return part;
  };
  // Số câu tăng dần nên câu đầu tiên gặp là `firstNumber`.
  const cover = (part: ExtractedPart | null, no: number) => {
    if (!part) return;
    part.firstNumber ??= no;
    part.lastNumber = no;
  };

  for (const previewPart of plan.parts) {
    const part = previewPart.indicator
      ? addPart(previewPart.indicator, ExamPartKind.PART, null)
      : null;
    let subpart: ExtractedPart | null = null;

    for (const seg of previewPart.items) {
      if (seg.indicator?.kind === 'subpart') {
        subpart = addPart(seg.indicator, ExamPartKind.SUBPART, part);
        continue;
      }
      const owner = subpart ?? part;
      for (const question of questionsOf(seg, owner?.nodeId ?? null)) {
        questions.push(question);
        cover(part, question.number);
        cover(subpart, question.number);
      }
    }
  }

  return { parts, questions };
}

/** Cấu trúc + đáp án của một section (`raw_data`). */
export function extractStructure(
  value: readonly ExamElement[],
): SectionStructure {
  return structureFromPlan(buildPlan(value));
}
