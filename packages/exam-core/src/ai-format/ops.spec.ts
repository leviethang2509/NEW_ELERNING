import { parseAiOps } from './ops';

describe('parseAiOps', () => {
  it('nhận object { ops } và bỏ trường null', () => {
    const parsed = parseAiOps({
      ops: [
        {
          op: 'indicator',
          before: 3,
          kind: 'question',
          qtype: 'pick-n',
          maxPicks: 2,
          seconds: null,
          options: null,
        },
        { op: 'blank', block: 4, match: '____', answer: ' fire ' },
      ],
    });
    expect(parsed.problems).toEqual([]);
    expect(parsed.ops).toEqual([
      {
        index: 0,
        op: {
          op: 'indicator',
          before: 3,
          kind: 'question',
          qtype: 'pick-n',
          maxPicks: 2,
        },
      },
      {
        index: 1,
        op: {
          op: 'blank',
          block: 4,
          match: '____',
          occurrence: 1,
          answer: 'fire',
        },
      },
    ]);
  });

  it('thao tác sai dạng bị bỏ kèm vị trí, thao tác đúng vẫn giữ', () => {
    const parsed = parseAiOps([
      { op: 'indicator', before: 0, kind: 'chapter' },
      { op: 'indicator', before: 0, kind: 'part', qtype: 'tfng' },
      { op: 'indicator', before: 0, kind: 'question', qtype: 'essay' },
      { op: 'choices', blocks: [1, 2], correct: [3] },
      { op: 'pairs', blocks: [1, 2], answers: ['True'] },
      { op: 'numbered', blocks: [1], nums: ['1'] },
      { op: 'removeBlocks', from: 5, to: 4 },
      { op: 'rewrite', block: 1 },
      { op: 'removeText', block: 1, match: 'Answer: B' },
    ]);
    expect(parsed.problems.map((p) => p.opIndex)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(parsed.ops).toEqual([
      {
        index: 8,
        op: { op: 'removeText', block: 1, match: 'Answer: B', occurrence: 1 },
      },
    ]);
  });

  it('thiếu đáp án: answers/correct/answer bỏ trống coi như chưa có đáp án', () => {
    const parsed = parseAiOps([
      { op: 'pairs', blocks: [1, 2], answers: null },
      { op: 'pairs', blocks: [1, 2], answers: [] },
      { op: 'choices', blocks: [1, 2], correct: null },
      { op: 'blank', block: 1, match: '....' },
      { op: 'blank', block: 1, match: '  ', answer: '' },
    ]);
    expect(parsed.problems.map((p) => p.opIndex)).toEqual([4]);
    expect(parsed.ops.map(({ op }) => op)).toEqual([
      { op: 'pairs', blocks: [1, 2], answers: ['', ''] },
      { op: 'pairs', blocks: [1, 2], answers: ['', ''] },
      { op: 'choices', blocks: [1, 2], correct: [] },
      { op: 'blank', block: 1, match: '....', occurrence: 1, answer: '' },
    ]);
  });

  it('split + chỉ số phần i.k', () => {
    const parsed = parseAiOps([
      { op: 'split', block: 3, at: ['B two', 'C three'] },
      { op: 'choices', blocks: [3, 3.1, 3.2], correct: [3.1] },
      { op: 'indicator', before: 3.1, kind: 'question', qtype: 'mc-single' },
      { op: 'split', block: 3.1, at: ['x'] },
      { op: 'split', block: 4, at: [] },
      { op: 'blank', block: 3.25, match: '...' },
    ]);
    expect(parsed.problems.map((p) => p.opIndex)).toEqual([3, 4, 5]);
    expect(parsed.ops[0].op).toEqual({
      op: 'split',
      block: 3,
      at: ['B two', 'C three'],
    });
  });

  it('không có danh sách ops', () => {
    expect(parseAiOps('xin chào').problems).toEqual([
      { opIndex: null, message: 'Không có danh sách `ops`.' },
    ]);
  });
});
