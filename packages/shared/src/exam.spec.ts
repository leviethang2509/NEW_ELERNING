import { DURATION_OPTIONS_MINUTES, isValidDurationMinutes } from './exam';

describe('duration', () => {
  it('có 36 lựa chọn từ 5 đến 180 phút', () => {
    expect(DURATION_OPTIONS_MINUTES).toHaveLength(36);
    expect(DURATION_OPTIONS_MINUTES[0]).toBe(5);
    expect(DURATION_OPTIONS_MINUTES.at(-1)).toBe(180);
  });

  it.each([5, 45, 180])('chấp nhận %d phút', (value) => {
    expect(isValidDurationMinutes(value)).toBe(true);
  });

  it.each([0, 47, 185, 7.5, '45', null])('từ chối %p', (value) => {
    expect(isValidDurationMinutes(value)).toBe(false);
  });
});
