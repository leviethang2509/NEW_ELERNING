import { CATALOG_CODE_PATTERN, normalizeCatalogCode } from './catalog';

describe('mã danh mục/loại đề', () => {
  it('chuẩn hoá về in hoa, bỏ khoảng trắng hai đầu', () => {
    expect(normalizeCatalogCode('  jlpt_n2 ')).toBe('JLPT_N2');
  });

  it.each(['EN', 'JLPT_N2', 'READING', 'PART-1', 'N2'])(
    'chấp nhận %s',
    (code) => {
      expect(CATALOG_CODE_PATTERN.test(code)).toBe(true);
    },
  );

  it.each(['en', 'JLPT N2', '_EN', 'EN_', 'A--B', 'TIẾNG', ''])(
    'từ chối %p',
    (code) => {
      expect(CATALOG_CODE_PATTERN.test(code)).toBe(false);
    },
  );
});
