import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  EXAM_AUTHOR_ROLES,
  TENANT_MANAGER_ROLES,
  type ExamBlueprintItem,
  type ExamCategoryItem,
} from '@lang/shared';
import {
  CurrentUser,
  type RequestUser,
} from '../common/decorators/current-user.decorator';
import { ParseIdPipe } from '../common/pipes';
import {
  TenantCtx,
  TenantRoles,
  type TenantContext,
} from '../tenants/tenant-context';
import { TenantGuard } from '../tenants/tenant.guard';
import {
  CreateExamBlueprintDto,
  UpdateExamBlueprintDto,
} from './dto/exam-blueprint.dto';
import {
  CreateExamCategoryDto,
  UpdateExamCategoryDto,
} from './dto/exam-category.dto';
import { ExamBlueprintsService } from './exam-blueprints.service';
import { ExamCategoriesService } from './exam-categories.service';

/**
 * Danh mục đề của tenant: xem gồm mục hệ thống + của tenant (Owner/Admin/
 * Teacher); tạo/sửa/xoá chỉ mục của tenant (Owner/Admin).
 */
@Controller('t/:slug/exam-categories')
@UseGuards(TenantGuard)
@TenantRoles(...TENANT_MANAGER_ROLES)
export class TenantExamCategoriesController {
  constructor(private readonly categories: ExamCategoriesService) {}

  @Get()
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  list(@TenantCtx() ctx: TenantContext): Promise<ExamCategoryItem[]> {
    return this.categories.list(ctx.tenantId);
  }

  @Post()
  create(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Body() dto: CreateExamCategoryDto,
  ): Promise<ExamCategoryItem> {
    return this.categories.create(ctx.tenantId, actor.id, dto);
  }

  @Patch(':id')
  update(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: UpdateExamCategoryDto,
  ): Promise<ExamCategoryItem> {
    return this.categories.update(ctx.tenantId, actor.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @TenantCtx() ctx: TenantContext,
    @Param('id', ParseIdPipe()) id: string,
  ): Promise<void> {
    return this.categories.remove(ctx.tenantId, id);
  }
}

/** Loại đề của tenant, quyền như danh mục. */
@Controller('t/:slug/exam-blueprints')
@UseGuards(TenantGuard)
@TenantRoles(...TENANT_MANAGER_ROLES)
export class TenantExamBlueprintsController {
  constructor(private readonly blueprints: ExamBlueprintsService) {}

  @Get()
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  list(@TenantCtx() ctx: TenantContext): Promise<ExamBlueprintItem[]> {
    return this.blueprints.list(ctx.tenantId);
  }

  @Post()
  create(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Body() dto: CreateExamBlueprintDto,
  ): Promise<ExamBlueprintItem> {
    return this.blueprints.create(ctx.tenantId, actor.id, dto);
  }

  @Patch(':id')
  update(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: UpdateExamBlueprintDto,
  ): Promise<ExamBlueprintItem> {
    return this.blueprints.update(ctx.tenantId, actor.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @TenantCtx() ctx: TenantContext,
    @Param('id', ParseIdPipe()) id: string,
  ): Promise<void> {
    return this.blueprints.remove(ctx.tenantId, id);
  }
}
