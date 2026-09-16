import {
  GRADER_ROLES,
  type GradeAnswerResult,
  type GradingAttemptDetail,
  type GradingAttemptList,
} from '@lang/shared';
import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { GradeAnswerDto, ListGradingAttemptsQueryDto } from './dto/grading.dto';
import { GradingService } from './grading.service';

/** Chấm bài Writing/Speaking (Owner/Admin/Teacher, trừ bài của chính mình). */
@Controller('t/:slug/grading')
@UseGuards(TenantGuard)
@TenantRoles(...GRADER_ROLES)
export class GradingController {
  constructor(private readonly grading: GradingService) {}

  @Get('attempts')
  list(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Query() query: ListGradingAttemptsQueryDto,
  ): Promise<GradingAttemptList> {
    return this.grading.list(ctx, actor.id, query);
  }

  @Get('attempts/:id')
  detail(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
  ): Promise<GradingAttemptDetail> {
    return this.grading.detail(ctx, actor.id, id);
  }

  @Get('attempts/:id/recordings/:answerId/url')
  recordingUrl(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIdPipe()) id: string,
    @Param('answerId', ParseIdPipe()) answerId: string,
  ): Promise<{ url: string }> {
    return this.grading.recordingUrl(ctx, actor.id, id, answerId);
  }

  @Put('answers/:answerId')
  grade(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
    @Param('answerId', ParseIdPipe()) answerId: string,
    @Body() dto: GradeAnswerDto,
  ): Promise<GradeAnswerResult> {
    return this.grading.grade(ctx, actor.id, answerId, dto);
  }
}
