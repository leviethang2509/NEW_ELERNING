import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttemptsModule } from '../attempts/attempts.module';
import { LessonAttemptsModule } from '../lesson-attempts/lesson-attempts.module';
import { Membership } from '../memberships/membership.entity';
import { TenantsModule } from '../tenants/tenants.module';
import { TrainingModule } from '../training/training.module';
import { User } from '../users/user.entity';
import { ClassAttemptsService } from './class-attempts.service';
import { ClassChangeLog } from './class-change-log.entity';
import { ClassCurriculumService } from './class-curriculum.service';
import { ClassGroup } from './class-group.entity';
import { ClassItem } from './class-item.entity';
import { ClassMembersService } from './class-members.service';
import { ClassScheduleSlot } from './class-schedule-slot.entity';
import { ClassScheduleService } from './class-schedule.service';
import { ClassSessionLink } from './class-session-link.entity';
import { ClassSessionTeacher } from './class-session-teacher.entity';
import { ClassSession } from './class-session.entity';
import { ClassSessionsService } from './class-sessions.service';
import { ClassroomStudent } from './classroom-student.entity';
import { ClassroomTeacher } from './classroom-teacher.entity';
import { Classroom } from './classroom.entity';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomsService } from './classrooms.service';
import { LearnerClassesController } from './learner-classes.controller';
import { LearnerClassesService } from './learner-classes.service';
import { ScheduleFeedService } from './schedule-feed.service';
import { ScheduleController } from './schedule.controller';

/**
 * Lớp học, giáo viên/học viên, giáo trình lớp (Step 7), thời khoá biểu và lịch
 * (Step 8), khu vực học viên trong lớp và "Cho làm lại" (Step 9).
 */
@Module({
  imports: [
    TenantsModule,
    TrainingModule,
    AttemptsModule,
    LessonAttemptsModule,
    TypeOrmModule.forFeature([
      Classroom,
      ClassroomTeacher,
      ClassroomStudent,
      ClassGroup,
      ClassItem,
      ClassChangeLog,
      ClassScheduleSlot,
      ClassSession,
      ClassSessionTeacher,
      ClassSessionLink,
      Membership,
      User,
    ]),
  ],
  controllers: [
    ClassroomsController,
    ScheduleController,
    LearnerClassesController,
  ],
  providers: [
    ClassroomsService,
    ClassMembersService,
    ClassCurriculumService,
    ClassScheduleService,
    ClassSessionsService,
    ScheduleFeedService,
    ClassAttemptsService,
    LearnerClassesService,
  ],
  exports: [TypeOrmModule],
})
export class ClassroomsModule {}
