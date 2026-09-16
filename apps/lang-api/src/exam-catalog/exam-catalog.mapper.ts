import type {
  ExamBlueprintItem,
  ExamCategoryItem,
  ExamCategoryRef,
  ExamModuleItem,
} from '@lang/shared';
import { compareText, scopeOf } from './catalog-scope';
import type { ExamBlueprint } from './exam-blueprint.entity';
import type { ExamCategory } from './exam-category.entity';
import type { ExamModule } from './exam-module.entity';

export function toExamCategoryItem(
  category: ExamCategory,
  blueprintCount: number,
): ExamCategoryItem {
  return {
    ...toExamCategoryRef(category),
    description: category.description,
    sortOrder: category.sortOrder,
    blueprintCount,
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function toExamCategoryRef(category: ExamCategory): ExamCategoryRef {
  return {
    id: category.id,
    scope: scopeOf(category),
    name: category.name,
    code: category.code,
    icon: category.icon,
    color: category.color,
    isActive: category.isActive,
  };
}

export function toExamModuleItem(module: ExamModule): ExamModuleItem {
  return {
    id: module.id,
    name: module.name,
    code: module.code,
    sortOrder: module.sortOrder,
    referenceDurationMinutes: module.referenceDurationMinutes,
    description: module.description,
  };
}

export function toExamBlueprintItem(
  blueprint: ExamBlueprint,
  category: ExamCategory,
  modules: ExamModule[],
): ExamBlueprintItem {
  return {
    id: blueprint.id,
    scope: scopeOf(blueprint),
    category: toExamCategoryRef(category),
    name: blueprint.name,
    code: blueprint.code,
    description: blueprint.description,
    isActive: blueprint.isActive,
    modules: [...modules]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(toExamModuleItem),
    updatedAt: blueprint.updatedAt.toISOString(),
  };
}

/** Mục hệ thống trước, rồi theo thứ tự và tên. */
export function compareCategories(a: ExamCategory, b: ExamCategory): number {
  return (
    Number(a.tenantId !== null) - Number(b.tenantId !== null) ||
    a.sortOrder - b.sortOrder ||
    compareText(a.name, b.name)
  );
}
