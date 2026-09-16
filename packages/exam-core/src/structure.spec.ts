import { buildPlan } from './plan';
import { extractStructure } from './structure';
import { loadFixture } from './testing/fixtures';
import {
  orderingItem,
  part,
  question,
  subpart,
  todo,
} from './testing/builders';

describe('extractStructure', () => {
  const sample = extractStructure(loadFixture('exam-editor-sample'));
  const byNumber = new Map(sample.questions.map((q) => [q.number, q]));

  it('mỗi số câu một dòng, đánh số liên tục từ 1', () => {
    expect(sample.questions.map((q) => q.number)).toEqual(
      Array.from({ length: 17 }, (_, i) => i + 1),
    );
    expect(
      sample.questions.map((q) => [q.number, q.qtype, q.nodeId, q.subIndex]),
    ).toEqual([
      [1, 'fill-blank', 'sample-question-1', 0],
      [2, 'fill-blank', 'sample-question-1', 1],
      [3, 'fill-blank', 'sample-question-1', 2],
      [4, 'mc-single', 'sample-question-2', 0],
      [5, 'pick-n', 'sample-pick-n-1', 0],
      [6, 'pick-n', 'sample-pick-n-1', 1],
      [7, 'matching', 'sample-matching-1', 0],
      [8, 'matching', 'sample-matching-1', 1],
      [9, 'matching', 'sample-matching-1', 2],
      [10, 'fill-blank', 'sample-question-3', 0],
      [11, 'tfng', 'sample-tfng-1', 0],
      [12, 'tfng', 'sample-tfng-1', 1],
      [13, 'tfng', 'sample-tfng-1', 2],
      [14, 'ordering', 'sample-ordering-1', 0],
      [15, 'polytomous', 'sample-polytomous-scoring-1', 0],
      [16, 'speaking', 'sample-speaking-1', 0],
      [17, 'writing', 'sample-writing-1', 0],
    ]);
  });

  it('answer_key theo từng dạng', () => {
    expect([1, 2, 3].map((n) => byNumber.get(n)?.answerKey)).toEqual([
      { accepted: ['9:30 a.m.'] },
      { accepted: ['monday'] },
      { accepted: ['b204'] },
    ]);
    expect(byNumber.get(4)?.answerKey).toEqual({ indexes: [1] });
    expect(byNumber.get(5)).toMatchObject({
      answerKey: { indexes: [0, 2], pickIndex: 0 },
      params: { maxPicks: 2 },
    });
    expect(byNumber.get(6)?.answerKey).toEqual({
      indexes: [0, 2],
      pickIndex: 1,
    });
    expect(byNumber.get(8)).toMatchObject({
      answerKey: { answer: 'Thinks the deadline is too tight' },
      // Matching đời cũ chưa khai báo option: gom đáp án, sắp xếp.
      options: [
        'Prefers working from home',
        'Suggests hiring more staff',
        'Thinks the deadline is too tight',
      ],
    });
    expect(byNumber.get(13)).toMatchObject({
      answerKey: { answer: 'Not Given' },
      options: ['True', 'False', 'Not Given'],
    });
    expect(byNumber.get(14)?.answerKey).toEqual({ order: [0, 1, 2, 3] });
    expect(byNumber.get(15)?.answerKey).toEqual({ weights: [2, 1, 0] });
  });

  it('câu tự động điểm tối đa 1, Speaking/Writing chấm tay điểm tối đa 10', () => {
    expect(byNumber.get(4)).toMatchObject({ grading: 'auto', maxScore: 1 });
    expect(byNumber.get(16)).toMatchObject({
      grading: 'manual',
      answerKey: null,
      params: { seconds: 120 },
      maxScore: 10,
    });
    expect(byNumber.get(17)).toMatchObject({
      grading: 'manual',
      answerKey: null,
      params: { maxChars: 1200 },
      maxScore: 10,
    });
  });

  it('part / subpart kèm khoảng số câu, câu hỏi gắn part gần nhất', () => {
    expect(sample.parts).toEqual([
      part_('sample-part-1', 'part', null, 0, 1, 9),
      part_('sample-part-2', 'part', null, 1, 10, 15),
      part_('sample-subpart-1', 'subpart', 'sample-part-2', 2, 10, 13),
      part_('sample-subpart-2', 'subpart', 'sample-part-2', 3, 14, 15),
      part_('sample-part-3', 'part', null, 4, 16, 17),
      part_('sample-subpart-3', 'subpart', 'sample-part-3', 5, null, null),
    ]);
    expect([1, 10, 14, 16].map((n) => byNumber.get(n)?.partNodeId)).toEqual([
      'sample-part-1',
      'sample-subpart-1',
      'sample-subpart-2',
      'sample-part-3',
    ]);
  });

  it('câu trước part đầu tiên không có part; subpart không có part cha', () => {
    const { parts, questions } = extractStructure([
      question('q1', 'mc-single'),
      todo('A', true),
      subpart('s1'),
      question('q2', 'ordering'),
      orderingItem('x', 2),
      orderingItem('y', 1),
      part('p1'),
    ]);
    expect(questions.map((q) => [q.number, q.partNodeId])).toEqual([
      [1, null],
      [2, 's1'],
    ]);
    expect(questions[1].answerKey).toEqual({ order: [1, 0] });
    expect(parts.map((x) => [x.nodeId, x.parentNodeId, x.firstNumber])).toEqual(
      [
        ['s1', null, 2],
        ['p1', null, null],
      ],
    );
  });

  it('đề exam-draft-2: số câu khớp buildPlan, đáp án qua được JSON (jsonb)', () => {
    const value = loadFixture('exam-draft-2');
    const { questions } = extractStructure(value);
    const numbers = buildPlan(value).parts.flatMap((x) => x.numbers);
    expect(questions.map((q) => q.number)).toEqual(numbers);
    expect(numbers[0]).toBe(1);
    expect(JSON.parse(JSON.stringify(questions))).toEqual(questions);
  });
});

function part_(
  nodeId: string,
  kind: string,
  parentNodeId: string | null,
  sortOrder: number,
  firstNumber: number | null,
  lastNumber: number | null,
) {
  return { nodeId, kind, parentNodeId, sortOrder, firstNumber, lastNumber };
}
