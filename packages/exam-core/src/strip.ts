import { bestWeightIndex } from './answer';
import { isBlank } from './blank';
import {
  isIndicator,
  questionTypeMeta,
  type TIndicatorElement,
} from './indicator';
import { isOrderingItem } from './list';
import { isText, type ExamElement, type ExamNode } from './node';
import { isPair, pairChoices, pairOptions } from './pair';
import { buildPlan, segmentQtype } from './plan';
import { seededRandom, shuffled } from './random';
import { questionScopes } from './scope';
import { structureFromPlan, type GradableQuestion } from './structure';

// content_public: nội dung section gửi cho người làm bài, đã bỏ mọi đáp án.
//
// - bỏ `checked` (MC), `answer` (cặp ghép), `num` (ordering / polytomous);
// - blank giữ nguyên ô (để đếm số câu) nhưng làm rỗng chữ;
// - dòng ordering / polytomous có `key` = chỉ số gốc trong câu hỏi và bị xáo:
//   thứ tự soạn thường chính là đáp án. Câu trả lời gửi lên dùng `key`;
// - giải thích chỉ còn indicator rỗng (nội dung lưu riêng, `extractExplanations`).
//
// Bỏ đáp án làm mất thông tin mà cách đánh số cần, nên ghi bù lên indicator:
// `maxPicks` của pick-n (đề cũ đếm số ô tick) và `options` của matching đời cũ
// (gom từ đáp án các cặp).

const HIDDEN_PROPS = ['checked', 'answer', 'num', 'key'];

function hideAnswers(node: ExamElement): ExamElement;
function hideAnswers(node: ExamNode): ExamNode;
function hideAnswers(node: ExamNode): ExamNode {
  const copy: Record<string, unknown> = { ...node };
  for (const prop of HIDDEN_PROPS) delete copy[prop];
  if (isText(node)) return copy as ExamNode;
  copy.children = isBlank(node)
    ? [{ text: '' }]
    : node.children.map((child) => hideAnswers(child));
  return copy as ExamElement;
}

const hasOrderingInput = (indicator: TIndicatorElement | null) =>
  indicator?.kind === 'question' &&
  questionTypeMeta(indicator.qtype)?.input === 'ordering';

/**
 * Tạo content_public từ `raw_data`. `seed` quyết định thứ tự xáo (server chọn
 * ngẫu nhiên lúc Save); mỗi lượt làm xáo lại bằng `shuffleOrdering`.
 */
export function stripAnswers(
  value: readonly ExamElement[],
  seed: number,
): ExamElement[] {
  const plan = buildPlan(value);

  const extras = new Map<TIndicatorElement, Partial<TIndicatorElement>>();
  for (const part of plan.parts) {
    for (const seg of part.items) {
      const { indicator } = seg;
      if (!indicator) continue;
      const qtype = segmentQtype(seg);
      if (qtype === 'pick-n') extras.set(indicator, { maxPicks: seg.count });
      if (qtype === 'matching' && !pairOptions(indicator)) {
        extras.set(indicator, {
          options: pairChoices(indicator, seg.blocks.filter(isPair)),
        });
      }
    }
  }

  const content: ExamElement[] = [];
  let current: TIndicatorElement | null = null;
  let nextKey = 0;
  for (const node of value) {
    const copy = hideAnswers(node);
    if (isIndicator(node)) {
      current = node;
      nextKey = 0;
      content.push({ ...copy, ...extras.get(node) });
      continue;
    }
    if (current?.kind === 'explanation') continue;
    if (hasOrderingInput(current) && isOrderingItem(node)) {
      copy.key = nextKey;
      nextKey += 1;
    }
    content.push(copy);
  }

  return shuffleOrdering(content, seed, structureFromPlan(plan).questions);
}

const keyOf = (node: unknown): number => {
  const key = (node as { key?: unknown } | null | undefined)?.key;
  return typeof key === 'number' ? key : Infinity;
};

/**
 * Dãy vị trí cần xoay thêm nếu thứ tự vừa xáo lộ đáp án: ordering trùng thứ tự
 * đúng; polytomous có dòng điểm cao nhất nằm đúng vị trí soạn gốc.
 */
function revealingRun(
  answer: GradableQuestion,
  keys: readonly number[],
  runs: readonly number[][],
): readonly number[] | undefined {
  if (answer.qtype === 'ordering') {
    const { order } = answer.answerKey;
    const same =
      keys.length === order.length && keys.every((k, p) => k === order[p]);
    if (!same) return undefined;
    return runs.reduce((a, b) => (b.length > a.length ? b : a));
  }
  if (answer.qtype === 'polytomous') {
    const best = bestWeightIndex(answer.answerKey.weights);
    if (best < 0 || keys[best] !== best) return undefined;
    return runs.find((run) => run.includes(best));
  }
  return undefined;
}

/**
 * Xáo các dòng của câu ordering / polytomous theo `seed`. `content` là
 * content_public (dòng đã có `key`); `questions` cho biết đáp án để thứ tự hiển
 * thị không trùng đáp án. Kết quả chỉ phụ thuộc `seed`, không phụ thuộc thứ tự
 * đang có trong `content`.
 */
export function shuffleOrdering(
  content: readonly ExamElement[],
  seed: number,
  questions: readonly GradableQuestion[],
): ExamElement[] {
  const answers = new Map<string, GradableQuestion>();
  for (const q of questions) {
    if (q.qtype === 'ordering' || q.qtype === 'polytomous') {
      answers.set(q.nodeId, q);
    }
  }

  const out = [...content];
  for (const { indicator, from, to } of questionScopes(content)) {
    const answer = answers.get(indicator.id);
    if (!answer) continue;

    // Vị trí các dòng, gom thành từng dãy liền nhau như simulator hiển thị;
    // chỉ xáo trong từng dãy.
    const slots: number[] = [];
    const runs: number[][] = [];
    for (let i = from; i < to; i += 1) {
      if (!isOrderingItem(content[i])) continue;
      if (slots.at(-1) !== i - 1) runs.push([]);
      runs[runs.length - 1].push(slots.length);
      slots.push(i);
    }
    if (slots.length < 2) continue;

    const items = slots
      .map((i) => content[i])
      .sort((a, b) => {
        const ka = keyOf(a);
        const kb = keyOf(b);
        return ka === kb ? 0 : ka < kb ? -1 : 1;
      });
    // order[vị trí] = chỉ số trong `items`.
    const order = slots.map((_, p) => p);
    const random = seededRandom(`${seed}:${indicator.id}`);
    const place = (run: readonly number[], values: readonly number[]) => {
      run.forEach((p, k) => {
        order[p] = values[k];
      });
    };
    for (const run of runs) {
      place(
        run,
        shuffled(
          run.map((p) => order[p]),
          random,
        ),
      );
    }

    const exposed = revealingRun(
      answer,
      order.map((i) => keyOf(items[i])),
      runs,
    );
    if (exposed && exposed.length > 1) {
      // Xoay vòng một vị trí: mọi dòng trong dãy đều đổi chỗ.
      const values = exposed.map((p) => order[p]);
      place(exposed, [...values.slice(1), values[0]]);
    }

    slots.forEach((slot, p) => {
      out[slot] = items[order[p]];
    });
  }
  return out;
}
