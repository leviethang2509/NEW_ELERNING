import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttemptsModule } from '../attempts/attempts.module';
import { Membership } from '../memberships/membership.entity';
import { TenantsModule } from '../tenants/tenants.module';
import { TrainingModule } from '../training/training.module';
import { User } from '../users/user.entity';
import { ClassChangeLog } from './class-change-log.entity';
import { ClassCurriculumService } from './class-curriculum.service';
import { ClassGroup } from './class-group.entity';
import { ClassItem } from './class-item.entity';
import { ClassMembersService } from './class-members.service';
import { ClassroomStudent } from './classroom-student.entity';
import { ClassroomTeacher } from './classroom-teacher.entity';
import { Classroom } from './classroom.entity';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomsService } from './classrooms.service';

/** Lớp học, giáo viên/học viên và giáo trình lớp (req-3 Step 7). */
@Module({
  imports: [
    TenantsModule,
    TrainingModule,
    AttemptsModule,
    TypeOrmModule.forFeature([
      Classroom,
      ClassroomTeacher,
      ClassroomStudent,
      ClassGroup,
      ClassItem,
      ClassChangeLog,
      Membership,
      User,
    ]),
  ],
  controllers: [ClassroomsController],
  providers: [ClassroomsService, ClassMembersService, ClassCurriculumService],
  exports: [TypeOrmModule],
})
export class ClassroomsModule {}
