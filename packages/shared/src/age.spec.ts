import { ageOn, isAdultOn, todayInTimeZone } from './age';

describe('ageOn', () => {
  it('tăng tuổi đúng ngày sinh nhật', () => {
    expect(ageOn('2008-09-13', '2026-09-13')).toBe(18);
  });

  it('chưa tới sinh nhật thì chưa tăng tuổi', () => {
    expect(ageOn('2008-09-14', '2026-09-13')).toBe(17);
  });

  it('người sinh 29/02 tăng tuổi vào 01/03 ở năm không nhuận', () => {
    expect(ageOn('2008-02-29', '2026-02-28')).toBe(17);
    expect(ageOn('2008-02-29', '2026-03-01')).toBe(18);
  });

  it('từ chối ngày sai định dạng', () => {
    expect(() => ageOn('13/09/2008', '2026-09-13')).toThrow();
  });
});

describe('isAdultOn', () => {
  it('chỉ đủ 18 tuổi mới là người lớn', () => {
    expect(isAdultOn('2008-09-13', '2026-09-13')).toBe(true);
    expect(isAdultOn('2008-09-14', '2026-09-13')).toBe(false);
  });
});

describe('todayInTimeZone', () => {
  // 01:30 ngày 14/09 ở Việt Nam nhưng vẫn là 13/09 theo UTC.
  const instant = new Date('2026-09-13T18:30:00Z');

  it('lấy ngày theo múi giờ được chỉ định', () => {
    expect(todayInTimeZone('Asia/Ho_Chi_Minh', instant)).toBe('2026-09-14');
    expect(todayInTimeZone('UTC', instant)).toBe('2026-09-13');
  });
});
