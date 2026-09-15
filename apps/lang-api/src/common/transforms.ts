/** `@Transform` bỏ khoảng trắng hai đầu cho giá trị chuỗi. */
export const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
