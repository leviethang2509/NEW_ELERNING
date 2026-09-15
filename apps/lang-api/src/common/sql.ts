/** Escape `%`, `_`, `\` để tìm kiếm LIKE/ILIKE theo đúng chuỗi người dùng nhập. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

/** Biểu thức CHECK `"column" IN ('a', 'b')` từ object enum `as const`. */
export function sqlInList(
  column: string,
  values: Record<string, string>,
): string {
  return `"${column}" IN (${Object.values(values)
    .map((value) => `'${value}'`)
    .join(', ')})`;
}
