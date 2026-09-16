import { Module } from '@nestjs/common';
import { AttemptsModule } from '../attempts/attempts.module';
import { StorageModule } from '../storage/storage.module';
import { TenantsModule } from '../tenants/tenants.module';
import { GradingController } from './grading.controller';
import { GradingService } from './grading.service';

/** Chấm bài thủ công (Step 14). */
@Module({
  imports: [TenantsModule, AttemptsModule, StorageModule],
  controllers: [GradingController],
  providers: [GradingService],
})
export class GradingModule {}
