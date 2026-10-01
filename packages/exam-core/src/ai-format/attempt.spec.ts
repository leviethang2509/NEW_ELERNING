import type { Issue } from '../validate';
import { describeAttemptForAi, needsRetry, pickBestAttempt } from './attempt';

const outcome = (
  name: string,
  structureErrorCount: number,
  problemCount = 0,
  applied = true,
) => ({ name, structureErrorCount, problemCount, applied });

describe('pickBestAttempt', () => {
  it('ít lỗi cấu trúc nhất, bằng nhau lấy lần sau', () => {
    expect(
      pickBestAttempt([outcome('1', 3), outcome('2', 1, 2), outcome('3', 1, 2)])
        ?.name,
    ).toBe('3');
    expect(
      pickBestAttempt([outcome('1', 1, 0), outcome('2', 1, 1)])?.name,
    ).toBe('1');
  });

  it('bỏ lần không áp được thao tác nào', () => {
    expect(pickBestAttempt([outcome('1', 0, 1, false)])).toBeNull();
    expect(
      pickBestAttempt([outcome('1', 0, 1, false), outcome('2', 4)])?.name,
    ).toBe('2');
  });
});

describe('needsRetry', () => {
  it('còn lỗi cấu trúc hoặc thao tác bị bỏ', () => {
    expect(needsRetry(outcome('', 0))).toBe(false);
    expect(needsRetry(outcome('', 1))).toBe(true);
    expect(needsRetry(outcome('', 0, 1))).toBe(true);
  });
});

describe('describeAttemptForAi', () => {
  const issue = (
    indicatorId: string | null,
    message: string,
    category: Issue['category'] = 'structure',
  ): Issue => ({
    key: message,
    indicatorId,
    message,
    severity: 'error',
    category,
  });

  it('gắn lỗi với thao tác/block gốc, bỏ lỗi thiếu đáp án', () => {
    expect(
      describeAttemptForAi(
        [
          issue('ai-1', 'Chưa có danh sách lựa chọn (danh sách checkbox).'),
          issue('old', 'Chưa chọn dạng câu hỏi.'),
          issue(null, '1 indicator bị trùng id.'),
          issue('ai-1', 'Chưa tick đáp án nào.', 'answer'),
        ],
        [{ opIndex: 4, message: 'Block [9] không tồn tại.' }],
        {
          'ai-1': { opIndex: 2, block: 7 },
          old: { opIndex: null, block: 0 },
        },
      ),
    ).toEqual([
      'Thao tác #4 bị bỏ: Block [9] không tồn tại.',
      'Câu hỏi của thao tác #2 (trước block [7]): Chưa có danh sách lựa chọn (danh sách checkbox).',
      'Indicator có sẵn ở block [0]: Chưa chọn dạng câu hỏi.',
      'Section: 1 indicator bị trùng id.',
    ]);
  });
});
