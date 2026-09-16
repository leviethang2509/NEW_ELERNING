import { blanksIn } from '../blank';
import { emptyResponses, type Responses } from '../grading';
import { isOrderingItem, isTodo } from '../list';
import { plainText } from '../node';
import { isPair, pairChoices } from '../pair';
import { range, segmentQtype, type PreviewPlan } from '../plan';
import { shuffled } from '../random';

/**
 * Câu trả lời giống simulator của LC gửi lên (không trùng, không chọn quá số
 * cho phép): `correct` trả lời đúng hết, `random` trả lời ngẫu nhiên.
 */
export function simulateResponses(
  plan: PreviewPlan,
  mode: 'correct' | 'random',
  random: () => number,
): Responses {
  const r = emptyResponses();
  const correct = mode === 'correct';
  const chance = (p: number) => random() < p;
  const below = (n: number) => Math.floor(random() * n);
  const oneOf = <T>(items: readonly T[]): T => items[below(items.length)];

  for (const part of plan.parts) {
    for (const seg of part.items) {
      const qtype = segmentQtype(seg);
      if (!qtype || seg.count === 0) continue;
      const { start, blocks } = seg;
      const todos = blocks.filter(isTodo);
      const checked = range(0, todos.length).filter((i) => todos[i].checked);
      const rows = blocks.filter(isOrderingItem);

      switch (qtype) {
        case 'mc-single':
          r.picks[start] = correct
            ? checked
            : chance(0.2)
              ? []
              : [below(todos.length)];
          break;
        case 'mc-multi':
          r.picks[start] = correct
            ? checked
            : range(0, todos.length).filter(() => chance(0.5));
          break;
        case 'pick-n':
          r.picks[start] = correct
            ? checked.slice(0, seg.count)
            : shuffled(range(0, todos.length), random)
                .slice(0, below(seg.count + 1))
                .sort((a, b) => a - b);
          break;
        case 'polytomous': {
          const weights = rows.map((n) => n.num ?? -Infinity);
          r.picks[start] = correct
            ? [weights.indexOf(Math.max(...weights))]
            : chance(0.2)
              ? []
              : [below(rows.length)];
          break;
        }
        case 'ordering':
          r.order[start] = correct
            ? range(0, rows.length).sort(
                (a, b) => (rows[a].num ?? 0) - (rows[b].num ?? 0),
              )
            : shuffled(range(0, rows.length), random);
          break;
        case 'matching':
        case 'tfng':
        case 'ynng': {
          const pairs = blocks.filter(isPair);
          const choices = pairChoices(seg.indicator, pairs);
          pairs.forEach((pair, k) => {
            const answer = pair.answer ?? '';
            r.value[start + k] = correct
              ? answer
              : oneOf([...choices, '', ` ${answer} `, answer.toUpperCase()]);
          });
          break;
        }
        case 'fill-blank':
          blanksIn(blocks).forEach((blank, k) => {
            const alternatives = plainText(blank).split('|');
            const answer = alternatives[0];
            r.value[start + k] = correct
              ? answer
              : oneOf([
                  ...alternatives,
                  answer.toUpperCase(),
                  `  ${answer.replace(' ', '   ')} `,
                  'sai',
                  '',
                ]);
          });
          break;
        case 'writing':
          r.value[start] = 'Bài viết';
          break;
        case 'speaking':
          break;
      }
    }
  }
  return r;
}
