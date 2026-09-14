// Tính tuổi trên chuỗi ngày `YYYY-MM-DD` để không lệch múi giờ giữa client
// và server. "Hôm nay" lấy theo timezone của user qua `todayInTimeZone`.

/** Chỉ người đủ tuổi này mới được đăng ký tenant. */
export const ADULT_AGE = 18;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseIsoDate(value: string): [number, number, number] {
  const match = ISO_DATE.exec(value);
  if (!match) {
    throw new Error(`Ngày không hợp lệ (cần YYYY-MM-DD): ${value}`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Ngày hiện tại dạng `YYYY-MM-DD` theo timezone IANA (vd. `Asia/Ho_Chi_Minh`). */
export function todayInTimeZone(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * Số tuổi tròn tại ngày `onDate`. Người sinh ngày 29/02 được tính thêm tuổi
 * vào 01/03 ở năm không nhuận.
 */
export function ageOn(dateOfBirth: string, onDate: string): number {
  const [birthYear, birthMonth, birthDay] = parseIsoDate(dateOfBirth);
  const [year, month, day] = parseIsoDate(onDate);
  const hadBirthday =
    month > birthMonth || (month === birthMonth && day >= birthDay);
  return year - birthYear - (hadBirthday ? 0 : 1);
}

export function isAdultOn(dateOfBirth: string, onDate: string): boolean {
  return ageOn(dateOfBirth, onDate) >= ADULT_AGE;
}
