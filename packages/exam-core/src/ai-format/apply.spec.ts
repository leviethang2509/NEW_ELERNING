import { blanksIn } from '../blank';
import { isIndicator } from '../indicator';
import { plainText, type ExamElement } from '../node';
import { blank, p, text } from '../testing/builders';
import {
  structureErrors,
  validateSection,
  validateSectionShape,
} from '../validate';
import { applyAiOps } from './apply';
import { parseAiOps } from './ops';

/** Id tăng dần cho kết quả ổn định. */
function ids() {
  let n = 0;
  return () => `ai-${++n}`;
}

const apply = (value: ExamElement[], ops: unknown[]) =>
  applyAiOps(value, parseAiOps(ops), { createId: ids() });

describe('applyAiOps – từng loại thao tác', () => {
  it('chèn indicator trước block, cả ở cuối section', () => {
    const { value, problems, origins } = apply(
      [p('Questions 1-2'), p('Q1')],
      [
        { op: 'indicator', before: 0, kind: 'part' },
        {
          op: 'indicator',
          before: 1,
          kind: 'question',
          qtype: 'writing',
          maxChars: 1500,
        },
        { op: 'indicator', before: 2, kind: 'explanation' },
      ],
    );
    expect(problems).toEqual([]);
    expect(value.map((b) => (isIndicator(b) ? b.kind : plainText(b)))).toEqual([
      'part',
      'Questions 1-2',
      'question',
      'Q1',
      'explanation',
    ]);
    expect(value[2]).toMatchObject({
      id: 'ai-2',
      qtype: 'writing',
      maxChars: 1500,
    });
    expect(origins['ai-2']).toEqual({ opIndex: 1, block: 1 });
  });

  it('choices: dòng thành checkbox, tick đúng block, bỏ thuộc tính list cũ', () => {
    const { value } = apply(
      [
        p('A. one', { listStyleType: 'decimal', indent: 1, listStart: 1 }),
        { type: 'h3', children: [text('B. two')] },
      ],
      [{ op: 'choices', blocks: [0, 1], correct: [1] }],
    );
    expect(value).toEqual([
      {
        type: 'p',
        listStyleType: 'todo',
        indent: 1,
        checked: false,
        children: [text('A. one')],
      },
      {
        type: 'p',
        listStyleType: 'todo',
        indent: 1,
        checked: true,
        children: [text('B. two')],
      },
    ]);
  });

  it('pairs: TFNG viết tắt/viết hoa đưa về đúng option', () => {
    const { value } = apply(
      [p('S1'), p('S2'), p('S3')],
      [
        { op: 'indicator', before: 0, kind: 'question', qtype: 'tfng' },
        { op: 'pairs', blocks: [0, 1, 2], answers: ['TRUE', 'ng', ''] },
      ],
    );
    expect(value.slice(1)).toEqual([
      { type: 'pair', id: 'ai-2', answer: 'True', children: [text('S1')] },
      { type: 'pair', id: 'ai-3', answer: 'Not Given', children: [text('S2')] },
      { type: 'pair', id: 'ai-4', answer: '', children: [text('S3')] },
    ]);
  });

  it('pairs matching: đáp án khớp option không phân biệt hoa thường', () => {
    const { value } = apply(
      [p('Paragraph A')],
      [
        {
          op: 'indicator',
          before: 0,
          kind: 'question',
          qtype: 'matching',
          options: ['i', 'ii', 'iii'],
        },
        { op: 'pairs', blocks: [0], answers: [' II '] },
      ],
    );
    expect(value[1]).toMatchObject({ type: 'pair', answer: 'ii' });
  });

  it('numbered: dòng đánh số tay, null = chưa có số', () => {
    const { value } = apply(
      [p('x'), p('y')],
      [{ op: 'numbered', blocks: [0, 1], nums: [2, null] }],
    );
    expect(value).toEqual([
      { type: 'p', listStyleType: 'ordering', num: 2, children: [text('x')] },
      { type: 'p', listStyleType: 'ordering', children: [text('y')] },
    ]);
  });

  it('blank: giữ mark của chữ hai bên, lần xuất hiện thứ n', () => {
    const { value, problems } = apply(
      [
        p([
          { text: 'Fire began in a ', bold: true },
          { text: '______ shop and spread to ______ houses.' },
        ]),
      ],
      [
        {
          op: 'blank',
          block: 0,
          match: '______',
          occurrence: 2,
          answer: '13,200',
        },
        { op: 'blank', block: 0, match: '______', answer: "baker's|bakery" },
      ],
    );
    expect(problems).toEqual([]);
    expect(value[0].children).toEqual([
      { text: 'Fire began in a ', bold: true },
      { type: 'blank', children: [text("baker's|bakery")] },
      { text: '' },
      { text: ' shop and spread to ' },
      { type: 'blank', children: [text('13,200')] },
      { text: '' },
      { text: ' houses.' },
    ]);
  });

  it('blank trong ô bảng; khớp được dù AI chép nháy thẳng thay nháy cong', () => {
    const table: ExamElement = {
      type: 'table',
      children: [
        {
          type: 'tr',
          children: [{ type: 'td', children: [p('Owner’s name: ……')] }],
        },
      ],
    };
    const { value, problems } = apply(
      [table],
      [{ op: 'blank', block: 0, match: "Owner's name: ……", answer: 'Farynor' }],
    );
    expect(problems).toEqual([]);
    expect(blanksIn(value).map(plainText)).toEqual(['Farynor']);
  });

  it('removeText + removeBlocks', () => {
    const { value } = apply(
      [p('Which year? Answer: B'), p('ANSWER KEY'), p('1. B')],
      [
        { op: 'removeText', block: 0, match: ' Answer: B' },
        { op: 'removeBlocks', from: 1, to: 2 },
      ],
    );
    expect(value).toEqual([p('Which year?')]);
  });
});

describe('applyAiOps – thao tác bị bỏ', () => {
  const value = [
    p('a'),
    p([text('x '), blank('old'), text(' y')]),
    { type: 'img', url: 'u', children: [text('')] },
    p('c'),
  ];

  it.each([
    [{ op: 'indicator', before: 9, kind: 'part' }, 'Block [9] không tồn tại.'],
    [
      { op: 'choices', blocks: [0, 0], correct: [] },
      'Có block lặp lại trong `blocks`.',
    ],
    [
      { op: 'choices', blocks: [2], correct: [] },
      'Block [2] (img) không đổi loại được.',
    ],
    [
      { op: 'removeBlocks', from: 2, to: 3 },
      'Block [2] (img) là media, phải giữ nguyên.',
    ],
    [
      { op: 'blank', block: 0, match: 'zzz', answer: '' },
      'Không tìm thấy nguyên văn "zzz" trong block.',
    ],
    [
      { op: 'blank', block: 0, match: 'a', occurrence: 2, answer: '' },
      '"a" chỉ xuất hiện 1 lần trong block.',
    ],
    [
      { op: 'removeText', block: 1, match: 'x old' },
      '"x old" chồng lên blank/link có sẵn trong block.',
    ],
  ])('%j', (op, message) => {
    const result = apply(value, [op]);
    expect(result.problems).toEqual([{ opIndex: 0, message }]);
    expect(result.value).toEqual(value);
  });

  it('block đã được thao tác trước dùng / đã bị xoá', () => {
    const result = apply(value, [
      { op: 'choices', blocks: [0], correct: [0] },
      { op: 'pairs', blocks: [0], answers: ['x'] },
      { op: 'removeBlocks', from: 3, to: 3 },
      { op: 'blank', block: 3, match: 'c', answer: 'c' },
      { op: 'removeText', block: 0, match: 'a' },
      { op: 'removeText', block: 0, match: 'a' },
    ]);
    expect(result.problems).toEqual([
      { opIndex: 1, message: 'Block [0] đã được thao tác #0 dùng.' },
      { opIndex: 3, message: 'Block [3] đã bị xoá bởi thao tác khác.' },
      { opIndex: 5, message: '"a" chồng lên đoạn thao tác #4 đã sửa.' },
    ]);
    // Sửa chữ rồi đổi loại trên cùng block vẫn được.
    expect(result.value[0]).toMatchObject({
      listStyleType: 'todo',
      children: [text('')],
    });
  });
});

describe('applyAiOps – split', () => {
  const merged = () => [
    p('Questions 1-2'),
    p([
      text('A first option. '),
      { text: 'B second', bold: true },
      text(' option. C third option.'),
    ]),
  ];

  it('tách dòng, các thao tác khác trỏ vào phần bằng i.k, chữ nối lại vẫn đúng gốc', () => {
    const { value, problems, origins } = apply(merged(), [
      { op: 'split', block: 1, at: ['B second', 'C third'] },
      { op: 'indicator', before: 1, kind: 'question', qtype: 'mc-single' },
      { op: 'choices', blocks: [1, 1.1, 1.2], correct: [1.2] },
    ]);
    expect(problems).toEqual([]);
    expect(value.slice(2).map(plainText)).toEqual([
      'A first option. ',
      'B second option. ',
      'C third option.',
    ]);
    expect(value.slice(2).map((b) => b.checked)).toEqual([false, false, true]);
    // Mark của chữ giữ nguyên ở phần mới.
    expect(value[3].children[0]).toEqual({ text: 'B second', bold: true });
    expect(origins['ai-1']).toEqual({ opIndex: 1, block: 1 });
    expect(
      value.slice(2).map(plainText).join('') === plainText(merged()[1]),
    ).toBe(true);
  });

  it('origin của indicator chèn trước phần sau ghi dạng i.k', () => {
    const { origins } = apply(merged(), [
      { op: 'split', block: 1, at: ['B second'] },
      { op: 'indicator', before: 1.1, kind: 'question', qtype: 'mc-single' },
    ]);
    expect(origins['ai-1']).toEqual({ opIndex: 1, block: 1.1 });
  });

  it('`at` trùng đầu block được bỏ qua; chữ lặp lại tìm sau điểm tách trước', () => {
    const { value, problems } = apply(
      [p('1 Paragraph A 2 Paragraph B')],
      [{ op: 'split', block: 0, at: ['1 Paragraph', '2 Paragraph'] }],
    );
    expect(problems).toEqual([]);
    expect(value.map(plainText)).toEqual(['1 Paragraph A ', '2 Paragraph B']);
  });

  it('thao tác bị bỏ: chữ không có, block không tách được, phần không tồn tại', () => {
    const { value, problems } = apply(
      [
        p('A one B two'),
        { type: 'pair', id: 'x', answer: '', children: [text('1 a 2 b')] },
        { type: 'img', url: 'u', children: [text('')] },
      ],
      [
        { op: 'split', block: 0, at: ['C three'] },
        { op: 'split', block: 1, at: ['2 b'] },
        { op: 'split', block: 2, at: ['x'] },
        { op: 'split', block: 9, at: ['x'] },
        { op: 'choices', blocks: [0, 0.1], correct: [] },
      ],
    );
    expect(problems.map((p) => p.opIndex)).toEqual([0, 1, 2, 3, 4]);
    expect(problems[4].message).toContain('chưa được tách');
    expect(value).toHaveLength(3);
  });

  it('cùng block tách hai lần: lần sau bị bỏ', () => {
    const { problems } = apply(merged(), [
      { op: 'split', block: 1, at: ['B second'] },
      { op: 'split', block: 1, at: ['C third'] },
    ]);
    expect(problems.map((p) => p.opIndex)).toEqual([1]);
  });
});

describe('applyAiOps – blank & chạy lại trên section đã định dạng', () => {
  it('blank nới ra hết ô trống in sẵn khi AI chép thiếu ký tự chấm', () => {
    const { value } = apply(
      [p('London houses would have ………………. facades. By their ________')],
      [
        { op: 'blank', block: 0, match: '………', answer: 'brick' },
        { op: 'blank', block: 0, match: '___', answer: '' },
      ],
    );
    expect(plainText(value[0])).toBe(
      'London houses would have brick facades. By their ',
    );
    expect(blanksIn(value).map(plainText)).toEqual(['brick', '']);
  });

  it('blank chữ thường không bị nới', () => {
    const { value } = apply(
      [p('Answer.. the end')],
      [{ op: 'blank', block: 0, match: 'the', answer: '' }],
    );
    expect(plainText(value[0])).toBe('Answer..  end');
  });

  it('block đã có blank: không biến chữ thường thành blank, ô in sẵn thì được', () => {
    const { value, problems } = apply(
      [p([text('these '), blank(''), text(' stop and ....')])],
      [
        { op: 'blank', block: 0, match: 'these', answer: '' },
        { op: 'blank', block: 0, match: '....', answer: '' },
      ],
    );
    expect(problems.map((p) => p.opIndex)).toEqual([0]);
    expect(blanksIn(value)).toHaveLength(2);
  });

  it('đổi lại cặp ghép / lựa chọn đã có mà AI để trống đáp án: giữ đáp án cũ', () => {
    const { value } = apply(
      [
        { type: 'pair', id: 'p1', answer: 'True', children: [text('S1')] },
        p('A', { listStyleType: 'todo', indent: 1, checked: true }),
        p('B', { listStyleType: 'todo', indent: 1, checked: false }),
      ],
      [
        { op: 'pairs', blocks: [0], answers: [''] },
        { op: 'choices', blocks: [1, 2], correct: [] },
      ],
    );
    expect(value[0]).toMatchObject({ id: 'p1', answer: 'True' });
    expect(value.slice(1).map((b) => b.checked)).toEqual([true, false]);
  });
});

describe('applyAiOps – đề IELTS mẫu (tự viết)', () => {
  // Văn bản như người dùng dán vào: chưa có indicator, đáp án ở cuối đề.
  const pasted: ExamElement[] = [
    p('READING PASSAGE 1'), // 0
    p(
      'The Great Fire of London started on 2 September 1666 in a baker’s shop in Pudding Lane.',
    ), // 1
    p('Questions 1-3'), // 2
    p(
      'Do the following statements agree with the information given in Reading Passage 1?',
    ), // 3
    p('1 The fire started in a bakery.'), // 4
    p('2 The fire lasted for two weeks.'), // 5
    p('3 The baker was later arrested.'), // 6
    p('Question 4'), // 7
    p('Complete the sentence. Write ONE WORD ONLY.'), // 8
    p('4 The fire began in Pudding ……….'), // 9
    p('Question 5'), // 10
    p('When did the fire start?'), // 11
    p('A 1566'), // 12
    p('B 1666'), // 13
    p('C 1766'), // 14
    p('Question 6'), // 15
    p('Choose TWO letters. Which TWO were destroyed?'), // 16
    p('A the Guildhall'), // 17
    p('B the Tower'), // 18
    p('C St Paul’s Cathedral'), // 19
    p('Answer key'), // 20
    p('1 TRUE 2 FALSE 3 NOT GIVEN 4 Lane 5 B 6 A, C'), // 21
  ];

  const ops = [
    { op: 'indicator', before: 0, kind: 'part' },
    { op: 'indicator', before: 2, kind: 'subpart' },
    { op: 'indicator', before: 4, kind: 'question', qtype: 'tfng' },
    { op: 'pairs', blocks: [4, 5, 6], answers: ['TRUE', 'FALSE', 'NOT GIVEN'] },
    { op: 'indicator', before: 7, kind: 'subpart' },
    { op: 'indicator', before: 9, kind: 'question', qtype: 'fill-blank' },
    { op: 'blank', block: 9, match: '……….', answer: 'Lane' },
    { op: 'indicator', before: 10, kind: 'subpart' },
    { op: 'indicator', before: 11, kind: 'question', qtype: 'mc-single' },
    { op: 'choices', blocks: [12, 13, 14], correct: [13] },
    { op: 'indicator', before: 15, kind: 'subpart' },
    {
      op: 'indicator',
      before: 16,
      kind: 'question',
      qtype: 'pick-n',
      maxPicks: 2,
    },
    { op: 'choices', blocks: [17, 18, 19], correct: [17, 19] },
    { op: 'removeBlocks', from: 20, to: 21 },
  ];

  it('áp xong không còn lỗi, lưu được', () => {
    const result = apply(pasted, ops);
    expect(result.problems).toEqual([]);
    expect(validateSectionShape(result.value)).toEqual([]);
    expect(validateSection(result.value)).toEqual([]);
  });

  it('chữ gốc giữ nguyên, trừ đoạn thành blank và block đã xoá', () => {
    const result = apply(pasted, ops);
    const withoutBlanks = (block: ExamElement) =>
      (block.children as ExamElement[])
        .map((c) => (c.type === 'blank' ? '' : plainText(c)))
        .join('');
    const out = result.value.filter((b) => !isIndicator(b)).map(withoutBlanks);
    const expected = pasted.slice(0, 20).map(plainText);
    expected[9] = '4 The fire began in Pudding ';
    expect(out).toEqual(expected);
  });

  it('thiếu đáp án chỉ là lỗi nhóm answer, không phải lỗi cấu trúc', () => {
    const noKey = ops.map((op) =>
      op.op === 'pairs'
        ? { ...op, answers: ['', '', ''] }
        : op.op === 'choices'
          ? { ...op, correct: [] }
          : op,
    );
    const issues = validateSection(apply(pasted, noKey).value);
    expect(issues.length).toBeGreaterThan(0);
    expect(structureErrors(issues)).toEqual([]);
  });
});
