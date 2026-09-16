import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DEFAULT_EXAM_CATEGORY_COLOR,
  DEFAULT_EXAM_CATEGORY_ICON,
  type ExamCategoryItem,
} from '@lang/shared';
import { IsNull, type Repository } from 'typeorm';
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '../common/database-errors';
import {
  findOwned,
  findVisible,
  ownedBy,
  type CatalogOwner,
} from './catalog-scope';
import type {
  CreateExamCategoryDto,
  UpdateExamCategoryDto,
} from './dto/exam-category.dto';
import { ExamBlueprint } from './exam-blueprint.entity';
import { compareCategories, toExamCategoryItem } from './exam-catalog.mapper';
import { ExamCategory } from './exam-category.entity';

const CATEGORY_NOT_FOUND = 'Không tìm thấy danh mục đề';
const CODE_TAKEN = 'Mã danh mục đã tồn tại';
const CATEGORY_IN_USE =
  'Danh mục đang có loại đề, chỉ có thể ngừng dùng thay vì xoá';

/**
 * Danh mục đề cho 2 phạm vi: hệ thống (`owner = null`, System Owner/Admin) và
 * tenant (Tenant Owner/Admin sửa, Teacher chỉ xem). Quyền theo role kiểm ở
 * controller; service kiểm phạm vi dữ liệu.
 */
@Injectable()
export class ExamCategoriesService {
  constructor(
    @InjectRepository(ExamCategory)
    private readonly categories: Repository<ExamCategory>,
    @InjectRepository(ExamBlueprint)
    private readonly blueprints: Repository<ExamBlueprint>,
  ) {}

  async list(owner: CatalogOwner): Promise<ExamCategoryItem[]> {
    const categories = (await findVisible(this.categories, owner)).sort(
      compareCategories,
    );
    if (owner === null) {
      // Trang hệ thống đếm cả loại đề của tenant: danh mục đó không xoá được.
      return Promise.all(
        categories.map(async (category) =>
          toExamCategoryItem(
            category,
            await this.blueprints.countBy({ categoryId: category.id }),
          ),
        ),
      );
    }
    const counts = new Map<string, number>();
    for (const blueprint of await findVisible(this.blueprints, owner)) {
      counts.set(
        blueprint.categoryId,
        (counts.get(blueprint.categoryId) ?? 0) + 1,
      );
    }
    return categories.map((category) =>
      toExamCategoryItem(category, counts.get(category.id) ?? 0),
    );
  }

  async create(
    owner: CatalogOwner,
    actorId: string,
    dto: CreateExamCategoryDto,
  ): Promise<ExamCategoryItem> {
    await this.assertCodeAvailable(owner, dto.code);
    const category = await this.saveOrConflict(
      this.categories.create({
        tenantId: owner,
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null,
        icon: dto.icon ?? DEFAULT_EXAM_CATEGORY_ICON,
        color: dto.color ?? DEFAULT_EXAM_CATEGORY_COLOR,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        createdBy: actorId,
        updatedBy: actorId,
      }),
    );
    return toExamCategoryItem(category, 0);
  }

  async update(
    owner: CatalogOwner,
    actorId: string,
    id: string,
    dto: UpdateExamCategoryDto,
  ): Promise<ExamCategoryItem> {
    const category = await findOwned(
      this.categories,
      owner,
      id,
      CATEGORY_NOT_FOUND,
    );
    const changes: Partial<ExamCategory> = {};
    if (dto.code !== undefined && dto.code !== category.code) {
      await this.assertCodeAvailable(owner, dto.code);
      changes.code = dto.code;
    }
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.description !== undefined) changes.description = dto.description;
    if (dto.icon !== undefined) changes.icon = dto.icon;
    if (dto.color !== undefined) changes.color = dto.color;
    if (dto.sortOrder !== undefined) changes.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) changes.isActive = dto.isActive;

    if (Object.keys(changes).length > 0) {
      try {
        await this.categories.update(id, { ...changes, updatedBy: actorId });
      } catch (error) {
        if (isUniqueViolation(error)) throw new ConflictException(CODE_TAKEN);
        throw error;
      }
    }
    const updated = await this.categories.findOneBy({ id });
    return toExamCategoryItem(
      updated ?? { ...category, ...changes },
      await this.countBlueprints(owner, id),
    );
  }

  /** Xoá cứng khi chưa loại đề nào (kể cả của tenant) thuộc danh mục. */
  async remove(owner: CatalogOwner, id: string): Promise<void> {
    await findOwned(this.categories, owner, id, CATEGORY_NOT_FOUND);
    if (await this.blueprints.existsBy({ categoryId: id })) {
      throw new ConflictException(CATEGORY_IN_USE);
    }
    try {
      await this.categories.delete({ id });
    } catch (error) {
      // Loại đề vừa được tạo trong danh mục ngay sau lúc kiểm tra (FK RESTRICT).
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(CATEGORY_IN_USE);
      }
      throw error;
    }
  }

  /** Cùng cách đếm với `list`. */
  private async countBlueprints(
    owner: CatalogOwner,
    categoryId: string,
  ): Promise<number> {
    if (owner === null) return this.blueprints.countBy({ categoryId });
    const [system, own] = await Promise.all([
      this.blueprints.countBy({ categoryId, tenantId: IsNull() }),
      this.blueprints.countBy({ categoryId, tenantId: owner }),
    ]);
    return system + own;
  }

  private async assertCodeAvailable(
    owner: CatalogOwner,
    code: string,
  ): Promise<void> {
    const taken = await this.categories.existsBy({
      tenantId: ownedBy(owner),
      code,
    });
    if (taken) throw new ConflictException(CODE_TAKEN);
  }

  private async saveOrConflict(category: ExamCategory): Promise<ExamCategory> {
    try {
      return await this.categories.save(category);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException(CODE_TAKEN);
      throw error;
    }
  }
}
