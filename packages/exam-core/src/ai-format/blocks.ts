import { blanksIn } from '../blank';
import { isIndicator } from '../indicator';
import { isOrderingItem, isTodo, type TListItem } from '../list';
import { plainText, type ExamElement } from '../node';
import { isPair, pairAnswer } from '../pair';
import { AI_FORMAT_MAX_BLOCKS, AI_FORMAT_MAX_CHARS } from './ops';
import { blockText } from './text-range';

// Section dưới dạng danh sách block có đánh số cho AI đọc. Chỉ số `[i]` là
// chỉ số block trong nội dung gốc – mọi thao tác AI trả về trỏ theo nó.

/** Block AI không được đổi loại, xoá hay sửa chữ (media giữ nguyên chỗ – plan 1.5). */
export const AI_LOCKED_TYPES: ReadonlySet<string> = new Set([
  'img',
  'audio',
  'video',
  'file',
  'media_embed',
  'hr',
]);

/** Block không đổi loại được (không phải một dòng chữ). */
export const AI_NON_LINE_TYPES: ReadonlySet<string> = new Set([
  ...AI_LOCKED_TYPES,
  'indicator',
  'table',
  'code_block',
]);

export interface AiBlock {
  index: number;
  /** Loại block: `p`, `h2`, `todo`, `pair`, `indicator`, `table`, `img`… */
  tag: string;
  /** Thông tin thêm: tham số indicator, đáp án có sẵn, blank có sẵn. */
  note: string;
  text: string;
}

function indicatorNote(block: ExamElement): string {
  if (!isIndicator(block)) return '';
  const parts: string[] = [`kind=${block.kind}`];
  if (block.qtype) parts.push(`qtype=${block.qtype}`);
  for (const key of ['seconds', 'maxChars', 'maxPicks'] as const) {
    if (block[key] !== undefined) parts.push(`${key}=${block[key]}`);
  }
  if (block.options?.length) {
    parts.push(`options=${JSON.stringify(block.options)}`);
  }
  return parts.join(' ');
}

function tagOf(block: ExamElement): string {
  if (isIndicator(block)) return 'indicator';
  if (isPair(block)) return 'pair';
  if (isTodo(block)) return 'todo';
  if (isOrderingItem(block)) return 'ordering';
  const style = (block as TListItem).listStyleType;
  if (style) return `list-${style}`;
  return block.type ?? 'p';
}

function noteOf(block: ExamElement): string {
  const notes: string[] = [];
  if (isIndicator(block)) notes.push(indicatorNote(block));
  if (isPair(block)) notes.push(`answer=${JSON.stringify(pairAnswer(block))}`);
  if (isTodo(block)) notes.push(block.checked ? 'checked' : 'unchecked');
  if (isOrderingItem(block) && block.num !== undefined) {
    notes.push(`num=${block.num}`);
  }
  const blanks = blanksIn([block]).map((b) => plainText(b));
  if (blanks.length) notes.push(`blanks=${JSON.stringify(blanks)}`);
  return notes.join(' ');
}

export function toAiBlocks(value: readonly ExamElement[]): AiBlock[] {
  return value.map((block, index) => ({
    index,
    tag: tagOf(block),
    note: noteOf(block),
    text:
      isIndicator(block) || AI_LOCKED_TYPES.has(block.type ?? '')
        ? ''
        : blockText(block),
  }));
}

/** Một dòng mỗi block: `[i] tag (note): "chữ"` – chữ để dạng chuỗi JSON cho AI chép nguyên văn. */
export function formatAiBlocks(blocks: readonly AiBlock[]): string {
  return blocks
    .map((b) => {
      const note = b.note ? ` (${b.note})` : '';
      return `[${b.index}] ${b.tag}${note}: ${JSON.stringify(b.text)}`;
    })
    .join('\n');
}

/** Lý do section quá lớn để gửi AI; `null` = gửi được. */
export function aiInputProblem(value: readonly ExamElement[]): string | null {
  if (value.length > AI_FORMAT_MAX_BLOCKS) {
    return `Section có ${value.length} block, vượt giới hạn ${AI_FORMAT_MAX_BLOCKS}. Hãy chia nhỏ section.`;
  }
  const chars = value.reduce((sum, block) => sum + plainText(block).length, 0);
  if (chars > AI_FORMAT_MAX_CHARS) {
    return `Section có ${chars} ký tự, vượt giới hạn ${AI_FORMAT_MAX_CHARS}. Hãy chia nhỏ section.`;
  }
  if (chars === 0) return 'Section chưa có chữ nào để định dạng.';
  return null;
}
