import { isIndicator } from './indicator';
import type { ExamElement } from './node';
import { buildPlan, range, type PreviewPlan } from './plan';

// Giải thích đáp án: indicator `explanation`, nội dung là các block từ sau nó
// tới indicator kế tiếp. Gắn với câu hỏi đứng ngay phía trên — đi ngược lên, bỏ
// qua các giải thích khác, gặp `question` thì gắn; gặp `part`/`subpart` hoặc hết
// section thì không gắn câu nào (R3).
//
// Nội dung giải thích là thông tin như đáp án: server lưu riêng ở
// `explanations` của section, content_public chỉ giữ indicator rỗng.

export interface SectionExplanation {
  /** Id của indicator giải thích. */
  nodeId: string;
  /** Mọi số câu của câu hỏi được gắn (theo `buildPlan`); rỗng = không gắn câu nào. */
  numbers: number[];
  blocks: ExamElement[];
}

export function isExplanation(node: unknown): boolean {
  return isIndicator(node) && node.kind === 'explanation';
}

export function explanationsFromPlan(plan: PreviewPlan): SectionExplanation[] {
  const out: SectionExplanation[] = [];
  for (const part of plan.parts) {
    // Câu hỏi ngay phía trên; part mới bắt đầu lại từ đầu.
    let numbers: number[] = [];
    for (const seg of part.items) {
      const kind = seg.indicator?.kind;
      if (seg.indicator && kind === 'explanation') {
        out.push({
          nodeId: seg.indicator.id,
          numbers: [...numbers],
          blocks: seg.blocks,
        });
        continue;
      }
      numbers = kind === 'question' ? range(seg.start, seg.count) : [];
    }
  }
  return out;
}

/** Giải thích của một section (`raw_data`), theo thứ tự xuất hiện. */
export function extractExplanations(
  value: readonly ExamElement[],
): SectionExplanation[] {
  return explanationsFromPlan(buildPlan(value));
}

/** Các giải thích gắn với câu số `number`. */
export function explanationsFor(
  explanations: readonly SectionExplanation[],
  number: number,
): SectionExplanation[] {
  return explanations.filter((item) => item.numbers.includes(number));
}
