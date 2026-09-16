import { isIndicator } from './indicator';
import { collectDataUrls, replaceDataUrls } from './media';
import { MAX_NODE_DEPTH, type ExamElement } from './node';
import { p, question, todo } from './testing/builders';
import { loadFixture } from './testing/fixtures';
import {
  hasErrors,
  validateExam,
  validateSection,
  validateSectionShape,
} from './validate';

describe('validateExam', () => {
  it('đề mẫu: matching chưa khai báo option, pick-n chưa đặt số đáp án', () => {
    const issues = validateExam(loadFixture('exam-editor-sample'));
    expect(issues.map((i) => [i.indicatorId, i.message])).toEqual([
      ['sample-pick-n-1', 'Chưa đặt số đáp án cần chọn — bấm badge để nhập.'],
      [
        'sample-matching-1',
        'Chưa khai báo danh sách option — bấm badge để nhập.',
      ],
    ]);
  });

  it('đề mẫu bổ sung đủ tham số thì không còn lỗi', () => {
    const value = loadFixture('exam-editor-sample').map((node) => {
      if (!isIndicator(node)) return node;
      if (node.id === 'sample-pick-n-1') return { ...node, maxPicks: 2 };
      if (node.id === 'sample-matching-1') {
        return {
          ...node,
          options: [
            'Prefers working from home',
            'Thinks the deadline is too tight',
            'Suggests hiring more staff',
            'Nhiễu',
          ],
        };
      }
      return node;
    });
    expect(validateSection(value)).toEqual([]);
  });

  it('tham số không phải số nguyên dương coi như chưa đặt', () => {
    const issues = validateExam([
      question('s', 'speaking', { seconds: '60' }),
      p('Nói'),
      question('pick', 'pick-n', { maxPicks: 3 }),
      todo('A', true),
      todo('B', true),
    ]);
    expect(issues.map((i) => i.message)).toEqual([
      'Chưa đặt thời gian nói.',
      'Cần chọn 3 đáp án nhưng chỉ có 2 lựa chọn.',
    ]);
  });
});

describe('validateSectionShape / validateSection', () => {
  it('chặn media data: URI', () => {
    const value = loadFixture('exam-draft-2');
    expect(validateSectionShape(value)).toEqual([
      'Còn 1 media nhúng dạng data: URI — cần upload trước khi lưu.',
    ]);
    const issues = validateSection(value);
    expect(issues[0]).toMatchObject({ indicatorId: null, severity: 'error' });
    expect(hasErrors(issues)).toBe(true);
  });

  it.each([
    ['không phải mảng', { type: 'p', children: [] }],
    ['thiếu children', [{ type: 'p' }]],
    ['text không phải chuỗi', [{ type: 'p', children: [{ text: 1 }] }]],
    ['block cấp đầu là text', [{ text: 'x' }]],
    ['type không phải chuỗi', [{ type: 3, children: [{ text: '' }] }]],
  ])('sai định dạng: %s', (_, value) => {
    expect(validateSectionShape(value)).toEqual([
      'Nội dung section không đúng định dạng.',
    ]);
  });

  it('lồng quá sâu', () => {
    let node: ExamElement = { type: 'p', children: [{ text: 'x' }] };
    for (let i = 0; i < MAX_NODE_DEPTH + 5; i += 1) {
      node = { type: 'blockquote', children: [node] };
    }
    expect(validateSectionShape([node])).toHaveLength(1);
    expect(validateSectionShape([p('x')])).toEqual([]);
  });

  it('indicator thiếu id, sai kind, trùng id', () => {
    const indicator = (props: Record<string, unknown>) => ({
      type: 'indicator',
      children: [{ text: '' }],
      ...props,
    });
    expect(
      validateSectionShape([
        indicator({ kind: 'part' }),
        indicator({ id: 'a', kind: 'khac' }),
        indicator({ id: 'b', kind: 'question', options: 'x' }),
        indicator({ id: 'c', kind: 'part' }),
        indicator({ id: 'c', kind: 'subpart' }),
      ]),
    ).toEqual([
      '3 indicator thiếu id hoặc sai định dạng.',
      '1 indicator bị trùng id.',
    ]);
  });

  it('section chưa có câu hỏi chỉ là cảnh báo', () => {
    const issues = validateSection([p('Chỉ có hướng dẫn')]);
    expect(issues).toEqual([
      expect.objectContaining({
        indicatorId: null,
        severity: 'warning',
        message: 'Section chưa có câu hỏi nào.',
      }),
    ]);
    expect(hasErrors(issues)).toBe(false);
  });
});

describe('media data: URI', () => {
  it('tìm và thay URL lồng trong children, không sửa đầu vào', () => {
    const value: ExamElement[] = [
      {
        type: 'img',
        url: 'data:image/png;base64,AAA',
        children: [{ text: '' }],
      },
      p([{ type: 'a', url: 'DATA:text/plain,x', children: [{ text: 'x' }] }]),
      { type: 'img', url: 'https://cdn/x.png', children: [{ text: '' }] },
    ];
    expect(collectDataUrls(value)).toEqual([
      'data:image/png;base64,AAA',
      'DATA:text/plain,x',
    ]);
    const replaced = replaceDataUrls(
      value,
      new Map([['DATA:text/plain,x', 'https://cdn/x.txt']]),
    );
    expect(collectDataUrls(replaced)).toEqual(['data:image/png;base64,AAA']);
    expect(collectDataUrls(value)).toHaveLength(2);
  });
});
