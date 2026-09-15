import { Module } from '@nestjs/common';
import { MembershipsModule } from '../memberships/memberships.module';
import { TenantsModule } from '../tenants/tenants.module';
import { TenantDashboardController } from './tenant-dashboard.controller';
import { TenantDashboardService } from './tenant-dashboard.service';

@Module({
  imports: [TenantsModule, MembershipsModule],
  controllers: [TenantDashboardController],
  providers: [TenantDashboardService],
})
export class TenantDashboardModule {}
