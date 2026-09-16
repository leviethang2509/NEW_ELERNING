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
} from '@nestjs/common';
import {
  SYSTEM_MANAGER_ROLES,
  type ExamBlueprintItem,
  type ExamCategoryItem,
} from '@lang/shared';
import { SystemRoles } from '../auth/decorators';
import {
  CurrentUser,
  type RequestUser,
} from '../common/decorators/current-user.decorator';
import { ParseIdPipe } from '../common/pipes';
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

/** Danh mục đề hệ thống (`tenant_id` NULL), System Owner/Admin. */
@Controller('admin/exam-categories')
@SystemRoles(...SYSTEM_MANAGER_ROLES)
export class AdminExamCategoriesController {
  constructor(private readonly categories: ExamCategoriesService) {}

  @Get()
  list(): Promise<ExamCategoryItem[]> {
    return this.categories.list(null);
  }

  @Post()
  create(
    @CurrentUser() actor: RequestUser,
    @Body() dto: CreateExamCategoryDto,
  ): Promise<ExamCategoryItem> {
    return this.categories.create(null, actor.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: UpdateExamCategoryDto,
  ): Promise<ExamCategoryItem> {
    return this.categories.update(null, actor.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe()) id: string): Promise<void> {
    return this.categories.remove(null, id);
  }
}

/** Loại đề hệ thống kèm module, System Owner/Admin. */
@Controller('admin/exam-blueprints')
@SystemRoles(...SYSTEM_MANAGER_ROLES)
export class AdminExamBlueprintsController {
  constructor(private readonly blueprints: ExamBlueprintsService) {}

  @Get()
  list(): Promise<ExamBlueprintItem[]> {
    return this.blueprints.list(null);
  }

  @Post()
  create(
    @CurrentUser() actor: RequestUser,
    @Body() dto: CreateExamBlueprintDto,
  ): Promise<ExamBlueprintItem> {
    return this.blueprints.create(null, actor.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: UpdateExamBlueprintDto,
  ): Promise<ExamBlueprintItem> {
    return this.blueprints.update(null, actor.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe()) id: string): Promise<void> {
    return this.blueprints.remove(null, id);
  }
}
