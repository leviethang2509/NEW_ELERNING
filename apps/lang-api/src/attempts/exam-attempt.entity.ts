import { AttemptStatus } from '@lang/shared';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { sqlInList } from '../common/sql';
import { Exam } from '../exams/exam.entity';
import { Membership } from '../memberships/membership.entity';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';

/**
 * Lượt làm bài (plan 4.5). Tạo bảng ở Step 12 vì quy tắc version cần biết
 * version hiện tại đã có bài làm chưa; luồng làm bài ở Step 13.
 */
@Entity('exam_attempts')
@Index('IDX_exam_attempts_exam_version', ['examId', 'examVersion'])
@Check('CHK_exam_attempts_status', sqlInList('status', AttemptStatus))
export class ExamAttempt {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_exam_attempts',
  })
  id: string;

  @Index('IDX_exam_attempts_tenant_id')
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'tenant_id',
    foreignKeyConstraintName: 'FK_exam_attempts_tenant_id',
  })
  tenant?: Tenant;

  @Column({ name: 'exam_id', type: 'uuid' })
  examId: string;

  // Đề có bài làm chỉ xoá mềm; NO ACTION để xoá cứng tenant vẫn CASCADE được.
  @ManyToOne(() => Exam, { onDelete: 'NO ACTION' })
  @JoinColumn({
    name: 'exam_id',
    foreignKeyConstraintName: 'FK_exam_attempts_exam_id',
  })
  exam?: Exam;

  @Column({ name: 'exam_version', type: 'int' })
  examVersion: number;

  @Index('IDX_exam_attempts_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_exam_attempts_user_id',
  })
  user?: User;

  @Index('IDX_exam_attempts_membership_id')
  @Column({ name: 'membership_id', type: 'uuid' })
  membershipId: string;

  @ManyToOne(() => Membership, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'membership_id',
    foreignKeyConstraintName: 'FK_exam_attempts_membership_id',
  })
  membership?: Membership;

  @Column({ type: 'varchar', length: 16, default: AttemptStatus.IN_PROGRESS })
  status: AttemptStatus;

  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'now()' })
  startedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ name: 'graded_at', type: 'timestamptz', nullable: true })
  gradedAt: Date | null;

  @Column({ name: 'auto_correct', type: 'int', default: 0 })
  autoCorrect: number;

  @Column({ name: 'auto_total', type: 'int', default: 0 })
  autoTotal: number;

  @Column({ name: 'manual_count', type: 'int', default: 0 })
  manualCount: number;

  @Column({ name: 'manual_graded_count', type: 'int', default: 0 })
  manualGradedCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
