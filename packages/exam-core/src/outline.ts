import {
  indicatorColor,
  indicatorMeta,
  indicatorSuffix,
  isIndicator,
  questionTypeMeta,
  type IndicatorKind,
} from './indicator';
import { explanationsFromPlan } from './explanation';
import type { ExamElement } from './node';
import { buildPlan } from './plan';

// Mini map đi theo indicator (không theo heading/paragraph). Số thứ tự tính lúc
// đọc value chứ không lưu vào node — chèn/xoá giữa chừng là tự đánh số lại.

export interface OutlineItem {
  id: string;
  kind: IndicatorKind;
  /** Nhãn đầy đủ đã kèm số thứ tự, vd `Part 2`, `Subpart 2.1`, `Question 7`. */
  label: string;
  /** Dòng phụ: dạng câu hỏi và tham số đi kèm. */
  sub: string;
  /** 0 = part, 1 = subpart, 2 = question, 3 = explanation. */
  depth: number;
  color: string;
}

const DEPTH: Record<IndicatorKind, number> = {
  part: 0,
  subpart: 1,
  question: 2,
  explanation: 3,
};

/** Dòng phụ của giải thích: câu được gắn theo số hiển thị cho người làm bài. */
export function explanationTarget(numbers: readonly number[]): string {
  if (numbers.length === 0) return 'không gắn câu hỏi nào';
  const first = numbers[0];
  const last = numbers[numbers.length - 1];
  return first === last ? `câu ${first}` : `câu ${first}–${last}`;
}

export function buildOutline(value: readonly ExamElement[]): OutlineItem[] {
  const items: OutlineItem[] = [];
  const targets = new Map(
    explanationsFromPlan(buildPlan(value)).map((item) => [
      item.nodeId,
      explanationTarget(item.numbers),
    ]),
  );
  // `subpart` đánh số lại trong mỗi part; question chạy suốt section.
  let partNo = 0;
  let subpartNo = 0;
  let questionNo = 0;

  for (const el of value) {
    if (!isIndicator(el)) continue;
    const meta = indicatorMeta(el.kind);

    let label: string;
    if (el.kind === 'part') {
      partNo += 1;
      subpartNo = 0;
      label = `${meta.label} ${partNo}`;
    } else if (el.kind === 'subpart') {
      subpartNo += 1;
      label = partNo
        ? `${meta.label} ${partNo}.${subpartNo}`
        : `${meta.label} ${subpartNo}`;
    } else if (el.kind === 'explanation') {
      label = meta.label;
    } else {
      questionNo += 1;
      label = `${meta.label} ${questionNo}`;
    }

    const qt = questionTypeMeta(el.qtype);
    const suffix = indicatorSuffix(el);
    const sub =
      el.kind === 'explanation'
        ? (targets.get(el.id) ?? '')
        : el.kind !== 'question'
          ? ''
          : [qt?.label ?? 'chưa chọn dạng', suffix].filter(Boolean).join(' · ');

    items.push({
      id: el.id,
      kind: el.kind,
      label,
      sub,
      depth: DEPTH[el.kind] ?? 2,
      color: indicatorColor(el).color,
    });
  }

  return items;
}
