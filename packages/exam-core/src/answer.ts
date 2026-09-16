import { plainText } from './node';

// Chuẩn hoá đáp án dạng chữ, dùng chung cho lúc tách đáp án và lúc chấm.

/**
 * Bỏ khoảng trắng hai đầu, gộp khoảng trắng, không phân biệt hoa thường.
 * Dùng `toLowerCase` (không theo locale) để client và server luôn cho cùng kết quả.
 */
export function normalizeAnswer(text: string): string {
  return text.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Các đáp án chấp nhận của một blank, ngăn bằng `|`, đã chuẩn hoá. */
export function acceptedAnswers(blank: unknown): string[] {
  return plainText(blank).split('|').map(normalizeAnswer).filter(Boolean);
}

/** Vị trí dòng có trọng số cao nhất (dòng đầu nếu bằng nhau); -1 khi chưa dòng nào có số. */
export function bestWeightIndex(weights: readonly (number | null)[]): number {
  let best = -1;
  let bestWeight = -Infinity;
  weights.forEach((weight, i) => {
    if (typeof weight === 'number' && weight > bestWeight) {
      best = i;
      bestWeight = weight;
    }
  });
  return best;
}
