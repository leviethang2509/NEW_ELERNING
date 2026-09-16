import { blanksIn, isBlank } from './blank';
import { emptyResponses, gradeResponses } from './grading';
import { isIndicator } from './indicator';
import { isOrderingItem } from './list';
import { childrenOf, plainText, type ExamElement } from './node';
import { buildPlan } from './plan';
import { questionScopes } from './scope';
import { shuffleOrdering, stripAnswers } from './strip';
import { extractStructure } from './structure';
import { orderingItem, p, question } from './testing/builders';
import { loadFixture } from './testing/fixtures';

/** Mọi chỗ còn lộ đáp án: `checked` / `answer` / `num`, hoặc blank còn chữ. */
function leaks(nodes: readonly unknown[]): string[] {
  const found: string[] = [];
  const walk = (list: readonly unknown[]) => {
    for (const node of list) {
      const record = node as Record<string, unknown>;
      for (const prop of ['checked', 'answer', 'num']) {
        if (prop in record) found.push(`${prop}: ${JSON.stringify(record)}`);
      }
      if (isBlank(node) && plainText(node) !== '') {
        found.push(`blank: ${plainText(node)}`);
      }
      walk(childrenOf(node));
    }
  };
  walk(nodes);
  return found;
}

function keysOf(content: readonly ExamElement[], indicatorId: string) {
  const scope = questionScopes(content).find(
    (s) => s.indicator.id === indicatorId,
  );
  if (!scope) throw new Error(`Không có câu ${indicatorId}`);
  return content
    .slice(scope.from, scope.to)
    .filter(isOrderingItem)
    .map((n) => n.key);
}

describe.each(['exam-editor-sample', 'exam-draft-2'] as const)(
  'stripAnswers đề %s',
  (name) => {
    const value = loadFixture(name);
    const content = stripAnswers(value, 7);

    it('không còn đáp án, giữ số blank', () => {
      expect(leaks(value).length).toBeGreaterThan(0);
      expect(leaks(content)).toEqual([]);
      expect(blanksIn(content)).toHaveLength(blanksIn(value).length);
    });

    it('đánh số câu và cấu trúc câu hỏi y như nội dung gốc', () => {
      const shape = (v: readonly ExamElement[]) => ({
        numbers: buildPlan(v).parts.map((x) => x.numbers),
        questions: extractStructure(v).questions.map((q) => [
          q.number,
          q.nodeId,
          q.qtype,
          q.subIndex,
          q.partNodeId,
          q.options,
        ]),
      });
      expect(shape(content)).toEqual(shape(value));
    });

    it('không sửa nội dung đầu vào', () => {
      const before = JSON.stringify(loadFixture(name));
      stripAnswers(value, 3);
      expect(JSON.stringify(value)).toBe(before);
    });
  },
);

describe('stripAnswers đề mẫu', () => {
  const value = loadFixture('exam-editor-sample');
  const { questions } = extractStructure(value);

  it('ghi bù maxPicks (pick-n đời cũ) và options (matching đời cũ) lên indicator', () => {
    const content = stripAnswers(value, 1);
    const indicator = (id: string) =>
      content.find((n) => isIndicator(n) && n.id === id);
    expect(indicator('sample-pick-n-1')).toMatchObject({ maxPicks: 2 });
    expect(indicator('sample-matching-1')).toMatchObject({
      options: [
        'Prefers working from home',
        'Suggests hiring more staff',
        'Thinks the deadline is too tight',
      ],
    });
  });

  it('dòng ordering/polytomous có key, không bao giờ hiện theo thứ tự lộ đáp án', () => {
    const arrangements = new Set<string>();
    for (let seed = 0; seed < 300; seed += 1) {
      const content = stripAnswers(value, seed);
      const ordering = keysOf(content, 'sample-ordering-1');
      const polytomous = keysOf(content, 'sample-polytomous-scoring-1');

      expect([...ordering].sort()).toEqual([0, 1, 2, 3]);
      expect(ordering).not.toEqual([0, 1, 2, 3]);
      // Dòng điểm cao nhất (key 0, trọng số 2) không ở vị trí soạn gốc.
      expect(polytomous[0]).not.toBe(0);
      arrangements.add(ordering.join(','));
    }
    expect(arrangements.size).toBeGreaterThan(15);
  });

  it('cùng seed cùng thứ tự; xáo lại theo lượt làm không phụ thuộc thứ tự lưu', () => {
    expect(stripAnswers(value, 5)).toEqual(stripAnswers(value, 5));
    expect(shuffleOrdering(stripAnswers(value, 1), 2, questions)).toEqual(
      stripAnswers(value, 2),
    );
  });

  it('chấm bằng key: xếp đúng thì đúng, giữ nguyên thứ tự hiện ra thì sai', () => {
    const content = stripAnswers(value, 11);
    const shown = keysOf(content, 'sample-ordering-1') as number[];
    const grade = (order: number[]) =>
      gradeResponses(questions, { ...emptyResponses(), order: { 14: order } })
        .verdicts[14];
    expect(grade([0, 1, 2, 3])).toBe('correct');
    expect(grade(shown)).toBe('wrong');
  });

  it('câu 2 dòng luôn hiện ngược thứ tự đúng', () => {
    const twoRows = [
      question('q', 'ordering'),
      p('Sắp xếp'),
      orderingItem('Trước', 1),
      orderingItem('Sau', 2),
    ];
    for (let seed = 0; seed < 50; seed += 1) {
      expect(keysOf(stripAnswers(twoRows, seed), 'q')).toEqual([1, 0]);
    }
  });
});
