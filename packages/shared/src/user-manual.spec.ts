import {
  manualHeadingId,
  parseManualInline,
  validateUserManual,
  type UserManual,
} from './user-manual';

const manual = (): UserManual => ({
  title: 'Tài liệu',
  updatedAt: '2026-09-17',
  groups: [
    {
      id: 'gioi-thieu',
      title: 'Giới thiệu',
      pages: [
        {
          id: 'tong-quan',
          title: 'Tổng quan',
          summary: 'Tóm tắt',
          roles: [],
          blocks: [
            { type: 'heading', level: 2, text: 'Đăng nhập **lần đầu**' },
            {
              type: 'paragraph',
              text: 'Xem [vai trò](page:vai-tro#chu-so-huu).',
            },
          ],
        },
        {
          id: 'vai-tro',
          title: 'Vai trò',
          summary: 'Tóm tắt',
          roles: ['TENANT_OWNER'],
          blocks: [{ type: 'heading', level: 2, text: 'Chủ sở hữu' }],
        },
      ],
    },
  ],
});

describe('parseManualInline', () => {
  it('tách chữ đậm, mã và liên kết trang', () => {
    expect(
      parseManualInline(
        'Bấm **Lưu** rồi mở `/admin` hoặc [xem](page:a-b#c-d).',
      ),
    ).toEqual([
      { kind: 'text', text: 'Bấm ' },
      { kind: 'strong', text: 'Lưu' },
      { kind: 'text', text: ' rồi mở ' },
      { kind: 'code', text: '/admin' },
      { kind: 'text', text: ' hoặc ' },
      { kind: 'link', text: 'xem', pageId: 'a-b', anchor: 'c-d' },
      { kind: 'text', text: '.' },
    ]);
  });
});

describe('manualHeadingId', () => {
  it('bỏ định dạng và dấu tiếng Việt', () => {
    expect(manualHeadingId('Đăng nhập **lần đầu**')).toBe('dang-nhap-lan-dau');
  });
});

describe('validateUserManual', () => {
  it('tài liệu hợp lệ không có lỗi', () => {
    expect(validateUserManual(manual())).toEqual([]);
  });

  it('báo liên kết gãy, id trùng, block sai và role lạ', () => {
    const data = manual();
    const [first, second] = data.groups[0].pages;
    first.blocks.push({ type: 'paragraph', text: '[x](page:khong-co)' });
    first.blocks.push({
      type: 'paragraph',
      text: '[x](page:vai-tro#khong-co)',
    });
    first.blocks.push({ type: 'heading', level: 3, text: 'Đăng nhập lần đầu' });
    second.id = 'tong-quan';
    (second.roles as string[]).push('ADMIN');
    (second.blocks as unknown[]).push({
      type: 'table',
      columns: ['A', 'B'],
      rows: [['1']],
    });

    const errors = validateUserManual(data);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('liên kết tới trang không có "khong-co"'),
        expect.stringContaining('trùng hoặc rỗng id'),
        expect.stringContaining('id bị trùng'),
        expect.stringContaining('roles không hợp lệ'),
        expect.stringContaining('table cần rows đủ 2 cột'),
      ]),
    );
  });
});
