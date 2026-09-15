import { DEFAULT_TIMEZONE } from '@lang/shared';

/** Ngày từ chuỗi ISO, theo giờ Việt Nam (vd. 15/09/2026). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', {
    timeZone: DEFAULT_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Ngày giờ từ chuỗi ISO, theo giờ Việt Nam (vd. 22:05 15/09/2026). */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    timeZone: DEFAULT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Giá lưu dạng chuỗi `numeric`; `null` là chưa đặt giá. */
export function formatPrice(price: string | null): string {
  return price === null ? '—' : `${Number(price).toLocaleString('vi-VN')} ₫`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('vi-VN');
}
