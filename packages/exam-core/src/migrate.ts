import type { QuestionType } from '@lang/shared';
import { createNodeId } from './id';
import { INDICATOR_KEY, type IndicatorKind } from './indicator';
import type { ExamValue } from './node';

// Bản nháp cũ dùng một danh sách `kind` phẳng trộn cả cấu trúc lẫn dạng câu
// hỏi. Chuyển một lần lúc đọc, không đụng tới dữ liệu đã lưu.

const LEGACY: Record<string, { kind: IndicatorKind; qtype?: QuestionType }> = {
  part: { kind: 'part' },
  subpart: { kind: 'subpart' },
  // `question` cũ dùng chung cho nhiều dạng nên để trống `qtype`: editor sẽ báo
  // "chưa chọn dạng" thay vì đoán bừa.
  question: { kind: 'question' },
  matching: { kind: 'question', qtype: 'matching' },
  'polytomous-scoring': { kind: 'question', qtype: 'polytomous' },
  speaking: { kind: 'question', qtype: 'speaking' },
  writing: { kind: 'question', qtype: 'writing' },
};

export function migrateExamValue(
  value: ExamValue,
  createId: () => string = createNodeId,
): ExamValue {
  let changed = false;

  const next = value.map((node) => {
    if (node.type !== INDICATOR_KEY) return node;

    const legacyKind = String(node.kind);
    const mapped = Object.hasOwn(LEGACY, legacyKind)
      ? LEGACY[legacyKind]
      : undefined;
    const kind = mapped?.kind ?? 'question';
    const qtype = mapped?.qtype ?? (node.qtype as QuestionType | undefined);
    const id = typeof node.id === 'string' && node.id ? node.id : createId();

    if (node.kind === kind && node.qtype === qtype && node.id === id) {
      return node;
    }

    changed = true;
    return { ...node, id, kind, ...(qtype ? { qtype } : {}) };
  });

  return changed ? next : value;
}
