import {
  AttemptStatus,
  GRADING_COMMENT_MAX_LENGTH,
  isValidManualScore,
  type GradeAnswerInput,
  type GradingAttemptStatus,
} from '@lang/shared';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateBy,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';
import { trimToNull } from '../../common/transforms';

export class ListGradingAttemptsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn([AttemptStatus.SUBMITTED, AttemptStatus.GRADED], {
    message: 'Trạng thái không hợp lệ',
  })
  status?: GradingAttemptStatus;

  @IsOptional()
  @IsUUID('all', { message: 'Đề thi không hợp lệ' })
  examId?: string;

  /** Tên hoặc email học viên. */
  @IsOptional()
  @Transform(trimToNull)
  @IsString({ message: 'Từ khoá không hợp lệ' })
  @MaxLength(100, { message: 'Từ khoá tối đa 100 ký tự' })
  q?: string | null;
}

export class ListLessonGradingAttemptsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn([AttemptStatus.SUBMITTED, AttemptStatus.GRADED], {
    message: 'Trạng thái không hợp lệ',
  })
  status?: GradingAttemptStatus;

  @IsOptional()
  @IsUUID('all', { message: 'Bài học không hợp lệ' })
  lessonId?: string;

  /** Tên hoặc email học viên. */
  @IsOptional()
  @Transform(trimToNull)
  @IsString({ message: 'Từ khoá không hợp lệ' })
  @MaxLength(100, { message: 'Từ khoá tối đa 100 ký tự' })
  q?: string | null;
}

export class GradeAnswerDto implements GradeAnswerInput {
  // Điểm tối đa theo từng câu kiểm lại trong service.
  @ValidateBy({
    name: 'manualScore',
    validator: {
      validate: (value) => isValidManualScore(value),
      defaultMessage: () => 'Điểm phải từ 0 đến 10, bước 0,5',
    },
  })
  score: number;

  @IsOptional()
  @Transform(trimToNull)
  @IsString({ message: 'Nhận xét không hợp lệ' })
  @MaxLength(GRADING_COMMENT_MAX_LENGTH, {
    message: `Nhận xét tối đa ${GRADING_COMMENT_MAX_LENGTH} ký tự`,
  })
  comment?: string | null;
}
