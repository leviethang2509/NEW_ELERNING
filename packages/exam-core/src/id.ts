// Id cho node Plate (indicator, cặp ghép), cùng bảng chữ cái với nanoid.
// Không dùng `crypto.randomUUID`: trình duyệt chỉ có hàm này trong secure
// context, mà bản trên VPS đang chạy HTTP.

const ALPHABET =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

export function createNodeId(size = 21): string {
  const bytes = new Uint8Array(size);
  globalThis.crypto.getRandomValues(bytes);
  let id = '';
  for (const byte of bytes) id += ALPHABET[byte & 63];
  return id;
}
