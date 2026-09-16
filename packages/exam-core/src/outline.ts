import {
  indicatorColor,
  indicatorMeta,
  indicatorSuffix,
  isIndicator,
  questionTypeMeta,
  type IndicatorKind,
} from './indicator';
import type { ExamElement } from './node';

// Mini map đi theo indicator (không theo heading/paragraph). Số thứ tự tính lúc
// đọc value chứ không lưu vào node — chèn/xoá giữa chừng là tự đánh số lại.

export interface OutlineItem {
  id: string;
  kind: IndicatorKind;
  /** Nhãn đầy đủ đã kèm số thứ tự, vd `Part 2`, `Subpart 2.1`, `Question 7`. */
  label: string;
  /** Dòng phụ: dạng câu hỏi và tham số đi kèm. */
  sub: string;
  /** 0 = part, 1 = subpart, 2 = question. */
  depth: number;
  color: string;
}

const DEPTH: Record<IndicatorKind, number> = {
  part: 0,
  subpart: 1,
  question: 2,
};

export function buildOutline(value: readonly ExamElement[]): OutlineItem[] {
  const items: OutlineItem[] = [];
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
    } else {
      questionNo += 1;
      label = `${meta.label} ${questionNo}`;
    }

    const qt = questionTypeMeta(el.qtype);
    const suffix = indicatorSuffix(el);
    const sub =
      el.kind !== 'question'
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
