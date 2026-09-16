import { bestWeightIndex, normalizeAnswer } from './answer';
import type { PreviewPlan } from './plan';
import { structureFromPlan, type GradableQuestion } from './structure';

// Chấm bài. `gradeResponses` chấm theo danh sách câu đã tách (`extractStructure`
// hoặc dòng `exam_questions`); preview ở client (`gradeExam`) và server dùng
// chung hàm này nên cho cùng kết quả.
//
// Câu trả lời KHÔNG gắn vào id của node: blank là inline nên Plate không bảo
// đảm có id. Thay vào đó dùng số câu (blank, cặp, bài viết) và chỉ số của lựa
// chọn trong câu hỏi (MC, pick-n, polytomous, ordering). Với ordering /
// polytomous, chỉ số này là `key` của dòng trong content_public.
//
// Câu trả lời đến từ client nên đọc phòng thủ: lựa chọn trùng hoặc không phải
// số nguyên ≥ 0 bị bỏ; chọn nhiều hơn số được phép thì sai.

export interface Responses {
  /** Số câu → chữ gõ (blank, writing) hoặc option đã chọn (cặp ghép). */
  value: Record<number, string>;
  /** Số câu đầu của câu hỏi → chỉ số các lựa chọn đã tick. */
  picks: Record<number, number[]>;
  /** Số câu đầu của câu hỏi → chỉ số các dòng theo thứ tự người làm xếp. */
  order: Record<number, number[]>;
}

export const emptyResponses = (): Responses => ({
  value: {},
  picks: {},
  order: {},
});

export type Verdict = 'correct' | 'wrong' | 'manual';

export interface GradeResult {
  correct: number;
  /** Tổng số câu chấm tự động (không gồm speaking/writing). */
  total: number;
  /** Số câu không chấm tự động. */
  manual: number;
  verdicts: Record<number, Verdict>;
}

function entry(record: unknown, no: number): unknown {
  return typeof record === 'object' && record !== null
    ? (record as Record<number, unknown>)[no]
    : undefined;
}

function textEntry(record: unknown, no: number): string {
  const value = entry(record, no);
  return typeof value === 'string' ? value : '';
}

/** Chỉ số hợp lệ, bỏ trùng, tăng dần. */
function pickedIndexes(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const valid = raw.filter(
    (i): i is number => Number.isInteger(i) && (i as number) >= 0,
  );
  return [...new Set(valid)].sort((a, b) => a - b);
}

export function gradeResponses(
  questions: readonly GradableQuestion[],
  responses: Responses,
): GradeResult {
  const verdicts: Record<number, Verdict> = {};
  const set = (no: number, ok: boolean) => {
    verdicts[no] = ok ? 'correct' : 'wrong';
  };

  // Mỗi câu hỏi pick-n có n dòng = số lựa chọn được phép.
  const pickLimits = new Map<string, number>();
  for (const q of questions) {
    if (q.qtype === 'pick-n') {
      pickLimits.set(q.nodeId, (pickLimits.get(q.nodeId) ?? 0) + 1);
    }
  }

  for (const q of questions) {
    const no = q.number;
    switch (q.qtype) {
      case 'mc-single':
      case 'mc-multi': {
        const key = q.answerKey.indexes;
        const got = pickedIndexes(entry(responses.picks, no));
        set(
          no,
          key.length > 0 &&
            got.length === key.length &&
            got.every((i) => key.includes(i)),
        );
        break;
      }
      case 'pick-n': {
        const { indexes, pickIndex } = q.answerKey;
        // Mọi dòng của câu hỏi đọc chung câu trả lời ở số câu đầu tiên.
        const got = pickedIndexes(entry(responses.picks, no - pickIndex));
        const limit = pickLimits.get(q.nodeId) ?? 0;
        const hits =
          got.length > limit
            ? 0
            : got.filter((i) => indexes.includes(i)).length;
        set(no, pickIndex < hits);
        break;
      }
      case 'polytomous': {
        const { weights } = q.answerKey;
        const best = bestWeightIndex(weights);
        const got = pickedIndexes(entry(responses.picks, no));
        set(
          no,
          best >= 0 && got.length === 1 && weights[got[0]] === weights[best],
        );
        break;
      }
      case 'ordering': {
        const { order } = q.answerKey;
        const got = entry(responses.order, no);
        set(
          no,
          order.length > 0 &&
            Array.isArray(got) &&
            got.length === order.length &&
            got.every((v, k) => v === order[k]),
        );
        break;
      }
      case 'matching':
      case 'tfng':
      case 'ynng': {
        const got = textEntry(responses.value, no).trim();
        set(no, got !== '' && got === q.answerKey.answer);
        break;
      }
      case 'fill-blank': {
        const got = normalizeAnswer(textEntry(responses.value, no));
        set(no, got !== '' && q.answerKey.accepted.includes(got));
        break;
      }
      case 'speaking':
      case 'writing':
        verdicts[no] = 'manual';
        break;
    }
  }

  const all = Object.values(verdicts);
  const manual = all.filter((v) => v === 'manual').length;
  return {
    correct: all.filter((v) => v === 'correct').length,
    total: all.length - manual,
    manual,
    verdicts,
  };
}

/** Chấm ở client (preview trong dashboard): đáp án đọc thẳng từ nội dung. */
export function gradeExam(
  plan: PreviewPlan,
  responses: Responses,
): GradeResult {
  return gradeResponses(structureFromPlan(plan).questions, responses);
}
