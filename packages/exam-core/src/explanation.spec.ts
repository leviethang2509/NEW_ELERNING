import { blanksIn } from './blank';
import {
  explanationsFor,
  extractExplanations,
  isExplanation,
} from './explanation';
import { isIndicator } from './indicator';
import { migrateExamValue } from './migrate';
import { plainText, type ExamElement } from './node';
import { buildOutline } from './outline';
import { buildPlan } from './plan';
import { stripAnswers } from './strip';
import {
  blank,
  explanation,
  p,
  pair,
  part,
  question,
  subpart,
  text,
  todo,
  withExplanations,
} from './testing/builders';
import { loadFixture } from './testing/fixtures';
import { validateSection, validateSectionShape } from './validate';

const numbersOf = (value: readonly ExamElement[]) =>
  Object.fromEntries(
    extractExplanations(value).map((item) => [item.nodeId, item.numbers]),
  );

describe('extractExplanations', () => {
  const value = [
    explanation('e0'),
    p('Giải thích đứng đầu section'),
    part('p1'),
    p('Passage'),
    explanation('e-passage'),
    p('Giải thích passage'),
    question('q1', 'mc-single'),
    p('Câu 1'),
    todo('A', true),
    todo('B'),
    explanation('e1'),
    p('Vì A đúng'),
    explanation('e1b'),
    p('Giải thích thêm cho câu 1'),
    question('q2', 'fill-blank'),
    p([text('Điền '), blank('x'), text(' và '), blank('y')]),
    explanation('e2'),
    p('Hai ô trống'),
    subpart('s1'),
    explanation('e-subpart'),
    p('Sau subpart'),
    question('q3', 'tfng'),
    pair('Mệnh đề', 'True'),
    part('p2'),
    explanation('e-part2'),
    p('Đầu part 2'),
    question('q4', ''),
    explanation('e-untyped'),
    p('Câu chưa chọn dạng'),
  ];

  it('gắn câu hỏi ngay phía trên, bỏ qua giải thích khác; qua part/subpart thì không gắn', () => {
    expect(numbersOf(value)).toEqual({
      e0: [],
      'e-passage': [],
      e1: [1],
      e1b: [1],
      e2: [2, 3],
      'e-subpart': [],
      'e-part2': [],
      'e-untyped': [],
    });
  });

  it('nội dung là các block tới indicator kế tiếp', () => {
    const [, , e1] = extractExplanations(value);
    expect(e1.nodeId).toBe('e1');
    expect(e1.blocks.map(plainText)).toEqual(['Vì A đúng']);
  });

  it('không tính vào đánh số và không chiếm nội dung câu hỏi', () => {
    const plan = buildPlan(value);
    // Giải thích đứng trước part đầu tiên nằm trong part ngầm như subpart/question.
    expect(plan.parts.map((x) => x.numbers)).toEqual([[], [1, 2, 3, 4], []]);
    const q1 = plan.parts[1].items.find((seg) => seg.indicator?.id === 'q1');
    expect(q1?.blocks.map(plainText)).toEqual(['Câu 1', 'A', 'B']);
  });

  it('explanationsFor lấy theo số câu', () => {
    const all = extractExplanations(value);
    expect(explanationsFor(all, 1).map((x) => x.nodeId)).toEqual(['e1', 'e1b']);
    expect(explanationsFor(all, 3).map((x) => x.nodeId)).toEqual(['e2']);
    expect(explanationsFor(all, 4)).toEqual([]);
  });
});

describe('stripAnswers với giải thích', () => {
  it('chỉ giữ indicator rỗng, bỏ toàn bộ nội dung giải thích', () => {
    const value = withExplanations(loadFixture('exam-editor-sample'));
    const content = stripAnswers(value, 3);
    const explanations = content.filter(isExplanation);
    expect(explanations.length).toBeGreaterThan(0);
    for (const node of explanations) {
      const next = content[content.indexOf(node) + 1];
      expect(next === undefined || isIndicator(next)).toBe(true);
    }
    expect(JSON.stringify(content)).not.toContain('trong giải thích');
    expect(blanksIn(content)).toHaveLength(
      blanksIn(loadFixture('exam-editor-sample')).length,
    );
  });
});

describe('validate với giải thích', () => {
  it('indicator explanation hợp lệ khi lưu', () => {
    expect(
      validateSectionShape([question('q', 'writing'), explanation('e')]),
    ).toEqual([]);
  });

  it('giải thích rỗng chỉ là cảnh báo', () => {
    const issues = validateSection([
      question('q', 'writing', { maxChars: 100 }),
      p('Viết đoạn văn'),
      explanation('e'),
      p(''),
    ]);
    expect(issues).toEqual([
      expect.objectContaining({ indicatorId: 'e', severity: 'warning' }),
    ]);
  });

  it('câu hỏi đứng trước giải thích mà rỗng vẫn báo lỗi', () => {
    const issues = validateSection([
      question('q', 'writing', { maxChars: 100 }),
      explanation('e'),
      p('Giải thích'),
    ]);
    expect(issues).toEqual([
      expect.objectContaining({ indicatorId: 'q', severity: 'error' }),
    ]);
  });
});

describe('outline & migrate với giải thích', () => {
  it('outline ghi câu được gắn, không tăng số Question', () => {
    const outline = buildOutline([
      question('q1', 'fill-blank'),
      p([blank('a'), blank('b')]),
      explanation('e1'),
      p('x'),
      question('q2', 'writing'),
      part('p'),
      explanation('e2'),
    ]);
    expect(outline.map((item) => [item.label, item.sub])).toEqual([
      ['Question 1', 'Điền vào chỗ trống'],
      ['Explanation', 'câu 1–2'],
      ['Question 2', 'Writing'],
      ['Part 1', ''],
      ['Explanation', 'không gắn câu hỏi nào'],
    ]);
  });

  it('migrate giữ nguyên indicator explanation', () => {
    const value = [explanation('e')];
    expect(migrateExamValue(value)).toBe(value);
  });
});
