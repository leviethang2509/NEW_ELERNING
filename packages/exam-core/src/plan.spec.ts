import { buildOutline } from './outline';
import { buildPlan, range } from './plan';
import { loadFixture } from './testing/fixtures';
import { p, part, question, todo } from './testing/builders';

describe('buildPlan', () => {
  it('đánh số từ 1 theo dạng câu hỏi (đề mẫu)', () => {
    const plan = buildPlan(loadFixture('exam-editor-sample'));

    expect(plan.intro).toHaveLength(3);
    expect(plan.parts.map((x) => x.key)).toEqual([
      'sample-part-1',
      'sample-part-2',
      'sample-part-3',
    ]);
    expect(plan.parts.map((x) => x.numbers)).toEqual([
      range(1, 9),
      range(10, 6),
      [16, 17],
    ]);

    const segments = plan.parts
      .flatMap((x) => x.items)
      .filter((s) => s.indicator?.kind === 'question')
      .map((s) => [s.indicator?.id, s.start, s.count]);
    expect(segments).toEqual([
      ['sample-question-1', 1, 3],
      ['sample-question-2', 4, 1],
      ['sample-pick-n-1', 5, 2],
      ['sample-matching-1', 7, 3],
      ['sample-question-3', 10, 1],
      ['sample-tfng-1', 11, 3],
      ['sample-ordering-1', 14, 1],
      ['sample-polytomous-scoring-1', 15, 1],
      ['sample-speaking-1', 16, 1],
      ['sample-writing-1', 17, 1],
    ]);
  });

  it('gom nội dung trước part đầu tiên vào part ngầm', () => {
    const plan = buildPlan([
      p('Hướng dẫn'),
      question('q1', 'writing', { maxChars: 100 }),
      p('Viết'),
      part('p1'),
      p('Passage'),
      question('q2', 'mc-single'),
      todo('A', true),
    ]);

    expect(plan.intro).toEqual([p('Hướng dẫn')]);
    expect(plan.parts.map((x) => [x.key, x.indicator?.id, x.numbers])).toEqual([
      ['implicit', undefined, [1]],
      ['p1', 'p1', [2]],
    ]);
    expect(plan.parts[1].passage).toEqual([p('Passage')]);
  });

  it('pick-n: theo maxPicks, đề cũ đếm ô đã tick, không vượt số lựa chọn', () => {
    const count = (props: Record<string, unknown>) =>
      buildPlan([
        question('q', 'pick-n', props),
        todo('A', true),
        todo('B', true),
        todo('C'),
      ]).parts[0].numbers.length;

    expect(count({ maxPicks: 3 })).toBe(3);
    expect(count({})).toBe(2);
    expect(count({ maxPicks: 1_000_000 })).toBe(3);
    expect(count({ maxPicks: 'hai' })).toBe(2);
  });

  it('câu hỏi chưa chọn dạng hoặc dạng lạ không được đánh số', () => {
    const plan = buildPlan([
      question('q1', 'khong-co'),
      p('x'),
      question('q2', 'mc-single'),
      todo('A', true),
    ]);
    expect(plan.parts[0].numbers).toEqual([1]);
    expect(plan.parts[0].items.map((s) => s.start)).toEqual([0, 1]);
  });
});

describe('buildOutline', () => {
  it('nhãn part / subpart / question của đề mẫu', () => {
    const outline = buildOutline(loadFixture('exam-editor-sample'));
    expect(outline.map((x) => x.label)).toEqual([
      'Part 1',
      'Question 1',
      'Question 2',
      'Question 3',
      'Question 4',
      'Part 2',
      'Subpart 2.1',
      'Question 5',
      'Question 6',
      'Subpart 2.2',
      'Question 7',
      'Question 8',
      'Part 3',
      'Question 9',
      'Question 10',
      'Subpart 3.1',
    ]);
    expect(outline[13].sub).toBe('Speaking · 120 giây');
  });
});
