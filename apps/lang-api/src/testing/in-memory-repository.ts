import { randomUUID } from 'node:crypto';
import { FindOperator, type Repository } from 'typeorm';

type Where<T> = { [K in keyof T]?: unknown };

function likeToRegExp(pattern: string): RegExp {
  const source = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/%/g, '.*')
    .replace(/_/g, '.');
  return new RegExp(`^${source}$`);
}

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
        case 'in':
          return (expected.value as unknown[]).includes(actual);
        case 'like':
          return likeToRegExp(expected.value as string).test(String(actual));
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
 * FindOperator (IsNull, Not, LessThan, In, Like) đang dùng. Bỏ qua `relations`,
 * `order`, `lock`, không tự loại bản ghi đã xoá mềm. Trả bản sao như khi đọc DB.
 */
export class InMemoryRepository<T extends object> {
  rows: T[] = [];

  constructor(
    private readonly defaults: () => Partial<T> = () => ({}),
    /** Khoá chính; mặc định `id` và tự sinh uuid khi lưu. */
    private readonly primaryKeys: readonly (keyof T)[] = ['id' as keyof T],
  ) {}

  asRepository(): Repository<T> {
    return this as unknown as Repository<T>;
  }

  create(data: Partial<T>): T {
    return { ...this.defaults(), ...data } as T;
  }

  async save(entity: T): Promise<T> {
    const record = entity as Record<string, unknown>;
    if (this.primaryKeys.length === 1 && this.primaryKeys[0] === 'id') {
      record.id ??= randomUUID();
    }
    const index = this.rows.findIndex((row) => this.sameKey(row, entity));
    if (index >= 0) this.rows[index] = { ...entity };
    else this.rows.push({ ...entity });
    return entity;
  }

  async insert(data: T | T[]) {
    for (const entity of Array.isArray(data) ? data : [data]) {
      if (this.rows.some((row) => this.sameKey(row, entity))) {
        throw new Error('Trùng khoá chính');
      }
      await this.save(entity);
    }
    return { identifiers: [], generatedMaps: [], raw: [] };
  }

  async findOneBy(where: Where<T>): Promise<T | null> {
    const row = this.rows.find((item) => matches(item, where));
    return row ? { ...row } : null;
  }

  findOne(options: { where: Where<T> }): Promise<T | null> {
    return this.findOneBy(options.where);
  }

  async findBy(where: Where<T>): Promise<T[]> {
    return this.rows
      .filter((item) => matches(item, where))
      .map((row) => ({ ...row }));
  }

  find(options: { where?: Where<T> } = {}): Promise<T[]> {
    return this.findBy(options.where ?? {});
  }

  async existsBy(where: Where<T>): Promise<boolean> {
    return this.rows.some((item) => matches(item, where));
  }

  async countBy(where: Where<T>): Promise<number> {
    return this.rows.filter((item) => matches(item, where)).length;
  }

  /** Bỏ qua `withDeleted` vì không tự loại bản ghi đã xoá mềm. */
  count(options: { where?: Where<T> } = {}): Promise<number> {
    return this.countBy(options.where ?? {});
  }

  async update(criteria: string | Where<T>, partial: Partial<T>) {
    const where = typeof criteria === 'string' ? { id: criteria } : criteria;
    const targets = this.rows.filter((row) => matches(row, where as Where<T>));
    targets.forEach((row) => Object.assign(row, partial));
    return { affected: targets.length, raw: [], generatedMaps: [] };
  }

  softDelete(criteria: string | Where<T>) {
    return this.update(criteria, {
      deletedAt: new Date(),
    } as unknown as Partial<T>);
  }

  async delete(where: Where<T>) {
    const before = this.rows.length;
    this.rows = this.rows.filter((row) => !matches(row, where));
    return { affected: before - this.rows.length, raw: [] };
  }

  private sameKey(a: T, b: T): boolean {
    return this.primaryKeys.every((key) => a[key] === b[key]);
  }
}
