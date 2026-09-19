import { Module } from '@nestjs/common';
import { AttemptsModule } from '../attempts/attempts.module';
import { LessonAttemptsModule } from '../lesson-attempts/lesson-attempts.module';
import { StorageModule } from '../storage/storage.module';
import { TenantsModule } from '../tenants/tenants.module';
import { GradingController } from './grading.controller';
import { GradingService } from './grading.service';
import { LessonGradingController } from './lesson-grading.controller';
import { LessonGradingService } from './lesson-grading.service';

/** Chấm bài thủ công: đề thi (Step 14 req-1) và bài học (req-3 Step 5). */
@Module({
  imports: [TenantsModule, AttemptsModule, LessonAttemptsModule, StorageModule],
  controllers: [GradingController, LessonGradingController],
  providers: [GradingService, LessonGradingService],
})
export class GradingModule {}
