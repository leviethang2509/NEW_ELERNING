import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from '../exams/exam.entity';
import { TenantsModule } from '../tenants/tenants.module';
import {
  AdminExamBlueprintsController,
  AdminExamCategoriesController,
} from './admin-exam-catalog.controller';
import { ExamBlueprint } from './exam-blueprint.entity';
import { ExamBlueprintsService } from './exam-blueprints.service';
import { ExamCategoriesService } from './exam-categories.service';
import { ExamCategory } from './exam-category.entity';
import { ExamModule } from './exam-module.entity';
import {
  TenantExamBlueprintsController,
  TenantExamCategoriesController,
} from './tenant-exam-catalog.controller';

/** Danh mục đề, loại đề và module cho `/admin/*` và `/t/:slug/*` (Step 11). */
@Module({
  imports: [
    TenantsModule,
    TypeOrmModule.forFeature([ExamCategory, ExamBlueprint, ExamModule, Exam]),
  ],
  controllers: [
    AdminExamCategoriesController,
    AdminExamBlueprintsController,
    TenantExamCategoriesController,
    TenantExamBlueprintsController,
  ],
  providers: [ExamCategoriesService, ExamBlueprintsService],
  exports: [TypeOrmModule, ExamBlueprintsService],
})
export class ExamCatalogModule {}
