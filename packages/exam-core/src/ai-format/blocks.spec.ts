import type { ExamElement } from '../node';
import { blank, p, pair, question, text, todo } from '../testing/builders';
import { aiInputProblem, formatAiBlocks, toAiBlocks } from './blocks';
import { AI_FORMAT_MAX_BLOCKS, AI_FORMAT_MAX_CHARS } from './ops';

const table: ExamElement = {
  type: 'table',
  children: [
    {
      type: 'tr',
      children: [
        { type: 'td', children: [p('Name')] },
        { type: 'td', children: [p('Ann ____')] },
      ],
    },
  ],
};

describe('toAiBlocks / formatAiBlocks', () => {
  it('mô tả từng loại block theo chỉ số gốc', () => {
    const value: ExamElement[] = [
      p('READING PASSAGE 1', {}),
      question('q1', 'mc-single'),
      p('Which is true?'),
      todo('A. Yes', true),
      pair('Martin', 'B'),
      p([text('It starts at '), blank('9 am'), text('.')]),
      { type: 'img', url: 'https://x/y.webp', children: [text('')] },
      table,
    ];
    expect(formatAiBlocks(toAiBlocks(value)).split('\n')).toEqual([
      '[0] p: "READING PASSAGE 1"',
      '[1] indicator (kind=question qtype=mc-single): ""',
      '[2] p: "Which is true?"',
      '[3] todo (checked): "A. Yes"',
      '[4] pair (answer="B"): "Martin"',
      '[5] p (blanks=["9 am"]): "It starts at 9 am."',
      '[6] img: ""',
      '[7] table: "Name | Ann ____"',
    ]);
  });
});

describe('aiInputProblem', () => {
  it('section rỗng hoặc quá lớn', () => {
    expect(aiInputProblem([p('')])).toBe(
      'Section chưa có chữ nào để định dạng.',
    );
    expect(aiInputProblem([p('ok')])).toBeNull();
    const many = Array.from({ length: AI_FORMAT_MAX_BLOCKS + 1 }, () => p('x'));
    expect(aiInputProblem(many)).toContain('vượt giới hạn');
    expect(aiInputProblem([p('x'.repeat(AI_FORMAT_MAX_CHARS + 1))])).toContain(
      'vượt giới hạn',
    );
  });
});
