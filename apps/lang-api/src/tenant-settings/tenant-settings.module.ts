import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomsModule } from '../classrooms/classrooms.module';
import { TenantsModule } from '../tenants/tenants.module';
import { TenantHoliday } from './tenant-holiday.entity';
import { TenantSettingsController } from './tenant-settings.controller';
import { TenantSettingsService } from './tenant-settings.service';

/** Cài đặt trung tâm: tham số chuyên cần, ngày nghỉ (req-3 Step 8). */
@Module({
  imports: [
    TenantsModule,
    ClassroomsModule,
    TypeOrmModule.forFeature([TenantHoliday]),
  ],
  controllers: [TenantSettingsController],
  providers: [TenantSettingsService],
})
export class TenantSettingsModule {}
