import { randomUUID } from 'node:crypto';
import { FindOperator, type Repository } from 'typeorm';

type Where<T> = { [K in keyof T]?: unknown };

function matches<T>(row: T, where: Where<T>): boolean {
  return Object.entries(where).every(([key, expected]) => {
    const actual = (row as Record<string, unknown>)[key];
    if (expected instanceof FindOperator) {
      switch (expected.type) {
        case 'isNull':
          return actual === null || actual === undefined;
        case 'not':
          return !matches(row, { [key]: expected.value } as Where<T>);
        case 'lessThan':
          return (actual as number | Date) < (expected.value as number | Date);
        default:
          throw new Error(`FindOperator chưa hỗ trợ: ${expected.type}`);
      }
    }
    if (expected instanceof Date && actual instanceof Date) {
      return expected.getTime() === actual.getTime();
    }
    return actual === expected;
  });
}

/**
 * Repository giả trong bộ nhớ cho unit test service, chỉ hỗ trợ các hàm và
 * FindOperator (IsNull, Not, LessThan) đang dùng. Trả bản sao như khi đọc DB.
 */
export class InMemoryRepository<T extends { id: string }> {
  rows: T[] = [];

  constructor(private readonly defaults: () => Partial<T> = () => ({})) {}

  asRepository(): Repository<T> {
    return this as unknown as Repository<T>;
  }

  create(data: Partial<T>): T {
    return { ...this.defaults(), ...data } as T;
  }

  async save(entity: T): Promise<T> {
    entity.id ??= randomUUID();
    const index = this.rows.findIndex((row) => row.id === entity.id);
    if (index >= 0) this.rows[index] = { ...entity };
    else this.rows.push({ ...entity });
    return entity;
  }

  async findOneBy(where: Where<T>): Promise<T | null> {
    const row = this.rows.find((item) => matches(item, where));
    return row ? { ...row } : null;
  }

  async existsBy(where: Where<T>): Promise<boolean> {
    return this.rows.some((item) => matches(item, where));
  }

  async update(criteria: string | Where<T>, partial: Partial<T>) {
    const where = typeof criteria === 'string' ? { id: criteria } : criteria;
    const targets = this.rows.filter((row) => matches(row, where as Where<T>));
    targets.forEach((row) => Object.assign(row, partial));
    return { affected: targets.length, raw: [], generatedMaps: [] };
  }

  async delete(where: Where<T>) {
    const before = this.rows.length;
    this.rows = this.rows.filter((row) => !matches(row, where));
    return { affected: before - this.rows.length, raw: [] };
  }
}
