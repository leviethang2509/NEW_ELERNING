import {
  emptyResponses,
  gradeExam,
  gradeResponses,
  type Responses,
} from './grading';
import { buildPlan } from './plan';
import { seededRandom } from './random';
import { extractStructure, type GradableQuestion } from './structure';
import {
  blank,
  orderingItem,
  p,
  pair,
  question,
  text,
  todo,
  withExplanations,
} from './testing/builders';
import { loadFixture } from './testing/fixtures';
import { lcGradeExam } from './testing/lc-grading';
import { simulateResponses } from './testing/simulate';

const roundTrip = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

describe.each(['exam-editor-sample', 'exam-draft-2'] as const)(
  'chấm đề %s',
  (name) => {
    const value = loadFixture(name);
    const plan = buildPlan(value);
    // Như server: câu hỏi đọc lại từ jsonb.
    const stored = roundTrip(extractStructure(value).questions);

    it('gradeExam, gradeResponses và gradeExam cũ của LC cho cùng kết quả', () => {
      const random = seededRandom(name);
      const cases = [
        emptyResponses(),
        simulateResponses(plan, 'correct', random),
        ...Array.from({ length: 300 }, () =>
          simulateResponses(plan, 'random', random),
        ),
      ];
      for (const responses of cases) {
        const expected = lcGradeExam(plan, responses);
        expect(gradeExam(plan, responses)).toEqual(expected);
        expect(gradeResponses(stored, responses)).toEqual(expected);
        // Câu trả lời lưu jsonb có khoá số câu dạng chuỗi.
        expect(gradeResponses(stored, roundTrip(responses))).toEqual(expected);
      }
    });

    it('giải thích sau mỗi câu không đổi đánh số và kết quả chấm', () => {
      const explained = withExplanations(value);
      const explainedPlan = buildPlan(explained);
      const explainedStored = roundTrip(extractStructure(explained).questions);
      expect(explainedStored).toEqual(stored);
      const random = seededRandom(`${name}:explained`);
      for (let i = 0; i < 100; i += 1) {
        const responses = simulateResponses(plan, 'random', random);
        const expected = lcGradeExam(plan, responses);
        expect(gradeExam(explainedPlan, responses)).toEqual(expected);
        expect(gradeResponses(explainedStored, responses)).toEqual(expected);
      }
    });
  },
);

describe('gradeResponses', () => {
  it('đề mẫu trả lời đúng hết', () => {
    const plan = buildPlan(loadFixture('exam-editor-sample'));
    const result = gradeExam(
      plan,
      simulateResponses(plan, 'correct', seededRandom('x')),
    );
    expect(result).toMatchObject({ correct: 15, total: 15, manual: 2 });
  });

  // Số câu: mc 1, multi 2, pick 3–4, poly 5, order 6, match 7–8, blank 9, write 10.
  const { questions } = extractStructure([
    question('mc', 'mc-single'),
    todo('A'),
    todo('B', true),
    todo('C'),
    question('multi', 'mc-multi'),
    todo('A', true),
    todo('B', true),
    todo('C'),
    question('pick', 'pick-n', { maxPicks: 2 }),
    todo('A', true),
    todo('B'),
    todo('C', true),
    todo('D'),
    question('poly', 'polytomous'),
    orderingItem('x', 1),
    orderingItem('y', 3),
    orderingItem('z', 3),
    question('order', 'ordering'),
    orderingItem('1', 2),
    orderingItem('2', 1),
    orderingItem('3', 3),
    question('match', 'matching', { options: ['Anna', 'Ben'] }),
    pair('Q1', 'Anna'),
    pair('Q2', ' Ben '),
    question('blank', 'fill-blank'),
    p([text('Go '), blank('by bus | by  Coach'), text('.')]),
    question('write', 'writing', { maxChars: 50 }),
    p('Viết'),
  ]);

  const grade = (partial: Partial<Responses>) =>
    gradeResponses(questions, { ...emptyResponses(), ...partial }).verdicts;

  it('MC: bỏ lựa chọn trùng / không hợp lệ, phải chọn đúng đủ', () => {
    expect(grade({ picks: { 1: [1] } })[1]).toBe('correct');
    expect(grade({ picks: { 1: [1, 1, -1, 0.5] } })[1]).toBe('correct');
    expect(grade({ picks: { 1: [0, 1] } })[1]).toBe('wrong');
    expect(grade({ picks: { 2: [1, 0] } })[2]).toBe('correct');
    expect(grade({ picks: { 2: [0] } })[2]).toBe('wrong');
  });

  it('pick-n: mỗi lựa chọn đúng một câu, chọn quá số cho phép thì sai cả', () => {
    const verdicts = (picks: number[]) => {
      const v = grade({ picks: { 3: picks } });
      return [v[3], v[4]];
    };
    expect(verdicts([0, 2])).toEqual(['correct', 'correct']);
    expect(verdicts([1, 2])).toEqual(['correct', 'wrong']);
    expect(verdicts([0, 0, 2, 2])).toEqual(['correct', 'correct']);
    expect(verdicts([0, 1, 2])).toEqual(['wrong', 'wrong']);
    expect(verdicts([0, 1, 2, 3])).toEqual(['wrong', 'wrong']);
  });

  it('polytomous: chọn đúng một dòng có trọng số cao nhất', () => {
    expect(grade({ picks: { 5: [1] } })[5]).toBe('correct');
    expect(grade({ picks: { 5: [2] } })[5]).toBe('correct');
    expect(grade({ picks: { 5: [0] } })[5]).toBe('wrong');
    expect(grade({ picks: { 5: [1, 2] } })[5]).toBe('wrong');
  });

  it('ordering: đúng thứ tự `key`', () => {
    expect(grade({ order: { 6: [1, 0, 2] } })[6]).toBe('correct');
    expect(grade({ order: { 6: [0, 1, 2] } })[6]).toBe('wrong');
    expect(grade({ order: { 6: [1, 0, 2, 2] } })[6]).toBe('wrong');
  });

  it('cặp ghép so khớp sau khi bỏ khoảng trắng hai đầu, phân biệt hoa thường', () => {
    const verdicts = grade({ value: { 7: ' Anna ', 8: 'Ben' } });
    expect([verdicts[7], verdicts[8]]).toEqual(['correct', 'correct']);
    expect(grade({ value: { 7: 'anna' } })[7]).toBe('wrong');
  });

  it('fill-blank: nhiều đáp án ngăn bằng |, không phân biệt hoa thường/khoảng trắng', () => {
    expect(grade({ value: { 9: '  BY   coach ' } })[9]).toBe('correct');
    expect(grade({ value: { 9: 'by bus' } })[9]).toBe('correct');
    expect(grade({ value: { 9: '' } })[9]).toBe('wrong');
  });

  it('câu trả lời hỏng không làm lỗi, Writing luôn chờ chấm tay', () => {
    const broken = {
      value: 5,
      picks: null,
      order: { 6: 'abc' },
    } as unknown as Responses;
    expect(gradeResponses(questions, broken)).toMatchObject({
      correct: 0,
      total: 9,
      manual: 1,
    });
    expect(grade({})[10]).toBe('manual');
  });

  it('câu MC chưa có đáp án thì không bao giờ đúng', () => {
    const empty: GradableQuestion[] = [
      {
        number: 1,
        nodeId: 'q',
        qtype: 'mc-single',
        answerKey: { indexes: [] },
      },
    ];
    expect(gradeResponses(empty, emptyResponses()).verdicts[1]).toBe('wrong');
  });
});
