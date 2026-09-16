import { createNodeId } from './id';
import { migrateExamValue } from './migrate';
import { p, part, question } from './testing/builders';

describe('migrateExamValue', () => {
  it('đổi kind đời cũ sang kind + qtype, cấp id còn thiếu', () => {
    const migrated = migrateExamValue(
      [
        {
          type: 'indicator',
          id: 'a',
          kind: 'polytomous-scoring',
          children: [{ text: '' }],
        },
        { type: 'indicator', kind: 'question', children: [{ text: '' }] },
        {
          type: 'indicator',
          id: 'c',
          kind: 'toString',
          children: [{ text: '' }],
        },
      ],
      () => 'new-id',
    );
    expect(migrated).toEqual([
      {
        type: 'indicator',
        id: 'a',
        kind: 'question',
        qtype: 'polytomous',
        children: [{ text: '' }],
      },
      {
        type: 'indicator',
        id: 'new-id',
        kind: 'question',
        children: [{ text: '' }],
      },
      {
        type: 'indicator',
        id: 'c',
        kind: 'question',
        children: [{ text: '' }],
      },
    ]);
  });

  it('không có gì cần đổi thì trả về đúng mảng cũ', () => {
    const value = [part('p1'), p('x'), question('q', 'writing')];
    expect(migrateExamValue(value)).toBe(value);
  });
});

describe('createNodeId', () => {
  it('21 ký tự an toàn cho URL, không trùng', () => {
    const ids = Array.from({ length: 1000 }, () => createNodeId());
    expect(ids.every((id) => /^[A-Za-z0-9_-]{21}$/.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
