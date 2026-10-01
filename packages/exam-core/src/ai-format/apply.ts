import { blanksIn } from '../blank';
import { createNodeId } from '../id';
import { createIndicator, isIndicator } from '../indicator';
import { ORDERING_STYLE, TODO_STYLE, isTodo } from '../list';
import type { ExamElement } from '../node';
import {
  PAIR_KEY,
  TFNG_OPTIONS,
  YNNG_OPTIONS,
  isPair,
  pairOptions,
  type TPairElement,
} from '../pair';
import { questionScopes } from '../scope';
import { AI_LOCKED_TYPES, AI_NON_LINE_TYPES } from './blocks';
import {
  blockRefParts,
  type AiBlockRef,
  type AiFormatOp,
  type AiOpProblem,
  type AiSplitOp,
  type ParsedAiOps,
} from './ops';
import {
  applyTextEdits,
  isPrintedGap,
  rangeText,
  rangesOverlap,
  resolveSplitOffsets,
  resolveTextRange,
  splitBlock,
  type TextEdit,
  type TextRange,
} from './text-range';

// Áp danh sách thao tác của AI lên nội dung gốc của section. Mọi chỉ số tính
// trên nội dung gốc; thao tác sai (chỉ số ngoài phạm vi, chữ không khớp, đụng
// block thao tác khác đã dùng, đụng media) bị bỏ cả thao tác kèm lý do để gửi
// lại cho AI ở lần thử sau. Chữ gốc chỉ thay đổi ở đúng các đoạn bị xoá hoặc
// biến thành blank (req-5 plan, giả định 3); `split` chỉ ngắt dòng, nối các
// phần lại vẫn đúng chữ gốc.

/** Indicator trong kết quả đến từ đâu – để mô tả lỗi validate cho AI. */
export interface AiIssueOrigin {
  /** Thao tác chèn indicator; `null` = indicator có sẵn trong nội dung gốc. */
  opIndex: number | null;
  /** Block gốc (`AiBlockRef`, vd. `12.1`): indicator chèn trước block này / vị trí indicator có sẵn. */
  block: AiBlockRef;
}

export interface AppliedAiOps {
  value: ExamElement[];
  problems: AiOpProblem[];
  /** Id indicator → nguồn gốc. */
  origins: Record<string, AiIssueOrigin>;
}

export interface ApplyAiOpsOptions {
  createId?: () => string;
}

type LineTransform = (block: ExamElement) => ExamElement;

interface BlockPlan {
  before: ExamElement[];
  /** Thao tác đã nhận block này (đổi loại / xoá / sửa chữ). */
  owner: number | null;
  transform: LineTransform | null;
  removed: boolean;
  edits: { range: TextRange; edit: TextEdit; op: number }[];
}

/** Thuộc tính list / đáp án cũ phải bỏ trước khi đổi loại dòng. */
const LINE_PROPS = [
  'listStyleType',
  'listStart',
  'indent',
  'checked',
  'num',
  'key',
  'answer',
];

function asLine(block: ExamElement): ExamElement {
  const next: ExamElement = { ...block, type: 'p' };
  for (const prop of LINE_PROPS) delete next[prop];
  // Cặp ghép đổi sang dòng thường thì bỏ id của cặp.
  if (isPair(block)) delete next.id;
  return next;
}

const toTodo =
  (checked: boolean): LineTransform =>
  (block) => ({
    ...asLine(block),
    listStyleType: TODO_STYLE,
    indent: 1,
    checked,
  });

const toOrdering =
  (num: number | null): LineTransform =>
  (block) => ({
    ...asLine(block),
    listStyleType: ORDERING_STYLE,
    ...(num === null ? {} : { num }),
  });

// Block đã là cặp ghép / lựa chọn mà AI để trống đáp án (chạy lại trên section
// đã định dạng) thì giữ đáp án cũ.
const toPair =
  (id: string, answer: string): LineTransform =>
  (block): TPairElement =>
    isPair(block) && !answer.trim()
      ? block
      : {
          type: PAIR_KEY,
          id,
          answer: answer.trim(),
          children: block.children,
        };

// Đáp án TFNG/YNNG AI hay viết tắt hoặc viết hoa.
const ANSWER_ALIASES: Record<string, string> = {
  true: 'True',
  t: 'True',
  false: 'False',
  f: 'False',
  'not given': 'Not Given',
  notgiven: 'Not Given',
  ng: 'Not Given',
  yes: 'Yes',
  y: 'Yes',
  no: 'No',
  n: 'No',
};

const squash = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase();

/** Đưa đáp án cặp ghép do AI tạo về đúng chữ của option (hoa/thường, viết tắt). */
function canonicalizePairs(
  value: ExamElement[],
  createdPairs: ReadonlySet<string>,
) {
  for (const scope of questionScopes(value)) {
    const options = pairOptions(scope.indicator);
    if (!options) continue;
    const fixed = options === TFNG_OPTIONS || options === YNNG_OPTIONS;
    for (let i = scope.from; i < scope.to; i += 1) {
      const node = value[i];
      if (!isPair(node) || !createdPairs.has(node.id)) continue;
      const answer = squash(node.answer ?? '');
      if (!answer) continue;
      const alias = fixed ? ANSWER_ALIASES[answer] : undefined;
      const match =
        options.find((option) => squash(option) === answer) ??
        (alias && options.includes(alias) ? alias : undefined);
      if (match) value[i] = { ...node, answer: match };
    }
  }
}

/** Thao tác (trừ `split`) đã đổi chỉ số sang danh sách block sau khi tách. */
type ResolvedOp = Exclude<AiFormatOp, AiSplitOp>;

const formatRef = (ref: AiBlockRef) =>
  Number.isInteger(ref) ? String(ref) : ref.toFixed(1);

/**
 * Áp `split` trước (mọi thao tác khác trỏ vào các phần qua `i.k`), rồi áp các
 * thao tác còn lại trên danh sách block đã tách.
 */
export function applyAiOps(
  value: readonly ExamElement[],
  parsed: Pick<ParsedAiOps, 'ops'>,
  options: ApplyAiOpsOptions = {},
): AppliedAiOps {
  const n = value.length;
  const problems: AiOpProblem[] = [];
  const pieces = new Map<number, ExamElement[]>();
  for (const { index, op } of parsed.ops) {
    if (op.op !== 'split') continue;
    const problem = splitProblem(value, pieces, op);
    if (problem) {
      problems.push({ opIndex: index, message: problem });
      continue;
    }
    const offsets = resolveSplitOffsets(value[op.block], op.at);
    if (typeof offsets === 'string') {
      problems.push({ opIndex: index, message: offsets });
      continue;
    }
    pieces.set(op.block, splitBlock(value[op.block], offsets));
  }

  const expanded: ExamElement[] = [];
  const labels: AiBlockRef[] = [];
  const starts: number[] = [];
  value.forEach((block, i) => {
    starts.push(expanded.length);
    (pieces.get(i) ?? [block]).forEach((piece, k) => {
      expanded.push(piece);
      labels.push(i + k / 10);
    });
  });
  starts.push(expanded.length);
  labels.push(n);

  /** `i.k` → vị trí trong danh sách đã tách; chuỗi = lỗi. */
  const resolve = (ref: AiBlockRef): number | string => {
    const { block, piece } = blockRefParts(ref);
    if (block > n || (block === n && piece > 0)) {
      return `Block [${formatRef(ref)}] không tồn tại.`;
    }
    if (block === n) return expanded.length;
    const count = pieces.get(block)?.length ?? 1;
    if (piece >= count) {
      return count === 1
        ? `Block [${formatRef(ref)}] không tồn tại: block [${block}] chưa được tách bằng split.`
        : `Block [${formatRef(ref)}] không tồn tại: block [${block}] chỉ được tách thành ${count} phần.`;
    }
    return starts[block] + piece;
  };

  const resolved: { index: number; op: ResolvedOp }[] = [];
  for (const { index, op } of parsed.ops) {
    if (op.op === 'split') continue;
    const mapped = resolveOp(op, resolve);
    if (typeof mapped === 'string') {
      problems.push({ opIndex: index, message: mapped });
    } else {
      resolved.push({ index, op: mapped });
    }
  }

  const applied = applyResolved(expanded, resolved, (i) => labels[i], options);
  applied.problems = [...problems, ...applied.problems].sort(
    (a, b) => (a.opIndex ?? -1) - (b.opIndex ?? -1),
  );
  return applied;
}

function splitProblem(
  value: readonly ExamElement[],
  pieces: ReadonlyMap<number, ExamElement[]>,
  op: AiSplitOp,
): string | null {
  const i = op.block;
  if (i >= value.length) return `Block [${i}] không tồn tại.`;
  if (pieces.has(i)) return `Block [${i}] đã được tách bởi thao tác khác.`;
  const type = value[i].type ?? 'p';
  if (AI_NON_LINE_TYPES.has(type) || isPair(value[i])) {
    return `Block [${i}] (${isPair(value[i]) ? 'pair' : type}) không tách được.`;
  }
  return null;
}

/** Đổi mọi chỉ số `AiBlockRef` của thao tác sang vị trí trong danh sách đã tách. */
function resolveOp(
  op: ResolvedOp,
  resolve: (ref: AiBlockRef) => number | string,
): ResolvedOp | string {
  const list = (refs: readonly AiBlockRef[]) => {
    const out: number[] = [];
    for (const ref of refs) {
      const i = resolve(ref);
      if (typeof i === 'string') return i;
      out.push(i);
    }
    return out;
  };
  switch (op.op) {
    case 'indicator': {
      const before = resolve(op.before);
      return typeof before === 'string' ? before : { ...op, before };
    }
    case 'choices': {
      const blocks = list(op.blocks);
      if (typeof blocks === 'string') return blocks;
      const correct = list(op.correct);
      return typeof correct === 'string' ? correct : { ...op, blocks, correct };
    }
    case 'pairs':
    case 'numbered': {
      const blocks = list(op.blocks);
      return typeof blocks === 'string' ? blocks : { ...op, blocks };
    }
    case 'blank':
    case 'removeText': {
      const block = resolve(op.block);
      return typeof block === 'string' ? block : { ...op, block };
    }
    case 'removeBlocks': {
      const from = resolve(op.from);
      if (typeof from === 'string') return from;
      const to = resolve(op.to);
      return typeof to === 'string' ? to : { ...op, from, to };
    }
  }
}

function applyResolved(
  value: readonly ExamElement[],
  ops: readonly { index: number; op: ResolvedOp }[],
  labelOf: (i: number) => AiBlockRef,
  { createId = createNodeId }: ApplyAiOpsOptions,
): AppliedAiOps {
  const n = value.length;
  const label = (i: number) => formatRef(labelOf(i));
  const plans: BlockPlan[] = Array.from({ length: n + 1 }, () => ({
    before: [],
    owner: null,
    transform: null,
    removed: false,
    edits: [],
  }));
  const problems: AiOpProblem[] = [];
  const origins: Record<string, AiIssueOrigin> = {};
  const createdPairs = new Set<string>();

  value.forEach((block, i) => {
    if (isIndicator(block)) {
      origins[block.id] = { opIndex: null, block: labelOf(i) };
    }
  });

  const typeAt = (i: number) => value[i].type ?? 'p';
  const inRange = (i: number) => i < n;

  /** Lý do block không nhận được thao tác `op`; `null` = nhận được. */
  const claimProblem = (i: number, op: number, line: boolean) => {
    if (!inRange(i)) return `Block [${label(i)}] không tồn tại.`;
    const plan = plans[i];
    if (plan.removed) return `Block [${label(i)}] đã bị xoá bởi thao tác khác.`;
    if (plan.owner !== null && plan.owner !== op) {
      return `Block [${label(i)}] đã được thao tác #${plan.owner} dùng.`;
    }
    if (line && AI_NON_LINE_TYPES.has(typeAt(i))) {
      return `Block [${label(i)}] (${typeAt(i)}) không đổi loại được.`;
    }
    if (!line && AI_LOCKED_TYPES.has(typeAt(i))) {
      return `Block [${label(i)}] (${typeAt(i)}) là media, phải giữ nguyên.`;
    }
    return null;
  };

  const lineOp = (
    opIndex: number,
    blocks: readonly number[],
    transformAt: (k: number) => LineTransform,
  ) => {
    if (new Set(blocks).size !== blocks.length) {
      return 'Có block lặp lại trong `blocks`.';
    }
    // Sửa chữ (blank/removeText) trên cùng block vẫn được: đổi loại áp sau.
    for (const i of blocks) {
      const problem = claimProblem(i, opIndex, true);
      if (problem) return problem;
    }
    blocks.forEach((i, k) => {
      plans[i].owner = opIndex;
      plans[i].transform = transformAt(k);
    });
    return null;
  };

  const run = (opIndex: number, op: ResolvedOp): string | null => {
    switch (op.op) {
      case 'indicator': {
        if (op.before > n) return `Block [${label(op.before)}] không tồn tại.`;
        const id = createId();
        const { op: _op, before, kind, ...props } = op;
        plans[before].before.push(createIndicator(kind, props, id));
        origins[id] = { opIndex, block: labelOf(before) };
        return null;
      }
      case 'choices': {
        const correct = new Set(op.correct);
        return lineOp(opIndex, op.blocks, (k) => {
          const block = value[op.blocks[k]];
          return !correct.size && isTodo(block)
            ? (line) => line
            : toTodo(correct.has(op.blocks[k]));
        });
      }
      case 'pairs':
        return lineOp(opIndex, op.blocks, (k) => {
          const id = createId();
          createdPairs.add(id);
          return toPair(id, op.answers[k]);
        });
      case 'numbered':
        return lineOp(opIndex, op.blocks, (k) => toOrdering(op.nums[k]));
      case 'blank':
      case 'removeText': {
        const i = op.block;
        if (!inRange(i)) return `Block [${label(i)}] không tồn tại.`;
        if (plans[i].removed)
          return `Block [${label(i)}] đã bị xoá bởi thao tác khác.`;
        if (AI_NON_LINE_TYPES.has(typeAt(i)) && typeAt(i) !== 'table') {
          return `Block [${label(i)}] (${typeAt(i)}) không sửa chữ được.`;
        }
        const range = resolveTextRange(
          value[i],
          op.match,
          op.occurrence,
          op.op === 'blank',
        );
        if (typeof range === 'string') return range;
        // Chạy lại trên section đã định dạng: AI không thấy blank có sẵn nên
        // hay biến chữ bên cạnh thành blank – chỉ cho thêm blank ở ô in sẵn.
        if (
          op.op === 'blank' &&
          blanksIn([value[i]]).length &&
          !isPrintedGap(rangeText(value[i], range))
        ) {
          return `Block [${label(i)}] đã có blank: chỉ thêm blank ở ô trống in sẵn (chấm/gạch dưới), không biến chữ thành blank.`;
        }
        const clash = plans[i].edits.find((e) => rangesOverlap(e.range, range));
        if (clash) {
          return `"${op.match}" chồng lên đoạn thao tác #${clash.op} đã sửa.`;
        }
        const edit: TextEdit =
          op.op === 'blank'
            ? { kind: 'blank', answer: op.answer }
            : { kind: 'remove' };
        plans[i].edits.push({ range, edit, op: opIndex });
        return null;
      }
      case 'removeBlocks': {
        if (op.to >= n) return `Block [${label(op.to)}] không tồn tại.`;
        for (let i = op.from; i <= op.to; i += 1) {
          const problem = claimProblem(i, opIndex, false);
          if (problem) return problem;
          if (plans[i].edits.length) {
            return `Block [${label(i)}] đang được thao tác #${plans[i].edits[0].op} sửa chữ.`;
          }
        }
        for (let i = op.from; i <= op.to; i += 1) {
          plans[i].owner = opIndex;
          plans[i].removed = true;
        }
        return null;
      }
    }
  };

  for (const { index, op } of ops) {
    const problem = run(index, op);
    if (problem) problems.push({ opIndex: index, message: problem });
  }

  const out: ExamElement[] = [];
  for (let i = 0; i <= n; i += 1) {
    const plan = plans[i];
    out.push(...plan.before);
    if (i === n || plan.removed) continue;
    let block = value[i];
    if (plan.edits.length) block = applyTextEdits(block, plan.edits);
    if (plan.transform) block = plan.transform(block);
    out.push(block);
  }
  canonicalizePairs(out, createdPairs);

  return { value: out, problems, origins };
}
