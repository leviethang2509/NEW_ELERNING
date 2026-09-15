import { Controller, Get } from '@nestjs/common';
import { SYSTEM_MANAGER_ROLES, type AdminStats } from '@lang/shared';
import { SystemRoles } from '../../auth/decorators';
import { AdminStatsService } from './admin-stats.service';

@Controller('admin/stats')
@SystemRoles(...SYSTEM_MANAGER_ROLES)
export class AdminStatsController {
  constructor(private readonly stats: AdminStatsService) {}

  @Get()
  get(): Promise<AdminStats> {
    return this.stats.get();
  }
}
