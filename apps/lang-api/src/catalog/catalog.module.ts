import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from '../exams/exam.entity';
import { TenantsModule } from '../tenants/tenants.module';
import {
  AdminExamBlueprintsController,
  AdminCategoriesController,
} from './admin-catalog.controller';
import { ExamBlueprint } from './exam-blueprint.entity';
import { ExamBlueprintsService } from './exam-blueprints.service';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { ExamModule } from './exam-module.entity';
import {
  TenantExamBlueprintsController,
  TenantCategoriesController,
} from './tenant-catalog.controller';

/** Danh mục, loại đề và module cho `/admin/*` và `/t/:slug/*` (Step 11). */
@Module({
  imports: [
    TenantsModule,
    TypeOrmModule.forFeature([Category, ExamBlueprint, ExamModule, Exam]),
  ],
  controllers: [
    AdminCategoriesController,
    AdminExamBlueprintsController,
    TenantCategoriesController,
    TenantExamBlueprintsController,
  ],
  providers: [CategoriesService, ExamBlueprintsService],
  exports: [TypeOrmModule, ExamBlueprintsService],
})
export class CatalogModule {}
