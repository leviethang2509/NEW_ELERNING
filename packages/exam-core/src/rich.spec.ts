import { blockDepth, toggleEnd } from './rich';
import { p, question, todo } from './testing/builders';

describe('khối gập/mở', () => {
  const toggle = (indent = 0) =>
    p('Tiêu đề', { type: 'toggle', ...(indent ? { indent } : {}) });

  it('danh sách mức ngoài cùng có độ sâu 0', () => {
    expect(blockDepth(todo('A'))).toBe(0);
    expect(blockDepth(p('x', { indent: 2 }))).toBe(2);
    expect(blockDepth(p('x', { listStyleType: 'disc', indent: 2 }))).toBe(1);
  });

  it('nội dung là các block thụt sâu hơn, dừng ở indicator và điều kiện riêng', () => {
    const blocks = [
      toggle(),
      p('trong', { indent: 1 }),
      p('danh sách trong', { listStyleType: 'disc', indent: 2 }),
      p('ngoài'),
    ];
    expect(toggleEnd(blocks, 0)).toBe(3);
    expect(toggleEnd([toggle(), todo('A')], 0)).toBe(1);
    expect(
      toggleEnd([toggle(), p('x', { indent: 1 }), question('q', 'writing')], 0),
    ).toBe(2);
    expect(
      toggleEnd(
        [toggle(), p('x', { indent: 1 }), p('y', { indent: 1 })],
        0,
        (node) =>
          (node as { children: { text: string }[] }).children[0].text === 'y',
      ),
    ).toBe(2);
    expect(toggleEnd([toggle(1), p('x', { indent: 1 })], 0)).toBe(1);
  });
});
