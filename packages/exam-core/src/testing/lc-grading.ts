import { acceptedAnswers } from '../answer';
import { blanksIn } from '../blank';
import type { GradeResult, Responses, Verdict } from '../grading';
import { isOrderingItem, isTodo, type TListItem } from '../list';
import { isPair } from '../pair';
import { range, segmentQtype, type PreviewPlan } from '../plan';

// Bản chép `gradeExam` của lightc-general (labs/exam-editor/_lib/grading.ts)
// trước khi chuyển sang `gradeResponses`, chỉ để test đối chiếu. Giữ nguyên logic.

const checkedIndexes = (items: TListItem[]) =>
  items.flatMap((n, i) => (n.checked ? [i] : []));

export function lcGradeExam(plan: PreviewPlan, r: Responses): GradeResult {
  const verdicts: Record<number, Verdict> = {};
  const set = (no: number, ok: boolean) => {
    verdicts[no] = ok ? 'correct' : 'wrong';
  };

  for (const part of plan.parts) {
    for (const seg of part.items) {
      const qtype = segmentQtype(seg);
      if (!qtype || seg.count === 0) continue;
      const start = seg.start;
      const blocks = seg.blocks;

      switch (qtype) {
        case 'mc-single':
        case 'mc-multi': {
          const key = checkedIndexes(blocks.filter(isTodo));
          const got = r.picks[start] ?? [];
          set(
            start,
            got.length === key.length && got.every((i) => key.includes(i)),
          );
          break;
        }
        case 'pick-n': {
          const key = new Set(checkedIndexes(blocks.filter(isTodo)));
          const hits = (r.picks[start] ?? []).filter((i) => key.has(i)).length;
          range(start, seg.count).forEach((no, k) => set(no, k < hits));
          break;
        }
        case 'polytomous': {
          const weights = blocks
            .filter(isOrderingItem)
            .map((n) => (typeof n.num === 'number' ? n.num : -Infinity));
          const best = Math.max(...weights);
          const got = r.picks[start]?.[0];
          set(
            start,
            got !== undefined && Number.isFinite(best) && weights[got] === best,
          );
          break;
        }
        case 'ordering': {
          const expected = blocks
            .filter(isOrderingItem)
            .map((n, i) => ({
              i,
              num: typeof n.num === 'number' ? n.num : Infinity,
            }))
            .sort((a, b) => a.num - b.num)
            .map((x) => x.i);
          const got = r.order[start] ?? [];
          set(
            start,
            got.length === expected.length &&
              got.every((v, k) => v === expected[k]),
          );
          break;
        }
        case 'matching':
        case 'tfng':
        case 'ynng': {
          blocks.filter(isPair).forEach((pair, k) => {
            const got = r.value[start + k]?.trim();
            set(start + k, !!got && got === (pair.answer ?? '').trim());
          });
          break;
        }
        case 'fill-blank': {
          blanksIn(blocks).forEach((blank, k) => {
            const got = (r.value[start + k] ?? '')
              .normalize('NFC')
              .trim()
              .replace(/\s+/g, ' ')
              .toLocaleLowerCase();
            set(start + k, got !== '' && acceptedAnswers(blank).includes(got));
          });
          break;
        }
        case 'speaking':
        case 'writing':
          verdicts[start] = 'manual';
          break;
      }
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
