// Kiểu tối thiểu của tài liệu Plate mà exam-core cần. Không phụ thuộc platejs
// để lang-api dùng được; `Value` của Plate gán được sang `ExamValue`.

export interface ExamText {
  text: string;
  [key: string]: unknown;
}

export interface ExamElement {
  type?: string;
  children: ExamNode[];
  [key: string]: unknown;
}

export type ExamNode = ExamElement | ExamText;

/** Nội dung một section: mảng block phẳng như Plate lưu. */
export type ExamValue = ExamElement[];

/** Độ sâu lồng tối đa chấp nhận khi kiểm dữ liệu từ client (bảng chỉ vài mức). */
export const MAX_NODE_DEPTH = 32;

export function isText(node: unknown): node is ExamText {
  return (
    typeof (node as Partial<ExamText> | null | undefined)?.text === 'string'
  );
}

export function childrenOf(node: unknown): readonly unknown[] {
  const children = (node as { children?: unknown } | null | undefined)
    ?.children;
  return Array.isArray(children) ? children : [];
}

export function plainText(node: unknown): string {
  if (isText(node)) return node.text;
  return childrenOf(node).map(plainText).join('');
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isElementShape(node: Record<string, unknown>, depth: number): boolean {
  if (node.type !== undefined && typeof node.type !== 'string') return false;
  return (
    Array.isArray(node.children) &&
    node.children.every((child) => isNodeShape(child, depth + 1))
  );
}

function isNodeShape(node: unknown, depth: number): boolean {
  if (!isRecord(node) || depth > MAX_NODE_DEPTH) return false;
  if ('text' in node) {
    return typeof node.text === 'string' && !('children' in node);
  }
  return isElementShape(node, depth);
}

/** Dữ liệu nhận từ client/DB có đúng dạng tài liệu Plate không. */
export function isExamValue(value: unknown): value is ExamValue {
  return (
    Array.isArray(value) &&
    value.every(
      (node) => isRecord(node) && !('text' in node) && isElementShape(node, 1),
    )
  );
}
