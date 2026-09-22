import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  TENANT_DASHBOARD_ROLES,
  type TenantDashboardStats,
} from '@lang/shared';
import {
  CurrentUser,
  type RequestUser,
} from '../common/decorators/current-user.decorator';
import {
  TenantCtx,
  TenantRoles,
  type TenantContext,
} from '../tenants/tenant-context';
import { TenantGuard } from '../tenants/tenant.guard';
import { TenantDashboardService } from './tenant-dashboard.service';

@Controller('t/:slug/dashboard')
@UseGuards(TenantGuard)
@TenantRoles(...TENANT_DASHBOARD_ROLES)
export class TenantDashboardController {
  constructor(private readonly dashboard: TenantDashboardService) {}

  @Get('stats')
  stats(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: RequestUser,
  ): Promise<TenantDashboardStats> {
    return this.dashboard.getStats(ctx, actor.id);
  }
}
