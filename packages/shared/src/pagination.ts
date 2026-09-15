/** Kết quả API danh sách có phân trang (`?page=&pageSize=`). */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
