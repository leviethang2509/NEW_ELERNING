import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

/**
 * Lượt học của bài học, dùng để quyết định Save tạo version mới hay ghi đè và
 * xoá mềm hay xoá hẳn (như `exam_attempts` với đề thi). Bảng `lesson_attempts`
 * có từ Step 5; trước đó chưa có lượt học nào nên mọi hàm trả "không có".
 */
@Injectable()
export class LessonAttemptLookup {
  /** Có lượt học của bài (mọi version nếu không truyền `version`). */
  hasAttempts(
    _manager: EntityManager,
    _lessonId: string,
    _version?: number,
  ): Promise<boolean> {
    return Promise.resolve(false);
  }

  /** Số lượt học theo version. */
  countByVersion(_lessonId: string): Promise<Map<number, number>> {
    return Promise.resolve(new Map());
  }
}
