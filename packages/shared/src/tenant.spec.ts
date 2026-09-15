import { slugifyTenantName, validateTenantSlug } from './tenant';

describe('slugifyTenantName', () => {
  it('bỏ dấu tiếng Việt và thay ký tự khác chữ/số bằng gạch nối', () => {
    expect(slugifyTenantName('Trung tâm Ngoại ngữ Đông Á')).toBe(
      'trung-tam-ngoai-ngu-dong-a',
    );
    expect(slugifyTenantName('  --IELTS & TOEIC (Hà Nội)!  ')).toBe(
      'ielts-toeic-ha-noi',
    );
  });

  it('cắt theo độ dài tối đa, không để gạch nối ở cuối', () => {
    expect(slugifyTenantName('abc def ghi', 8)).toBe('abc-def');
  });

  it('trả chuỗi rỗng khi tên không có chữ Latin hay số', () => {
    expect(slugifyTenantName('日本語センター')).toBe('');
  });
});

describe('validateTenantSlug', () => {
  it('chấp nhận slug đúng quy tắc', () => {
    expect(validateTenantSlug('trung-tam-2')).toBeNull();
  });

  it.each([
    ['ab', 'length'],
    ['a'.repeat(41), 'length'],
    ['Trung-tam', 'format'],
    ['-abc', 'format'],
    ['abc-', 'format'],
    ['a--b', 'format'],
    ['trung_tam', 'format'],
    ['admin', 'reserved'],
  ])('%s → %s', (slug, error) => {
    expect(validateTenantSlug(slug)).toBe(error);
  });
});
