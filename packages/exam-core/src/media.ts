import { childrenOf, type ExamElement, type ExamNode } from './node';

// Media nhúng dạng `data:` URI — thường lọt vào khi dán HTML có ảnh. Server từ
// chối lưu content còn base64, nên trước khi lưu editor phải upload lên R2 rồi
// thay URL (phần upload ở lang-app).

export const isDataUrl = (url: unknown): url is string =>
  typeof url === 'string' && /^\s*data:/i.test(url);

export function collectDataUrls(nodes: readonly unknown[]): string[] {
  const found = new Set<string>();
  const walk = (list: readonly unknown[]) => {
    for (const node of list) {
      const url = (node as { url?: unknown } | null | undefined)?.url;
      if (isDataUrl(url)) found.add(url);
      walk(childrenOf(node));
    }
  };
  walk(nodes);
  return [...found];
}

/** Bản sao của `value` với URL đã thay — dùng khi không có editor. */
export function replaceDataUrls(
  value: readonly ExamElement[],
  uploaded: ReadonlyMap<string, string>,
): ExamElement[] {
  const map = <T extends ExamNode>(node: T): T => {
    const next: Record<string, unknown> = { ...node };
    const url = uploaded.get(node.url as string);
    if (isDataUrl(node.url) && url !== undefined) next.url = url;
    if (Array.isArray(node.children)) {
      next.children = (node.children as ExamNode[]).map(map);
    }
    return next as T;
  };
  return value.map(map);
}
