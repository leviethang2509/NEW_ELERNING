import { explanationsFor, type ExamElement } from '@lang/exam-core';
import {
  AttemptStatus,
  QuestionGrading,
  isValidManualScore,
  type GradeAnswerInput,
  type GradingAnswerState,
  type GradingAttemptProgress,
  type GradingQuestion,
  type GradingSection,
  type LessonGradeAnswerResult,
  type LessonGradingAttemptDetail,
  type LessonGradingAttemptItem,
  type LessonGradingAttemptList,
} from '@lang/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  In,
  IsNull,
  MoreThan,
  Not,
  type EntityManager,
  type Repository,
} from 'typeorm';
import { toSkipTake } from '../common/pagination';
import { escapeLike } from '../common/sql';
import { LessonAttemptAnswer } from '../lesson-attempts/lesson-attempt-answer.entity';
import { LessonAttemptSection } from '../lesson-attempts/lesson-attempt-section.entity';
import { LessonAttempt } from '../lesson-attempts/lesson-attempt.entity';
import {
  LESSON_ATTEMPT_NOT_FOUND,
  attemptTotals,
} from '../lesson-attempts/lesson-attempts.service';
import { LessonQuestion } from '../lessons/lesson-question.entity';
import { LessonSection } from '../lessons/lesson-section.entity';
import { Lesson } from '../lessons/lesson.entity';
import { R2Service } from '../storage/r2.service';
import type { TenantContext } from '../tenants/tenant-context';
import { User } from '../users/user.entity';
import type { ListLessonGradingAttemptsQueryDto } from './dto/grading.dto';
import { sectionPrompts } from './grading-content';
import { OWN_ATTEMPT } from './grading.service';

const ANSWER_NOT_FOUND = 'Không tìm thấy câu trả lời';
const ANSWER_REPLACED =
  'Học viên đã nộp lại phần này, hãy tải lại trang để chấm lần nộp mới';
const NOT_MANUAL = 'Câu này chấm tự động, không chấm tay được';
const INVALID_SCORE = (max: number) => `Điểm phải từ 0 đến ${max}, bước 0,5`;
const RECORDING_NOT_FOUND = 'Không tìm thấy bản ghi âm';

const numberParam = (params: object, key: string): number | null => {
  const value = (params as Record<string, unknown>)[key];
  return typeof value === 'number' ? value : null;
};

/** Chờ chấm khi còn câu chấm tay (lần nộp gần nhất) chưa có điểm. */
function toProgress(attempt: LessonAttempt): GradingAttemptProgress {
  return {
    status:
      attempt.manualGradedCount < attempt.manualCount
        ? AttemptStatus.SUBMITTED
        : AttemptStatus.GRADED,
    gradedAt: attempt.gradedAt?.toISOString() ?? null,
    manualCount: attempt.manualCount,
    manualGradedCount: attempt.manualGradedCount,
  };
}

function toAnswerState(
  answer: LessonAttemptAnswer,
  graders: ReadonlyMap<string, User>,
): GradingAnswerState {
  const grader = answer.gradedBy ? graders.get(answer.gradedBy) : undefined;
  return {
    answerId: answer.id,
    score: answer.gradedAt ? answer.score : null,
    comment: answer.gradedAt ? answer.comment : null,
    gradedAt: answer.gradedAt?.toISOString() ?? null,
    grader: grader ? { id: grader.id, fullName: grader.fullName } : null,
  };
}

/**
 * Chấm tay Writing/Speaking trong bài học (req-3 Step 5): cùng quyền với đề
 * thi (Owner/Admin/Teacher, trừ bài của chính mình – đổi ở Step 10). Chỉ chấm
 * lần nộp gần nhất của mỗi section; học viên nộp lại thì bản chấm cũ bỏ (R20.5).
 */
@Injectable()
export class LessonGradingService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly r2: R2Service,
    @InjectRepository(LessonAttempt)
    private readonly attempts: Repository<LessonAttempt>,
    @InjectRepository(LessonAttemptAnswer)
    private readonly answers: Repository<LessonAttemptAnswer>,
  ) {}

  async list(
    ctx: TenantContext,
    graderId: string,
    query: ListLessonGradingAttemptsQueryDto,
  ): Promise<LessonGradingAttemptList> {
    const { skip, take } = toSkipTake(query);
    const qb = this.gradableQuery(ctx, graderId)
      .innerJoinAndSelect('attempt.user', 'user')
      .orderBy('attempt.submittedAt', 'DESC')
      .addOrderBy('attempt.id', 'ASC')
      .skip(skip)
      .take(take);
    if (query.status === AttemptStatus.SUBMITTED) {
      qb.andWhere('attempt.manualGradedCount < attempt.manualCount');
    } else if (query.status === AttemptStatus.GRADED) {
      qb.andWhere('attempt.manualGradedCount >= attempt.manualCount');
    }
    if (query.lessonId) {
      qb.andWhere('attempt.lessonId = :lessonId', { lessonId: query.lessonId });
    }
    if (query.q) {
      qb.andWhere('(user.fullName ILIKE :q OR user.email ILIKE :q)', {
        q: `%${escapeLike(query.q)}%`,
      });
    }
    const [[rows, total], lessonIds] = await Promise.all([
      qb.getManyAndCount(),
      this.gradableQuery(ctx, graderId)
        .select('attempt.lessonId', 'lessonId')
        .distinct(true)
        .getRawMany<{ lessonId: string }>(),
    ]);

    const lessons = await this.lessonsById([
      ...rows.map((row) => row.lessonId),
      ...lessonIds.map((row) => row.lessonId),
    ]);
    return {
      items: rows.map((row) => toItem(row, row.user, lessons)),
      total,
      page: query.page,
      pageSize: query.pageSize,
      lessons: lessonIds
        .map(({ lessonId }) => ({
          id: lessonId,
          title: lessons.get(lessonId)?.title ?? '',
        }))
        .sort((a, b) => a.title.localeCompare(b.title, 'vi')),
    };
  }

  async detail(
    ctx: TenantContext,
    graderId: string,
    id: string,
  ): Promise<LessonGradingAttemptDetail> {
    const manager = this.dataSource.manager;
    const attempt = await this.findGradable(manager, ctx, graderId, id);
    const attemptSections = (
      await manager.getRepository(LessonAttemptSection).findBy({
        attemptId: attempt.id,
        manualCount: MoreThan(0),
      })
    )
      .filter((section) => section.submitCount > 0)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const sectionIds = attemptSections.map((section) => section.sectionId);
    const [lessonSections, questions, answers, next] = await Promise.all([
      sectionIds.length > 0
        ? manager.getRepository(LessonSection).findBy({ id: In(sectionIds) })
        : Promise.resolve([]),
      this.manualQuestions(manager, sectionIds),
      this.answers.findBy({ attemptId: attempt.id }),
      // Lượt còn câu chưa chấm: `graded_at` chỉ có khi đã chấm đủ.
      this.attempts.findOne({
        where: {
          tenantId: ctx.tenantId,
          manualCount: MoreThan(0),
          gradedAt: IsNull(),
          userId: Not(graderId),
          id: Not(attempt.id),
        },
        order: { submittedAt: 'ASC', id: 'ASC' },
      }),
    ]);
    const answerBySection = new Map<string, LessonAttemptAnswer>();
    for (const answer of answers) {
      answerBySection.set(
        `${answer.attemptSectionId}:${answer.questionId}`,
        answer,
      );
    }
    const [users, lessons] = await Promise.all([
      this.usersById(manager, [
        attempt.userId,
        ...answers.flatMap((a) => (a.gradedBy ? [a.gradedBy] : [])),
      ]),
      this.lessonsById([attempt.lessonId]),
    ]);
    const lessonSectionById = new Map(lessonSections.map((s) => [s.id, s]));

    const sections: GradingSection[] = [];
    for (const section of attemptSections) {
      const lessonSection = lessonSectionById.get(section.sectionId);
      const own = questions
        .filter((question) => question.sectionId === section.sectionId)
        .sort((a, b) => a.number - b.number);
      if (!lessonSection || own.length === 0) continue;
      const prompts = sectionPrompts(
        lessonSection.contentPublic as ExamElement[],
      );
      sections.push({
        id: section.id,
        name: lessonSection.name,
        correct: section.correct ?? 0,
        total: section.total ?? 0,
        autoSubmitted: false,
        submittedAt: section.submittedAt?.toISOString() ?? null,
        parts: prompts.parts,
        questions: own.flatMap((question): GradingQuestion[] => {
          const answer = answerBySection.get(`${section.id}:${question.id}`);
          if (!answer) return [];
          const prompt = prompts.questions.get(question.nodeId);
          return [
            {
              ...toAnswerState(answer, users),
              number: question.number,
              qtype: question.qtype,
              maxScore: question.maxScore,
              seconds: numberParam(question.params, 'seconds'),
              maxChars: numberParam(question.params, 'maxChars'),
              partIndex: prompt?.partIndex ?? null,
              prompt: prompt?.prompt ?? [],
              explanations: explanationsFor(
                lessonSection.explanations ?? [],
                question.number,
              ).map((item) => item.blocks),
              text:
                typeof answer.response === 'string' ? answer.response : null,
              hasRecording: answer.recordingKey !== null,
            },
          ];
        }),
      });
    }

    return {
      ...toItem(attempt, users.get(attempt.userId), lessons),
      startedAt: attempt.startedAt.toISOString(),
      sections,
      nextAttemptId: next?.id ?? null,
    };
  }

  /** Chấm (hoặc chấm lại) một câu của lần nộp gần nhất. */
  async grade(
    ctx: TenantContext,
    graderId: string,
    answerId: string,
    input: GradeAnswerInput,
  ): Promise<LessonGradeAnswerResult> {
    const now = new Date();
    return this.dataSource.transaction(async (manager) => {
      const answerRepository = manager.getRepository(LessonAttemptAnswer);
      const found = await answerRepository.findOneBy({ id: answerId });
      if (!found) throw new NotFoundException(ANSWER_NOT_FOUND);
      // Khoá lượt học: không chạy song song với lần nộp lại (xoá câu trả lời)
      // hay người chấm khác (đếm số câu đã chấm).
      const attempt = await manager.getRepository(LessonAttempt).findOne({
        where: { id: found.attemptId, tenantId: ctx.tenantId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!attempt) throw new NotFoundException(ANSWER_NOT_FOUND);
      if (attempt.userId === graderId) {
        throw new ForbiddenException(OWN_ATTEMPT);
      }
      const answer = await answerRepository.findOneBy({ id: answerId });
      if (!answer) throw new NotFoundException(ANSWER_REPLACED);

      const question = await manager
        .getRepository(LessonQuestion)
        .findOneBy({ id: answer.questionId });
      if (!question || question.grading !== QuestionGrading.MANUAL) {
        throw new BadRequestException(NOT_MANUAL);
      }
      if (!isValidManualScore(input.score, question.maxScore)) {
        throw new BadRequestException(INVALID_SCORE(question.maxScore));
      }

      const changes = {
        score: input.score,
        comment: input.comment?.trim() || null,
        gradedBy: graderId,
        gradedAt: now,
      };
      await answerRepository.update(answer.id, changes);
      Object.assign(answer, changes);

      // Đếm lại (chấm lại không cộng dồn) số câu chấm tay đã có điểm của section.
      const sectionRepository = manager.getRepository(LessonAttemptSection);
      const sections = await sectionRepository.find({
        where: { attemptId: attempt.id },
        lock: { mode: 'pessimistic_write' },
      });
      const section = sections.find((s) => s.id === answer.attemptSectionId);
      if (!section) throw new NotFoundException(ANSWER_NOT_FOUND);
      const manualIds = (
        await this.manualQuestions(manager, [section.sectionId])
      ).map((q) => q.id);
      section.manualGradedCount = await answerRepository.countBy({
        attemptSectionId: section.id,
        questionId: In(manualIds),
        gradedAt: Not(IsNull()),
      });
      await sectionRepository.update(section.id, {
        manualGradedCount: section.manualGradedCount,
      });

      const lessonSections = await manager
        .getRepository(LessonSection)
        .findBy({ id: In(sections.map((s) => s.sectionId)) });
      const totals = attemptTotals(
        sections,
        new Map(lessonSections.map((s) => [s.id, s.questionCount])),
        attempt,
        now,
      );
      await manager.getRepository(LessonAttempt).update(attempt.id, totals);
      Object.assign(attempt, totals);

      const graders = await this.usersById(manager, [graderId]);
      return {
        answer: toAnswerState(answer, graders),
        attempt: toProgress(attempt),
      };
    });
  }

  /** Link nghe ghi âm Speaking (presigned, bucket private) cho người chấm. */
  async recordingUrl(
    ctx: TenantContext,
    graderId: string,
    id: string,
    answerId: string,
  ): Promise<{ url: string }> {
    const attempt = await this.findGradable(
      this.dataSource.manager,
      ctx,
      graderId,
      id,
    );
    const answer = await this.answers.findOneBy({
      id: answerId,
      attemptId: attempt.id,
    });
    if (!answer?.recordingKey) {
      throw new NotFoundException(RECORDING_NOT_FOUND);
    }
    return { url: await this.r2.presignedGetUrl(answer.recordingKey) };
  }

  // --- Nội bộ ---------------------------------------------------------------

  /** Lượt học có câu chấm tay đã nộp, không phải của người chấm. */
  private gradableQuery(ctx: TenantContext, graderId: string) {
    return this.attempts
      .createQueryBuilder('attempt')
      .where('attempt.tenantId = :tenantId', { tenantId: ctx.tenantId })
      .andWhere('attempt.manualCount > 0')
      .andWhere('attempt.userId <> :graderId', { graderId });
  }

  private async findGradable(
    manager: EntityManager,
    ctx: TenantContext,
    graderId: string,
    id: string,
  ): Promise<LessonAttempt> {
    const attempt = await manager
      .getRepository(LessonAttempt)
      .findOneBy({ id, tenantId: ctx.tenantId });
    if (!attempt || attempt.manualCount === 0) {
      throw new NotFoundException(LESSON_ATTEMPT_NOT_FOUND);
    }
    if (attempt.userId === graderId) throw new ForbiddenException(OWN_ATTEMPT);
    return attempt;
  }

  private manualQuestions(
    manager: EntityManager,
    sectionIds: readonly string[],
  ): Promise<LessonQuestion[]> {
    if (sectionIds.length === 0) return Promise.resolve([]);
    return manager.getRepository(LessonQuestion).findBy({
      sectionId: In([...sectionIds]),
      grading: QuestionGrading.MANUAL,
    });
  }

  private async usersById(
    manager: EntityManager,
    ids: readonly string[],
  ): Promise<Map<string, User>> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) return new Map();
    const users = await manager
      .getRepository(User)
      .find({ where: { id: In(unique) }, withDeleted: true });
    return new Map(users.map((user) => [user.id, user]));
  }

  private async lessonsById(
    ids: readonly string[],
  ): Promise<Map<string, Lesson>> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) return new Map();
    // Bài bị xoá mềm vẫn hiện tên trong lượt học cũ.
    const lessons = await this.dataSource.manager
      .getRepository(Lesson)
      .find({ where: { id: In(unique) }, withDeleted: true });
    return new Map(lessons.map((lesson) => [lesson.id, lesson]));
  }
}

function toItem(
  attempt: LessonAttempt,
  user: User | undefined,
  lessons: ReadonlyMap<string, Lesson>,
): LessonGradingAttemptItem {
  return {
    id: attempt.id,
    lesson: {
      id: attempt.lessonId,
      title: lessons.get(attempt.lessonId)?.title ?? '',
    },
    lessonVersion: attempt.lessonVersion,
    student: {
      userId: attempt.userId,
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
    },
    submittedAt: attempt.submittedAt?.toISOString() ?? null,
    autoCorrect: attempt.autoCorrect,
    autoTotal: attempt.autoTotal,
    ...toProgress(attempt),
  };
}
