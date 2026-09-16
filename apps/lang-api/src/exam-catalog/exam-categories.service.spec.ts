import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CatalogScope } from '@lang/shared';
import { InMemoryRepository } from '../testing/in-memory-repository';
import type { ExamBlueprint } from './exam-blueprint.entity';
import { ExamCategoriesService } from './exam-categories.service';
import type { ExamCategory } from './exam-category.entity';

const TENANT_A = 'tenant-a';
const TENANT_B = 'tenant-b';

function setup() {
  const categories = new InMemoryRepository<ExamCategory>(() => ({
    updatedAt: new Date(),
  }));
  const blueprints = new InMemoryRepository<ExamBlueprint>(() => ({
    updatedAt: new Date(),
  }));
  const service = new ExamCategoriesService(
    categories.asRepository(),
    blueprints.asRepository(),
  );
  return { service, categories, blueprints };
}

describe('ExamCategoriesService', () => {
  it('mã unique theo phạm vi: tenant dùng lại được mã hệ thống và mã của tenant khác', async () => {
    const { service } = setup();

    await expect(
      service.create(null, 'owner', { code: 'EN', name: 'Tiếng Anh' }),
    ).resolves.toMatchObject({
      scope: CatalogScope.SYSTEM,
      icon: 'book-open',
      color: 'blue',
      sortOrder: 0,
      isActive: true,
      blueprintCount: 0,
    });
    await expect(
      service.create(null, 'owner', { code: 'EN', name: 'Trùng' }),
    ).rejects.toBeInstanceOf(ConflictException);

    await expect(
      service.create(TENANT_A, 'a', { code: 'EN', name: 'Tiếng Anh A' }),
    ).resolves.toMatchObject({ scope: CatalogScope.TENANT });
    await service.create(TENANT_B, 'b', { code: 'EN', name: 'Tiếng Anh B' });
    await expect(
      service.create(TENANT_A, 'a', { code: 'EN', name: 'Trùng' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('tenant thấy mục hệ thống trước rồi mục của mình, không thấy tenant khác; đếm loại đề theo phạm vi', async () => {
    const { service, blueprints } = setup();
    const ja = await service.create(null, 'o', {
      code: 'JA',
      name: 'Tiếng Nhật',
      sortOrder: 2,
    });
    const en = await service.create(null, 'o', {
      code: 'EN',
      name: 'Tiếng Anh',
      sortOrder: 1,
    });
    const own = await service.create(TENANT_A, 'a', {
      code: 'KO',
      name: 'Tiếng Hàn',
    });
    await service.create(TENANT_B, 'b', { code: 'ZH', name: 'Tiếng Trung' });
    for (const tenantId of [null, TENANT_A, TENANT_B]) {
      await blueprints.save(
        blueprints.create({ tenantId, categoryId: en.id, code: 'X' }),
      );
    }

    const tenantList = await service.list(TENANT_A);
    expect(tenantList.map((row) => row.code)).toEqual(['EN', 'JA', 'KO']);
    expect(tenantList[0].blueprintCount).toBe(2);
    expect(tenantList.find((row) => row.id === own.id)?.scope).toBe(
      CatalogScope.TENANT,
    );

    const systemList = await service.list(null);
    expect(systemList.map((row) => row.code)).toEqual(['EN', 'JA']);
    expect(systemList[0].blueprintCount).toBe(3);
    expect(systemList.find((row) => row.id === ja.id)?.blueprintCount).toBe(0);
  });

  it('tenant không sửa/xoá được mục hệ thống (403) hay của tenant khác (404)', async () => {
    const { service } = setup();
    const system = await service.create(null, 'o', { code: 'EN', name: 'A' });
    const other = await service.create(TENANT_B, 'b', {
      code: 'ZH',
      name: 'B',
    });
    const own = await service.create(TENANT_A, 'a', { code: 'KO', name: 'C' });

    await expect(
      service.update(TENANT_A, 'a', system.id, { name: 'Sửa' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.remove(TENANT_A, system.id)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      service.update(TENANT_A, 'a', other.id, { name: 'Sửa' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    // Trang hệ thống cũng không đụng mục của tenant.
    await expect(service.remove(null, own.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    await expect(
      service.update(TENANT_A, 'editor', own.id, {
        code: 'KR',
        color: 'green',
        isActive: false,
        description: null,
      }),
    ).resolves.toMatchObject({ code: 'KR', color: 'green', isActive: false });
  });

  it('đổi sang mã đã có trong phạm vi → 409', async () => {
    const { service, categories } = setup();
    await service.create(TENANT_A, 'a', { code: 'EN', name: 'A' });
    const ko = await service.create(TENANT_A, 'a', { code: 'KO', name: 'B' });

    await expect(
      service.update(TENANT_A, 'a', ko.id, { code: 'EN' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(categories.rows.find((row) => row.id === ko.id)?.code).toBe('KO');
    // Giữ nguyên mã của chính nó thì không báo trùng.
    await expect(
      service.update(TENANT_A, 'a', ko.id, { code: 'KO', name: 'Mới' }),
    ).resolves.toMatchObject({ name: 'Mới', updatedAt: expect.any(String) });
    expect(categories.rows.find((row) => row.id === ko.id)?.updatedBy).toBe(
      'a',
    );
  });

  it('không xoá danh mục hệ thống khi có loại đề của tenant thuộc nó', async () => {
    const { service, categories, blueprints } = setup();
    const used = await service.create(null, 'o', { code: 'EN', name: 'A' });
    const unused = await service.create(null, 'o', { code: 'JA', name: 'B' });
    await blueprints.save(
      blueprints.create({ tenantId: TENANT_A, categoryId: used.id }),
    );

    await expect(service.remove(null, used.id)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await service.remove(null, unused.id);
    expect(categories.rows.map((row) => row.code)).toEqual(['EN']);
  });
});
