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
  type ClassScheduleView,
  type ClassSessionView,
  type ClassroomDetail,
  type ClassroomListItem,
  type ClassroomMembers,
  type MemberScheduleConflicts,
  type ScheduleChangeSummary,
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
import { ClassScheduleService } from './class-schedule.service';
import { ClassSessionsService } from './class-sessions.service';
import { ClassroomsService } from './classrooms.service';
import { SaveClassCurriculumDto } from './dto/class-curriculum.dto';
import {
  CancelClassSessionDto,
  CreateMakeupSessionDto,
  MemberConflictsDto,
  SaveClassScheduleDto,
  SaveSessionLinksDto,
  UpdateClassSessionDto,
} from './dto/class-schedule.dto';
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
 * viên & học viên, sửa lịch lặp; giáo viên của lớp xem lớp, sửa giáo trình lớp
 * và thao tác trên buổi học. Teacher ngoài lớp bị chặn trong service
 * (`loadClassroomAccess`).
 */
@Controller('t/:slug/classes')
@UseGuards(TenantGuard)
@TenantRoles(...TENANT_MANAGER_ROLES)
export class ClassroomsController {
  constructor(
    private readonly classrooms: ClassroomsService,
    private readonly members: ClassMembersService,
    private readonly curriculum: ClassCurriculumService,
    private readonly schedule: ClassScheduleService,
    private readonly sessions: ClassSessionsService,
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

  /** Cảnh báo trùng lịch trước khi thêm giáo viên/học viên (R15). */
  @Post(':id/conflicts')
  @HttpCode(HttpStatus.OK)
  memberConflicts(
    @TenantCtx() ctx: TenantContext,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: MemberConflictsDto,
  ): Promise<MemberScheduleConflicts[]> {
    return this.schedule.memberConflicts(ctx, id, dto.membershipIds);
  }

  @Get(':id/schedule')
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  getSchedule(
    @TenantCtx() ctx: TenantContext,
    @Param('id', ParseIdPipe()) id: string,
  ): Promise<ClassScheduleView> {
    return this.schedule.get(ctx, id);
  }

  @Put(':id/schedule')
  saveSchedule(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: SaveClassScheduleDto,
  ): Promise<ClassScheduleView> {
    return this.schedule.save(ctx, actor.id, id, dto);
  }

  @Post(':id/schedule/preview')
  @HttpCode(HttpStatus.OK)
  previewSchedule(
    @TenantCtx() ctx: TenantContext,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: SaveClassScheduleDto,
  ): Promise<ScheduleChangeSummary> {
    return this.schedule.preview(ctx, id, dto);
  }

  @Post(':id/sessions/makeup')
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  createMakeup(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Body() dto: CreateMakeupSessionDto,
  ): Promise<ClassSessionView> {
    return this.sessions.createMakeup(ctx, actor.id, id, dto);
  }

  @Patch(':id/sessions/:sessionId')
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  updateSession(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Param('sessionId', ParseIdPipe()) sessionId: string,
    @Body() dto: UpdateClassSessionDto,
  ): Promise<ClassSessionView> {
    return this.sessions.update(ctx, actor.id, id, sessionId, dto);
  }

  @Post(':id/sessions/:sessionId/cancel')
  @HttpCode(HttpStatus.OK)
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  cancelSession(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Param('sessionId', ParseIdPipe()) sessionId: string,
    @Body() dto: CancelClassSessionDto,
  ): Promise<ClassSessionView> {
    return this.sessions.cancel(
      ctx,
      actor.id,
      id,
      sessionId,
      dto.reason ?? null,
    );
  }

  @Post(':id/sessions/:sessionId/restore')
  @HttpCode(HttpStatus.OK)
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  restoreSession(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Param('sessionId', ParseIdPipe()) sessionId: string,
  ): Promise<ClassSessionView> {
    return this.sessions.restore(ctx, actor.id, id, sessionId);
  }

  @Delete(':id/sessions/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  removeMakeup(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Param('sessionId', ParseIdPipe()) sessionId: string,
  ): Promise<void> {
    return this.sessions.removeMakeup(ctx, actor.id, id, sessionId);
  }

  @Put(':id/sessions/:sessionId/links')
  @TenantRoles(...EXAM_AUTHOR_ROLES)
  saveSessionLinks(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Param('sessionId', ParseIdPipe()) sessionId: string,
    @Body() dto: SaveSessionLinksDto,
  ): Promise<ClassSessionView> {
    return this.sessions.saveLinks(ctx, actor.id, id, sessionId, dto);
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
