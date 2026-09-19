import { ConflictException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { CurriculumItem } from './curriculum-item.entity';

export const LESSON_IN_CURRICULUM =
  'Bài học đang nằm trong giáo trình, chỉ lưu trữ được, không xoá được';
export const EXAM_IN_CURRICULUM =
  'Đề thi đang nằm trong giáo trình, chỉ lưu trữ được, không xoá được';

/**
 * Chặn xoá bài học/đề thi đang được dùng (C5): gọi trong transaction đã khoá
 * dòng bài/đề trước khi xoá (lưu mục giáo trình khoá chia sẻ dòng bài/đề nên
 * không chen vào giữa). Step 7 kiểm thêm giáo trình lớp.
 */
export async function assertLessonNotInUse(
  manager: EntityManager,
  lessonId: string,
): Promise<void> {
  const used = await manager
    .getRepository(CurriculumItem)
    .existsBy({ lessonId });
  if (used) throw new ConflictException(LESSON_IN_CURRICULUM);
}

export async function assertExamNotInUse(
  manager: EntityManager,
  examId: string,
): Promise<void> {
  const used = await manager.getRepository(CurriculumItem).existsBy({ examId });
  if (used) throw new ConflictException(EXAM_IN_CURRICULUM);
}
