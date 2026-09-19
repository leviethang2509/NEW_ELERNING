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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  EXAM_AUTHOR_ROLES,
  TENANT_MANAGER_ROLES,
  type ClassCurriculum,
  type ClassLogEntry,
  type ClassroomDetail,
  type ClassroomListItem,
  type ClassroomMembers,
} from '@lang/shared';
import {
  CurrentUser,
  type RequestUser,
} from '../common/decorators/current-user.decorator';
import type { Paginated } from '../common/pagination';
import { ParseIdPipe } from '../common/pipes';
import {
  TenantCtx,
  TenantRoles,
  type TenantContext,
} from '../tenants/tenant-context';
import { TenantGuard } from '../tenants/tenant.guard';
import { ClassCurriculumService } from './class-curriculum.service';
import { ClassMembersService } from './class-members.service';
import { ClassroomsService } from './classrooms.service';
import { SaveClassCurriculumDto } from './dto/class-curriculum.dto';
import { ListClassLogsQueryDto } from './dto/class-logs.dto';
import {
  AddClassroomMembersDto,
  ChangeClassroomStatusDto,
  CreateClassroomDto,
  ListClassroomsQueryDto,
  UpdateClassroomDto,
} from './dto/classroom.dto';

/**
 * Lớp học (plan mục 5): Owner/Admin tạo/sửa/đổi trạng thái/xoá, thêm/xoá giáo
 * viên & học viên; giáo viên của lớp xem lớp và sửa giáo trình lớp. Teacher
 * ngoài lớp bị chặn trong service (`loadClassroomAccess`).
 */
@Controller('t/:slug/classes')
@UseGuards(TenantGuard)
@TenantRoles(...TENANT_MANAGER_ROLES)
export class ClassroomsController {
  constructor(
    private readonly classrooms: ClassroomsService,
    private readonly members: ClassMembersService,
    private readonly curriculum: ClassCurriculumService,
  ) {}

  @Get()
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  list(
    @TenantCtx() ctx: TenantContext,
    @Query() query: ListClassroomsQueryDto,
  ): Promise<Paginated<ClassroomListItem>> {
    return this.classrooms.list(ctx, query);
  }

  @Post()
  create(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Body() dto: CreateClassroomDto,
  ): Promise<ClassroomDetail> {
    return this.classrooms.create(ctx, actor.id, dto);
  }

  @Get(':id')
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  detail(
    @TenantCtx() ctx: TenantContext,
    @Param('id', ParseIdPipe()) id: string,
  ): Promise<ClassroomDetail> {
    return this.classrooms.getDetail(ctx, id);
  }

  @Patch(':id')
  update(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: UpdateClassroomDto,
  ): Promise<ClassroomDetail> {
    return this.classrooms.update(ctx, actor.id, id, dto);
  }

  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  changeStatus(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: ChangeClassroomStatusDto,
  ): Promise<ClassroomDetail> {
    return this.classrooms.changeStatus(ctx, actor.id, id, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @TenantCtx() ctx: TenantContext,
    @Param('id', ParseIdPipe()) id: string,
  ): Promise<void> {
    return this.classrooms.remove(ctx, id);
  }

  @Get(':id/members')
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  listMembers(
    @TenantCtx() ctx: TenantContext,
    @Param('id', ParseIdPipe()) id: string,
  ): Promise<ClassroomMembers> {
    return this.members.list(ctx, id);
  }

  @Post(':id/teachers')
  @HttpCode(HttpStatus.OK)
  addTeachers(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: AddClassroomMembersDto,
  ): Promise<ClassroomMembers> {
    return this.members.addTeachers(ctx, actor.id, id, dto.membershipIds);
  }

  @Delete(':id/teachers/:membershipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTeacher(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Param('membershipId', ParseIdPipe()) membershipId: string,
  ): Promise<void> {
    return this.members.removeTeacher(ctx, actor.id, id, membershipId);
  }

  @Post(':id/students')
  @HttpCode(HttpStatus.OK)
  addStudents(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: AddClassroomMembersDto,
  ): Promise<ClassroomMembers> {
    return this.members.addStudents(ctx, actor.id, id, dto.membershipIds);
  }

  @Delete(':id/students/:membershipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeStudent(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Param('membershipId', ParseIdPipe()) membershipId: string,
  ): Promise<void> {
    return this.members.removeStudent(ctx, actor.id, id, membershipId);
  }

  @Get(':id/curriculum')
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  getCurriculum(
    @TenantCtx() ctx: TenantContext,
    @Param('id', ParseIdPipe()) id: string,
  ): Promise<ClassCurriculum> {
    return this.curriculum.get(ctx, id);
  }

  @Put(':id/curriculum')
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  saveCurriculum(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: SaveClassCurriculumDto,
  ): Promise<ClassCurriculum> {
    return this.curriculum.save(ctx, actor.id, id, dto);
  }

  @Get(':id/logs')
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  logs(
    @TenantCtx() ctx: TenantContext,
    @Param('id', ParseIdPipe()) id: string,
    @Query() query: ListClassLogsQueryDto,
  ): Promise<Paginated<ClassLogEntry>> {
    return this.classrooms.logs(ctx, id, query);
  }
}
