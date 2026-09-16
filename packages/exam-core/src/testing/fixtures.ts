import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isExamValue, type ExamValue } from '../node';

export type FixtureName = 'exam-editor-sample' | 'exam-draft-2';

/**
 * Đề mẫu chép từ lightc-general `docs/data`. Ảnh base64 trong exam-draft-2 đã
 * rút gọn thành một data URI ngắn (vẫn giữ để test chặn data URI).
 */
export function loadFixture(name: FixtureName): ExamValue {
  const value: unknown = JSON.parse(
    readFileSync(join(__dirname, '..', '__fixtures__', `${name}.json`), 'utf8'),
  );
  if (!isExamValue(value)) throw new Error(`Fixture ${name} sai định dạng`);
  return value;
}
