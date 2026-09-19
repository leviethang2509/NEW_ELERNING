import { AttemptStatus } from '@lang/shared';
import { In, type EntityManager } from 'typeorm';
import { ExamAttempt } from '../attempts/exam-attempt.entity';
import { LessonAttempt } from '../lesson-attempts/lesson-attempt.entity';

/**
 * Số học viên đã có bài làm (lượt thi, kể cả đã "Cho làm lại", hoặc lượt học)
 * theo mục lớp. Mục có bài làm khi xoá chỉ ẩn (E3); lớp có bài làm không xoá
 * được (giả định 4).
 */
export async function learnerCountsByItem(
  manager: EntityManager,
  itemIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (itemIds.length === 0) return counts;
  const [examAttempts, lessonAttempts] = await Promise.all([
    manager.getRepository(ExamAttempt).find({
      select: { classItemId: true, userId: true },
      where: { classItemId: In(itemIds) },
    }),
    manager.getRepository(LessonAttempt).find({
      select: { classItemId: true, userId: true },
      where: { classItemId: In(itemIds) },
    }),
  ]);
  const users = new Map<string, Set<string>>();
  for (const { classItemId, userId } of [...examAttempts, ...lessonAttempts]) {
    if (!classItemId) continue;
    const set = users.get(classItemId) ?? new Set<string>();
    set.add(userId);
    users.set(classItemId, set);
  }
  for (const [itemId, set] of users) counts.set(itemId, set.size);
  return counts;
}

/** Lượt thi đang làm dở trong các mục lớp (bị chốt khi lớp kết thúc, T6). */
export function countInProgressAttempts(
  manager: EntityManager,
  itemIds: string[],
): Promise<number> {
  if (itemIds.length === 0) return Promise.resolve(0);
  return manager.getRepository(ExamAttempt).countBy({
    classItemId: In(itemIds),
    status: AttemptStatus.IN_PROGRESS,
  });
}
