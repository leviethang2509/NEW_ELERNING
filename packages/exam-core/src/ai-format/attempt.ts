import { structureErrors, type Issue } from '../validate';
import type { AiIssueOrigin } from './apply';
import type { AiOpProblem } from './ops';

// Vòng thử của định dạng bằng AI (plan 1.10, 1.11): chấm từng lần thử, chọn
// lần tốt nhất và mô tả lỗi cho AI sửa ở lần sau.

export interface AiAttemptOutcome {
  /** Số lỗi cấu trúc còn lại sau khi áp thao tác. */
  structureErrorCount: number;
  /** Số thao tác bị bỏ (không áp được). */
  problemCount: number;
  /** Có áp được ít nhất một thao tác không. */
  applied: boolean;
}

/** Lần thử còn lỗi cấu trúc hoặc thao tác bị bỏ thì nên thử lại. */
export function needsRetry(outcome: AiAttemptOutcome): boolean {
  return outcome.structureErrorCount > 0 || outcome.problemCount > 0;
}

/**
 * Lần thử tốt nhất: ít lỗi cấu trúc nhất, rồi ít thao tác bị bỏ nhất; bằng nhau
 * lấy lần sau. Bỏ qua lần không áp được thao tác nào; không còn lần nào thì
 * `null` (giữ nguyên nội dung gốc).
 */
export function pickBestAttempt<T extends AiAttemptOutcome>(
  attempts: readonly T[],
): T | null {
  let best: T | null = null;
  for (const attempt of attempts) {
    if (!attempt.applied) continue;
    if (
      !best ||
      attempt.structureErrorCount < best.structureErrorCount ||
      (attempt.structureErrorCount === best.structureErrorCount &&
        attempt.problemCount <= best.problemCount)
    ) {
      best = attempt;
    }
  }
  return best;
}

/** Các dòng phản hồi cho AI: thao tác bị bỏ + lỗi cấu trúc kèm vị trí gốc. */
export function describeAttemptForAi(
  issues: readonly Issue[],
  problems: readonly AiOpProblem[],
  origins: Readonly<Record<string, AiIssueOrigin>>,
): string[] {
  const lines = problems.map((p) =>
    p.opIndex === null
      ? `Kết quả: ${p.message}`
      : `Thao tác #${p.opIndex} bị bỏ: ${p.message}`,
  );
  for (const issue of structureErrors(issues)) {
    const origin = issue.indicatorId ? origins[issue.indicatorId] : undefined;
    if (!origin) {
      lines.push(`Section: ${issue.message}`);
    } else if (origin.opIndex === null) {
      lines.push(
        `Indicator có sẵn ở block [${origin.block}]: ${issue.message}`,
      );
    } else {
      lines.push(
        `Câu hỏi của thao tác #${origin.opIndex} (trước block [${origin.block}]): ${issue.message}`,
      );
    }
  }
  return lines;
}
