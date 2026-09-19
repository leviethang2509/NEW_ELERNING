import 'reflect-metadata';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ClassLogAction,
  ClassroomStatus,
  CourseStatus,
  CurriculumItemLabel,
  CurriculumItemType,
  ExamStatus,
  MembershipStatus,
  TenantRole,
  TenantStatus,
  type ClassCurriculum,
  type ClassItemInput,
  type ClassItemView,
} from '@lang/shared';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { randomUUID } from 'node:crypto';
import type { AttemptsService } from '../attempts/attempts.service';
import { ExamAttempt } from '../attempts/exam-attempt.entity';
import { validationMessages } from '../common/validation';
import { Exam } from '../exams/exam.entity';
import { LessonAttempt } from '../lesson-attempts/lesson-attempt.entity';
import { Lesson } from '../lessons/lesson.entity';
import { MembershipRole } from '../memberships/membership-role.entity';
import { Membership } from '../memberships/membership.entity';
import type { TenantContext } from '../tenants/tenant-context';
import { InMemoryDataSource } from '../testing/in-memory-data-source';
import { InMemoryRepository } from '../testing/in-memory-repository';
import { assertLessonNotInUse } from '../training/content-usage';
import { CourseCurriculum } from '../training/course-curriculum.entity';
import { Course } from '../training/course.entity';
import { CoursesService } from '../training/courses.service';
import { CurriculaService } from '../training/curricula.service';
import { CurriculumGroup } from '../training/curriculum-group.entity';
import { CurriculumItem } from '../training/curriculum-item.entity';
import { Curriculum } from '../training/curriculum.entity';
import { User } from '../users/user.entity';
import { ClassChangeLog } from './class-change-log.entity';
import { ClassCurriculumService } from './class-curriculum.service';
import { ClassGroup } from './class-group.entity';
import { ClassItem } from './class-item.entity';
import { ClassMembersService } from './class-members.service';
import { ClassroomStudent } from './classroom-student.entity';
import { ClassroomTeacher } from './classroom-teacher.entity';
import { Classroom } from './classroom.entity';
import { ClassroomsService } from './classrooms.service';
import {
  ClassGroupInputDto,
  SaveClassCurriculumDto,
} from './dto/class-curriculum.dto';
import { CreateClassroomDto } from './dto/classroom.dto';

const TENANT = 'tenant-a';
const OWNER = 'user-owner';

const context = (
  roles: TenantRole[],
  membershipId: string,
  tenantId = TENANT,
): TenantContext => ({
  tenantId,
  slug: 'a',
  name: 'A',
  status: TenantStatus.ACTIVE,
  membershipId,
  roles,
});
const ownerCtx = context([TenantRole.TENANT_OWNER], 'm-owner');
const teacherCtx = context([TenantRole.TEACHER], 'm-teacher');
const otherTeacherCtx = context([TenantRole.TEACHER], 'm-teacher-2');

function setup() {
  const timestamps = () => ({ createdAt: new Date(), updatedAt: new Date() });
  const classrooms = new InMemoryRepository<Classroom>(timestamps);
  const teachers = new InMemoryRepository<ClassroomTeacher>(
    () => ({}),
    ['classroomId', 'membershipId'],
  );
  const students = new InMemoryRepository<ClassroomStudent>();
  const groups = new InMemoryRepository<ClassGroup>();
  const items = new InMemoryRepository<ClassItem>();
  const logs = new InMemoryRepository<ClassChangeLog>();
  const courses = new InMemoryRepository<Course>(timestamps);
  const links = new InMemoryRepository<CourseCurriculum>(
    () => ({}),
    ['courseId', 'curriculumId'],
  );
  const curricula = new InMemoryRepository<Curriculum>(timestamps);
  const curriculumGroups = new InMemoryRepository<CurriculumGroup>();
  const curriculumItems = new InMemoryRepository<CurriculumItem>();
  const lessons = new InMemoryRepository<Lesson>(() => ({ deletedAt: null }));
  const exams = new InMemoryRepository<Exam>(() => ({ deletedAt: null }));
  const memberships = new InMemoryRepository<Membership>(() => ({
    deletedAt: null,
    status: MembershipStatus.ACTIVE,
  }));
  const roles = new InMemoryRepository<MembershipRole>(
    () => ({}),
    ['membershipId', 'role'],
  );
  const users = new InMemoryRepository<User>(timestamps);
  const examAttempts = new InMemoryRepository<ExamAttempt>();
  const lessonAttempts = new InMemoryRepository<LessonAttempt>();

  const dataSource = new InMemoryDataSource()
    .register(Classroom, classrooms)
    .register(ClassroomTeacher, teachers)
    .register(ClassroomStudent, students)
    .register(ClassGroup, groups)
    .register(ClassItem, items)
    .register(ClassChangeLog, logs)
    .register(Course, courses)
    .register(CourseCurriculum, links)
    .register(Curriculum, curricula)
    .register(CurriculumGroup, curriculumGroups)
    .register(CurriculumItem, curriculumItems)
    .register(Lesson, lessons)
    .register(Exam, exams)
    .register(Membership, memberships)
    .register(MembershipRole, roles)
    .register(User, users)
    .register(ExamAttempt, examAttempts)
    .register(LessonAttempt, lessonAttempts)
    .asDataSource();

  const attemptsService = {
    finalizeForClassItems: jest.fn().mockResolvedValue(2),
  };
  const classroomsService = new ClassroomsService(
    dataSource,
    attemptsService as unknown as AttemptsService,
    classrooms.asRepository(),
    teachers.asRepository(),
    students.asRepository(),
    courses.asRepository(),
    memberships.asRepository(),
    users.asRepository(),
    logs.asRepository(),
  );
  const membersService = new ClassMembersService(dataSource);
  const curriculumService = new ClassCurriculumService(dataSource);
  const coursesService = new CoursesService(
    dataSource,
    {} as CurriculaService,
    courses.asRepository(),
    links.asRepository(),
    curricula.asRepository(),
    {} as never,
  );

  /** Thành viên có user và các role. */
  const addMember = (
    id: string,
    fullName: string,
    memberRoles: TenantRole[],
    status: MembershipStatus = MembershipStatus.ACTIVE,
  ) => {
    const userId = `user-${id}`;
    users.rows.push({
      id: userId,
      fullName,
      email: `${id}@example.com`,
    } as User);
    memberships.rows.push({
      id,
      tenantId: TENANT,
      userId,
      status,
      deletedAt: null,
    } as Membership);
    for (const role of memberRoles) {
      roles.rows.push({ membershipId: id, role, tenantId: TENANT });
    }
  };
  addMember('m-owner', 'Chủ', [TenantRole.TENANT_OWNER]);
  addMember('m-teacher', 'Giáo viên A', [TenantRole.TEACHER]);
  addMember('m-teacher-2', 'Giáo viên B', [TenantRole.TEACHER]);
  for (const n of [1, 2, 3]) {
    addMember(`m-student-${n}`, `Học viên ${n}`, [TenantRole.STUDENT]);
  }
  addMember('m-parent', 'Phụ huynh', [TenantRole.PARENT]);
  addMember(
    'm-inactive',
    'Học viên ngừng',
    [TenantRole.STUDENT],
    MembershipStatus.INACTIVE,
  );

  const content = (
    repository: InMemoryRepository<Lesson> | InMemoryRepository<Exam>,
    id: string,
    title: string,
    status: ExamStatus = ExamStatus.PUBLISHED,
  ) => {
    (repository.rows as { id: string }[]).push({
      id,
      tenantId: TENANT,
      title,
      status,
      deletedAt: null,
    } as never);
    return id;
  };
  const lesson1 = content(lessons, 'lesson-1', 'Minna bài 1');
  const lesson2 = content(lessons, 'lesson-2', 'Minna bài 2');
  const quiz = content(exams, 'exam-quiz', 'Kiểm tra chương 1');
  const final = content(exams, 'exam-final', 'Thi cuối khoá');
  content(exams, 'exam-draft', 'Nháp', ExamStatus.DRAFT);

  courses.rows.push(
    {
      id: 'course-n5',
      tenantId: TENANT,
      code: 'N5',
      name: 'Tiếng Nhật N5',
      status: CourseStatus.ACTIVE,
      plannedSessions: 24,
      ...timestamps(),
    } as Course,
    {
      id: 'course-old',
      tenantId: TENANT,
      code: 'OLD',
      name: 'Khoá cũ',
      status: CourseStatus.ARCHIVED,
      plannedSessions: null,
      ...timestamps(),
    } as Course,
  );
  // Giáo trình N5: 1 mục chưa xếp chương + chương "Chương 1" (bài 2, kiểm tra).
  curricula.rows.push(
    {
      id: 'cur-n5',
      tenantId: TENANT,
      name: 'Giáo trình N5',
      ...timestamps(),
    } as Curriculum,
    {
      id: 'cur-other',
      tenantId: TENANT,
      name: 'Khác',
      ...timestamps(),
    } as Curriculum,
  );
  links.rows.push({
    courseId: 'course-n5',
    curriculumId: 'cur-n5',
  } as CourseCurriculum);
  curriculumGroups.rows.push({
    id: 'cg-1',
    curriculumId: 'cur-n5',
    title: 'Chương 1',
    sortOrder: 0,
  });
  curriculumItems.rows.push(
    {
      id: 'ci-0',
      curriculumId: 'cur-n5',
      groupId: null,
      sortOrder: 0,
      itemType: CurriculumItemType.LESSON,
      lessonId: lesson1,
      examId: null,
      title: null,
      label: CurriculumItemLabel.LESSON,
      note: 'Buổi đầu',
    },
    {
      id: 'ci-2',
      curriculumId: 'cur-n5',
      groupId: 'cg-1',
      sortOrder: 1,
      itemType: CurriculumItemType.EXAM,
      lessonId: null,
      examId: quiz,
      title: null,
      label: CurriculumItemLabel.QUIZ,
      note: null,
    },
    {
      id: 'ci-1',
      curriculumId: 'cur-n5',
      groupId: 'cg-1',
      sortOrder: 0,
      itemType: CurriculumItemType.LESSON,
      lessonId: lesson2,
      examId: null,
      title: 'Bài 2',
      label: CurriculumItemLabel.HOMEWORK,
      note: null,
    },
  );

  /** Lớp N5 chép giáo trình, có Giáo viên A. */
  const createClass = async (extra: Partial<CreateClassroomDto> = {}) => {
    const detail = await classroomsService.create(ownerCtx, OWNER, {
      courseId: 'course-n5',
      code: 'N5-01',
      name: 'N5 tối 2-4',
      startDate: '2026-10-05',
      sourceCurriculumId: 'cur-n5',
      ...extra,
    } as CreateClassroomDto);
    await membersService.addTeachers(ownerCtx, OWNER, detail.id, ['m-teacher']);
    return detail;
  };

  return {
    classroomsService,
    membersService,
    curriculumService,
    coursesService,
    attemptsService,
    dataSource,
    classrooms,
    students,
    items,
    logs,
    examAttempts,
    lessonAttempts,
    lessons,
    ids: { lesson1, lesson2, quiz, final },
    createClass,
  };
}

/** Payload lưu từ giáo trình đang có (giữ nguyên), cho phép sửa trước khi gửi. */
function toInput(view: ClassItemView): ClassItemInput {
  return {
    id: view.id,
    itemType: view.itemType,
    contentId: view.content.id,
    title: view.title,
    label: view.label,
    note: view.note,
    opensAt: view.opensAt,
    deadlineAt: view.deadlineAt,
    acceptLate: view.acceptLate,
    passThreshold: view.passThreshold,
    retakeOfItemId: view.retakeOfItemId,
  };
}

function payload(
  curriculum: ClassCurriculum,
  change: (draft: {
    ungrouped: ClassItemInput[];
    groups: {
      id?: string;
      title: string;
      opensAt?: string | null;
      items: ClassItemInput[];
    }[];
  }) => void = () => undefined,
): SaveClassCurriculumDto {
  const draft = {
    ungrouped: curriculum.ungrouped.map(toInput),
    groups: curriculum.groups.map((group) => ({
      id: group.id,
      title: group.title,
      opensAt: group.opensAt,
      items: group.items.map(toInput),
    })),
  };
  change(draft);
  return {
    baseRevision: curriculum.revision,
    ...draft,
  } as SaveClassCurriculumDto;
}

const examItem = (
  contentId: string,
  extra: Partial<ClassItemInput> = {},
): ClassItemInput => ({
  itemType: CurriculumItemType.EXAM,
  contentId,
  label: CurriculumItemLabel.QUIZ,
  ...extra,
});

describe('ClassroomsService', () => {
  it('tạo lớp từ khoá học đang dùng: chép đúng giáo trình tham khảo, số buổi mặc định của khoá', async () => {
    const { classroomsService, curriculumService, logs, createClass } = setup();
    const detail = await createClass();

    expect(detail).toEqual(
      expect.objectContaining({
        code: 'N5-01',
        status: ClassroomStatus.UPCOMING,
        plannedSessions: 24,
        endDate: null,
        sourceCurriculum: { id: 'cur-n5', name: 'Giáo trình N5' },
        course: expect.objectContaining({ code: 'N5' }),
        canManage: true,
        hasActivity: false,
      }),
    );
    const curriculum = await curriculumService.get(ownerCtx, detail.id);
    expect(curriculum.revision).toBe(1);
    expect(
      curriculum.ungrouped.map((item) => [item.content.title, item.note]),
    ).toEqual([['Minna bài 1', 'Buổi đầu']]);
    expect(curriculum.groups).toEqual([
      expect.objectContaining({
        title: 'Chương 1',
        items: [
          expect.objectContaining({
            title: 'Bài 2',
            label: CurriculumItemLabel.HOMEWORK,
          }),
          expect.objectContaining({
            content: expect.objectContaining({ title: 'Kiểm tra chương 1' }),
            passThreshold: 50,
            acceptLate: true,
          }),
        ],
      }),
    ]);
    expect(logs.rows.map((row) => row.action)).toEqual([
      ClassLogAction.CREATED,
      ClassLogAction.TEACHERS_ADDED,
    ]);
    const listed = await classroomsService.getDetail(teacherCtx, detail.id);
    expect(listed.teachers).toEqual([
      { id: 'user-m-teacher', fullName: 'Giáo viên A' },
    ]);
    expect(listed.canManage).toBe(false);
  });

  it('khoá học lưu trữ, giáo trình không gắn khoá học, thiếu số buổi → 400; mã trùng → 409', async () => {
    const { classroomsService, createClass } = setup();
    const base = { code: 'X1', name: 'X', startDate: '2026-10-05' };
    await expect(
      classroomsService.create(ownerCtx, OWNER, {
        ...base,
        courseId: 'course-old',
        plannedSessions: 10,
      } as CreateClassroomDto),
    ).rejects.toThrow('Khoá học đã lưu trữ');
    await expect(
      classroomsService.create(ownerCtx, OWNER, {
        ...base,
        courseId: 'course-n5',
        sourceCurriculumId: 'cur-other',
      } as CreateClassroomDto),
    ).rejects.toBeInstanceOf(BadRequestException);

    await createClass();
    await expect(createClass({ name: 'Trùng mã' })).rejects.toBeInstanceOf(
      ConflictException,
    );

    const errors = await validate(
      plainToInstance(CreateClassroomDto, {
        ...base,
        courseId: randomUUID(),
        code: 'n5 01',
        startDate: '2026-02-30',
      }),
    );
    expect(validationMessages(errors)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Mã lớp chỉ gồm'),
        'Ngày bắt đầu không hợp lệ (YYYY-MM-DD)',
      ]),
    );
    // Mã tự in hoa.
    const lower = plainToInstance(CreateClassroomDto, {
      ...base,
      courseId: randomUUID(),
      code: 'n5-02',
    });
    expect(lower.code).toBe('N5-02');
  });

  it('Teacher ngoài lớp 403; giáo viên của lớp sửa giáo trình lớp; baseRevision cũ 409', async () => {
    const { classroomsService, curriculumService, createClass } = setup();
    const { id } = await createClass();

    await expect(
      classroomsService.getDetail(otherTeacherCtx, id),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      curriculumService.get(otherTeacherCtx, id),
    ).rejects.toBeInstanceOf(ForbiddenException);
    const current = await curriculumService.get(teacherCtx, id);
    expect(current.canEdit).toBe(true);
    await expect(
      curriculumService.save(
        otherTeacherCtx,
        'user-m-teacher-2',
        id,
        payload(current),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    const saved = await curriculumService.save(
      teacherCtx,
      'user-m-teacher',
      id,
      payload(current, (draft) => {
        draft.groups[0].items[1].deadlineAt = '2026-10-20T11:00:00.000Z';
        draft.groups[0].items[1].passThreshold = 70;
        draft.groups.push({
          title: 'Chương 2',
          items: [examItem('exam-final', { label: CurriculumItemLabel.FINAL })],
        });
      }),
    );
    expect(saved.revision).toBe(2);
    expect(saved.groups[0].items[1]).toEqual(
      expect.objectContaining({
        deadlineAt: '2026-10-20T11:00:00.000Z',
        passThreshold: 70,
      }),
    );
    expect(saved.groups[1].items[0].content.title).toBe('Thi cuối khoá');

    // Giữ bản cũ (revision 1) → 409.
    await expect(
      curriculumService.save(ownerCtx, OWNER, id, payload(current)),
    ).rejects.toBeInstanceOf(ConflictException);
    // Owner sửa được lớp không phụ trách.
    await expect(
      curriculumService.save(ownerCtx, OWNER, id, payload(saved)),
    ).resolves.toEqual(expect.objectContaining({ revision: 3 }));
  });

  it('mục mới phải publish, ngày mở trước deadline, nhãn đúng loại', async () => {
    const { curriculumService, createClass } = setup();
    const { id } = await createClass();
    const current = await curriculumService.get(ownerCtx, id);
    const save = (change: Parameters<typeof payload>[1]) =>
      curriculumService.save(ownerCtx, OWNER, id, payload(current, change));

    await expect(
      save((d) => d.ungrouped.push(examItem('exam-draft'))),
    ).rejects.toThrow('đã publish');
    await expect(
      save((d) =>
        d.ungrouped.push(
          examItem('exam-final', {
            opensAt: '2026-10-20T00:00:00.000Z',
            deadlineAt: '2026-10-19T00:00:00.000Z',
          }),
        ),
      ),
    ).rejects.toThrow('Deadline phải sau ngày mở');
    await expect(
      save((d) =>
        d.ungrouped.push(
          examItem('exam-final', { label: CurriculumItemLabel.LESSON }),
        ),
      ),
    ).rejects.toThrow('Nhãn không hợp');
    // Không đổi bài/đề của mục cũ.
    await expect(
      save((d) => (d.ungrouped[0].contentId = 'lesson-2')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('thi lại phải sau mục gốc (đề thi, không phải lần thi lại); trùng đề chỉ khi thi lại', async () => {
    const { curriculumService, createClass, ids } = setup();
    const { id } = await createClass();
    const current = await curriculumService.get(ownerCtx, id);
    const quizItemId = current.groups[0].items[1].id;
    const lessonItemId = current.ungrouped[0].id;
    const save = (change: Parameters<typeof payload>[1]) =>
      curriculumService.save(ownerCtx, OWNER, id, payload(current, change));

    // Cùng đề không gắn "Thi lại cho" → 400; cùng bài học → 400.
    await expect(
      save((d) => d.groups[0].items.push(examItem(ids.quiz))),
    ).rejects.toThrow('lần thi lại');
    await expect(
      save((d) =>
        d.groups[0].items.push({
          itemType: CurriculumItemType.LESSON,
          contentId: ids.lesson1,
          label: CurriculumItemLabel.LESSON,
        }),
      ),
    ).rejects.toThrow('Một bài học chỉ được thêm một lần');
    // Thi lại đứng trước mục gốc → 400.
    await expect(
      save((d) =>
        d.ungrouped.unshift(examItem(ids.quiz, { retakeOfItemId: quizItemId })),
      ),
    ).rejects.toThrow('đứng sau mục gốc');
    // Gắn vào mục bài học / lần thi lại khác → 400; mục bài học làm thi lại → 400.
    await expect(
      save((d) =>
        d.groups[0].items.push(
          examItem(ids.final, { retakeOfItemId: lessonItemId }),
        ),
      ),
    ).rejects.toThrow('mục đề thi gốc');
    const retakeId = randomUUID();
    await expect(
      save((d) =>
        d.groups[0].items.push(
          examItem(ids.final, { id: retakeId, retakeOfItemId: quizItemId }),
          examItem(ids.final, { retakeOfItemId: retakeId }),
        ),
      ),
    ).rejects.toThrow('mục đề thi gốc');
    await expect(
      save((d) =>
        d.groups[0].items.push({
          itemType: CurriculumItemType.LESSON,
          contentId: ids.lesson1,
          label: CurriculumItemLabel.LESSON,
          retakeOfItemId: quizItemId,
        }),
      ),
    ).rejects.toThrow('Chỉ mục đề thi');
    // Gắn vào mục không còn trong giáo trình → 400.
    await expect(
      save((d) =>
        d.groups[0].items.push(
          examItem(ids.final, { retakeOfItemId: randomUUID() }),
        ),
      ),
    ).rejects.toThrow('không còn trong giáo trình');

    // Hợp lệ: 2 lần thi lại cùng đề gốc + 1 lần thi lại đề khác, sang chương khác.
    const saved = await save((d) => {
      d.groups[0].items.push(
        examItem(ids.quiz, { retakeOfItemId: quizItemId }),
      );
      d.groups.push({
        title: 'Thi lại',
        items: [
          examItem(ids.quiz, { retakeOfItemId: quizItemId }),
          examItem(ids.final, { retakeOfItemId: quizItemId }),
        ],
      });
    });
    expect(
      [...saved.groups[0].items, ...saved.groups[1].items]
        .filter((item) => item.retakeOfItemId)
        .map((item) => [item.content.title, item.retakeOfItemId]),
    ).toEqual([
      ['Kiểm tra chương 1', quizItemId],
      ['Kiểm tra chương 1', quizItemId],
      ['Thi cuối khoá', quizItemId],
    ]);
  });

  it('xoá mục: có bài làm → ẩn, chưa có → xoá hẳn; gửi lại mục ẩn → khôi phục; nhật ký ghi thay đổi', async () => {
    const { curriculumService, createClass, items, examAttempts, logs } =
      setup();
    const { id } = await createClass();
    const current = await curriculumService.get(ownerCtx, id);
    const [lessonItem] = current.ungrouped;
    const [homework, quizItem] = current.groups[0].items;
    examAttempts.rows.push({
      id: 'a1',
      classItemId: quizItem.id,
      userId: 'user-m-student-1',
    } as ExamAttempt);
    examAttempts.rows.push({
      id: 'a2',
      classItemId: quizItem.id,
      userId: 'user-m-student-1',
    } as ExamAttempt);

    const saved = await curriculumService.save(
      ownerCtx,
      OWNER,
      id,
      payload(current, (draft) => {
        draft.groups = [];
        draft.ungrouped = [
          { ...toInput(homework), note: 'Làm ở nhà' },
          toInput(lessonItem),
        ];
      }),
    );
    expect(saved.groups).toEqual([]);
    expect(saved.ungrouped.map((item) => item.id)).toEqual([
      homework.id,
      lessonItem.id,
    ]);
    expect(saved.removed).toEqual([
      expect.objectContaining({
        id: quizItem.id,
        learnerCount: 1,
        removedAt: expect.any(String),
      }),
    ]);
    expect(items.rows).toHaveLength(3);
    const log = logs.rows.find(
      (row) => row.action === ClassLogAction.CURRICULUM_SAVED,
    )!;
    expect(log.detail).toEqual({
      hidden: ['Kiểm tra chương 1'],
      changed: [{ title: 'Bài 2', fields: ['note', 'group'] }],
      groupsRemoved: ['Chương 1'],
      reordered: true,
    });

    // Khôi phục mục ẩn; xoá mục bài học chưa có bài làm → xoá hẳn.
    const restored = await curriculumService.save(
      ownerCtx,
      OWNER,
      id,
      payload(saved, (draft) => {
        draft.ungrouped = [draft.ungrouped[0], toInput(saved.removed[0])];
      }),
    );
    expect(restored.ungrouped.map((item) => item.content.title)).toEqual([
      'Minna bài 2',
      'Kiểm tra chương 1',
    ]);
    expect(restored.removed).toEqual([]);
    expect(items.rows.map((row) => row.id).sort()).toEqual(
      [homework.id, quizItem.id].sort(),
    );
    expect(logs.rows.at(-1)!.detail).toEqual(
      expect.objectContaining({
        restored: ['Kiểm tra chương 1'],
        removed: ['Minna bài 1'],
      }),
    );
  });

  it('sĩ số: đủ thì chặn thêm, xoá mềm rồi thêm lại khôi phục; chỉ thành viên đúng role, đang hoạt động', async () => {
    const { membersService, classroomsService, students, createClass } =
      setup();
    const { id } = await createClass({ maxStudents: 2 });

    await expect(
      membersService.addStudents(ownerCtx, OWNER, id, [
        'm-student-1',
        'm-student-2',
        'm-student-3',
      ]),
    ).rejects.toThrow('Lớp chỉ còn 2 chỗ');
    const members = await membersService.addStudents(ownerCtx, OWNER, id, [
      'm-student-1',
      'm-student-2',
    ]);
    expect(members.students.map((row) => row.fullName)).toEqual([
      'Học viên 1',
      'Học viên 2',
    ]);
    await expect(
      membersService.addStudents(ownerCtx, OWNER, id, ['m-student-3']),
    ).rejects.toThrow('Lớp đã đủ sĩ số (2/2)');
    // Thêm lại người đã có: không tính thêm chỗ.
    await expect(
      membersService.addStudents(ownerCtx, OWNER, id, ['m-student-1']),
    ).resolves.toBeDefined();

    await membersService.removeStudent(ownerCtx, OWNER, id, 'm-student-1');
    const row = students.rows.find((r) => r.membershipId === 'm-student-1')!;
    expect(row.removedAt).toBeInstanceOf(Date);
    const afterAdd = await membersService.addStudents(ownerCtx, OWNER, id, [
      'm-student-3',
    ]);
    expect(
      afterAdd.students.map((r) => [r.fullName, r.removedAt === null]),
    ).toEqual([
      ['Học viên 2', true],
      ['Học viên 3', true],
      ['Học viên 1', false],
    ]);
    await expect(
      membersService.addStudents(ownerCtx, OWNER, id, ['m-student-1']),
    ).rejects.toThrow('đủ sĩ số');
    await classroomsService.update(ownerCtx, OWNER, id, { maxStudents: 3 });
    await membersService.addStudents(ownerCtx, OWNER, id, ['m-student-1']);
    expect(students.rows).toHaveLength(3);
    expect(row.id).toBe(
      students.rows.find((r) => r.membershipId === 'm-student-1')!.id,
    );

    await expect(
      membersService.addStudents(ownerCtx, OWNER, id, ['m-parent']),
    ).rejects.toThrow('không có vai trò Học viên');
    await expect(
      membersService.addStudents(ownerCtx, OWNER, id, ['m-inactive']),
    ).rejects.toThrow('đang bị ngừng');
    await expect(
      membersService.addTeachers(ownerCtx, OWNER, id, ['m-student-2']),
    ).rejects.toThrow('không có vai trò Giáo viên');
    await expect(
      membersService.addStudents(ownerCtx, OWNER, id, [randomUUID()]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('học viên đang học lớp khác cùng khoá học hiện cảnh báo', async () => {
    const { membersService, createClass } = setup();
    const first = await createClass();
    const second = await createClass({ code: 'N5-02' });
    await membersService.addStudents(ownerCtx, OWNER, first.id, [
      'm-student-1',
    ]);
    const members = await membersService.addStudents(
      ownerCtx,
      OWNER,
      second.id,
      ['m-student-1', 'm-student-2'],
    );
    expect(
      members.students.map((row) => [
        row.fullName,
        row.otherClasses.map((c) => c.code),
      ]),
    ).toEqual([
      ['Học viên 1', ['N5-01']],
      ['Học viên 2', []],
    ]);
  });

  it('đổi trạng thái: kết thúc chốt lượt thi, khoá giáo trình và thành viên; mở lại được; huỷ là cuối', async () => {
    const {
      classroomsService,
      membersService,
      curriculumService,
      attemptsService,
      logs,
      createClass,
      dataSource,
    } = setup();
    const { id } = await createClass();
    const curriculum = await curriculumService.get(ownerCtx, id);

    await expect(
      classroomsService.changeStatus(
        ownerCtx,
        OWNER,
        id,
        ClassroomStatus.FINISHED,
      ),
    ).rejects.toThrow('Không chuyển được lớp từ "Sắp mở" sang "Đã kết thúc"');
    await classroomsService.changeStatus(
      ownerCtx,
      OWNER,
      id,
      ClassroomStatus.ONGOING,
    );
    const finished = await classroomsService.changeStatus(
      ownerCtx,
      OWNER,
      id,
      ClassroomStatus.FINISHED,
    );
    expect(finished.status).toBe(ClassroomStatus.FINISHED);
    expect(finished.canEditCurriculum).toBe(false);
    expect(attemptsService.finalizeForClassItems).toHaveBeenCalledWith(
      dataSource.manager,
      expect.arrayContaining([
        curriculum.ungrouped[0].id,
        curriculum.groups[0].items[1].id,
      ]),
    );
    expect(logs.rows.at(-1)!.detail).toEqual({
      from: 'ongoing',
      to: 'finished',
      finalizedAttempts: 2,
    });

    await expect(
      curriculumService.save(
        teacherCtx,
        'user-m-teacher',
        id,
        payload(curriculum),
      ),
    ).rejects.toThrow('đã kết thúc hoặc đã huỷ');
    await expect(
      membersService.addStudents(ownerCtx, OWNER, id, ['m-student-1']),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      membersService.removeTeacher(ownerCtx, OWNER, id, 'm-teacher'),
    ).rejects.toBeInstanceOf(ConflictException);
    // Thông tin lớp vẫn sửa được.
    await expect(
      classroomsService.update(ownerCtx, OWNER, id, { location: 'Phòng 2' }),
    ).resolves.toEqual(expect.objectContaining({ location: 'Phòng 2' }));

    // Mở lại → sửa giáo trình được; huỷ → không chuyển đi đâu được nữa.
    await classroomsService.changeStatus(
      ownerCtx,
      OWNER,
      id,
      ClassroomStatus.ONGOING,
    );
    await expect(
      curriculumService.save(
        teacherCtx,
        'user-m-teacher',
        id,
        payload(curriculum),
      ),
    ).resolves.toBeDefined();
    await classroomsService.changeStatus(
      ownerCtx,
      OWNER,
      id,
      ClassroomStatus.CANCELLED,
    );
    expect(attemptsService.finalizeForClassItems).toHaveBeenCalledTimes(2);
    for (const status of [
      ClassroomStatus.UPCOMING,
      ClassroomStatus.ONGOING,
      ClassroomStatus.FINISHED,
    ]) {
      await expect(
        classroomsService.changeStatus(ownerCtx, OWNER, id, status),
      ).rejects.toBeInstanceOf(ConflictException);
    }
  });

  it('xoá lớp chỉ khi chưa có bài làm; khoá học có lớp và bài học trong lớp không xoá được', async () => {
    const {
      classroomsService,
      coursesService,
      curriculumService,
      lessonAttempts,
      classrooms,
      dataSource,
      createClass,
      ids,
    } = setup();
    const first = await createClass();
    const second = await createClass({ code: 'N5-02' });
    const curriculum = await curriculumService.get(ownerCtx, first.id);
    lessonAttempts.rows.push({
      id: 'la-1',
      classItemId: curriculum.ungrouped[0].id,
      userId: 'user-m-student-1',
    } as LessonAttempt);

    const detail = await classroomsService.getDetail(ownerCtx, first.id);
    expect(detail.hasActivity).toBe(true);
    await expect(classroomsService.remove(ownerCtx, first.id)).rejects.toThrow(
      'Lớp đã có bài làm',
    );
    await classroomsService.remove(ownerCtx, second.id);
    expect(classrooms.rows.map((row) => row.id)).toEqual([first.id]);

    await expect(coursesService.remove(ownerCtx, 'course-n5')).rejects.toThrow(
      'Khoá học đã có lớp học',
    );
    await expect(
      assertLessonNotInUse(dataSource.manager, ids.lesson1),
    ).rejects.toThrow('giáo trình');
  });

  it('DTO giáo trình lớp: ngưỡng đậu 0–100, ngày giờ ISO', async () => {
    const errors = await validate(
      plainToInstance(ClassGroupInputDto, {
        title: 'Chương',
        opensAt: '20/10/2026',
        items: [
          examItem(randomUUID(), { passThreshold: 120, deadlineAt: 'x' }),
        ],
      }),
    );
    expect(validationMessages(errors)).toEqual(
      expect.arrayContaining([
        'Ngày mở của chương không hợp lệ',
        'Ngưỡng đậu từ 0 đến 100',
        'Deadline không hợp lệ',
      ]),
    );
  });
});
