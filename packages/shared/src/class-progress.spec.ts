import {
  AttendanceMark,
  ClassAttemptState,
  ClassItemLock,
  ClassroomStatus,
  CurriculumItemType,
  attemptScorePercent,
  attendanceMarkOf,
  attendanceRate,
  autoScorePercent,
  averagePercent,
  classItemLock,
  effectiveOpensAt,
  examGroupResult,
  isBelowAttendanceThreshold,
  isGroupMemberRequired,
  type AttendanceItemInput,
  type ClassAttemptSummary,
  type ClassItemGateInput,
  type ExamGroupMember,
} from './index';

const NOW = new Date('2026-10-20T10:00:00.000Z');

function attempt(over: Partial<ClassAttemptSummary> = {}): ClassAttemptSummary {
  return {
    id: 'a1',
    state: ClassAttemptState.GRADED,
    startedAt: '2026-10-19T10:00:00.000Z',
    submittedAt: '2026-10-19T11:00:00.000Z',
    percent: 60,
    passed: true,
    ...over,
  };
}

function member(over: Partial<ExamGroupMember> = {}): ExamGroupMember {
  return { itemId: 'i1', passThreshold: 50, attempt: null, ...over };
}

describe('attemptScorePercent', () => {
  it('chỉ có câu tự chấm', () => {
    expect(
      attemptScorePercent({
        autoCorrect: 8,
        autoTotal: 10,
        manualScore: 0,
        manualCount: 0,
      }),
    ).toBe(80);
  });

  it('câu chấm tay nặng bằng 10 câu tự chấm (R8.1)', () => {
    // 6 câu đúng + 7 điểm chấm tay trên (10 + 1×10) = 13/20 = 65%.
    expect(
      attemptScorePercent({
        autoCorrect: 6,
        autoTotal: 10,
        manualScore: 7,
        manualCount: 1,
      }),
    ).toBe(65);
  });

  it('câu chấm tay chưa chấm tính 0 điểm', () => {
    expect(
      attemptScorePercent({
        autoCorrect: 10,
        autoTotal: 10,
        manualScore: 0,
        manualCount: 1,
      }),
    ).toBe(50);
  });

  it('làm tròn 1 chữ số thập phân', () => {
    expect(
      attemptScorePercent({
        autoCorrect: 1,
        autoTotal: 3,
        manualScore: 0,
        manualCount: 0,
      }),
    ).toBe(33.3);
  });

  it('đề không có câu nào → null', () => {
    expect(
      attemptScorePercent({
        autoCorrect: 0,
        autoTotal: 0,
        manualScore: 0,
        manualCount: 0,
      }),
    ).toBeNull();
  });
});

describe('examGroupResult', () => {
  it('chưa có lượt nào', () => {
    expect(examGroupResult([member(), member({ itemId: 'i2' })])).toEqual({
      bestPercent: null,
      passed: false,
      hasPending: false,
    });
  });

  it('lấy điểm cao nhất bất kể đậu hay trượt (R7.4)', () => {
    const result = examGroupResult([
      member({ attempt: attempt({ percent: 40, passed: false }) }),
      member({
        itemId: 'i2',
        attempt: attempt({ id: 'a2', percent: 75, passed: true }),
      }),
    ]);
    expect(result).toEqual({
      bestPercent: 75,
      passed: true,
      hasPending: false,
    });
  });

  it('đậu nhóm khi có 1 lượt đạt ngưỡng dù lượt sau điểm thấp hơn (T3.3)', () => {
    const result = examGroupResult([
      member({ attempt: attempt({ percent: 80, passed: true }) }),
      member({
        itemId: 'i2',
        attempt: attempt({ id: 'a2', percent: 30, passed: false }),
      }),
    ]);
    expect(result.passed).toBe(true);
    expect(result.bestPercent).toBe(80);
  });

  it('lượt chờ chấm không tính điểm nhưng báo hasPending (T3.1)', () => {
    const result = examGroupResult([
      member({
        attempt: attempt({
          state: ClassAttemptState.PENDING_GRADING,
          percent: null,
          passed: null,
        }),
      }),
      member({
        itemId: 'i2',
        attempt: attempt({ id: 'a2', percent: 55, passed: true }),
      }),
    ]);
    expect(result).toEqual({
      bestPercent: 55,
      passed: true,
      hasPending: true,
    });
  });

  it('lượt đang làm dở không tính và không phải chờ chấm', () => {
    const result = examGroupResult([
      member({
        attempt: attempt({
          state: ClassAttemptState.IN_PROGRESS,
          submittedAt: null,
          percent: null,
          passed: null,
        }),
      }),
    ]);
    expect(result).toEqual({
      bestPercent: null,
      passed: false,
      hasPending: false,
    });
  });
});

describe('isGroupMemberRequired', () => {
  const root = member({ itemId: 'root' });
  const retake = member({ itemId: 'retake' });
  const retake2 = member({ itemId: 'retake2' });

  it('mục gốc luôn bắt buộc', () => {
    expect(isGroupMemberRequired([root, retake], 'root')).toBe(true);
  });

  it('chưa làm lần trước → lần thi lại bắt buộc (T2.3)', () => {
    expect(isGroupMemberRequired([root, retake], 'retake')).toBe(true);
  });

  it('trượt lần trước → lần thi lại bắt buộc', () => {
    const failed = member({
      itemId: 'root',
      attempt: attempt({ percent: 20, passed: false }),
    });
    expect(isGroupMemberRequired([failed, retake], 'retake')).toBe(true);
  });

  it('đã đậu lần trước → lần thi lại không bắt buộc (T2.1)', () => {
    const passed = member({ itemId: 'root', attempt: attempt() });
    expect(isGroupMemberRequired([passed, retake], 'retake')).toBe(false);
  });

  it('đậu ở lần 2 làm lần 3 không bắt buộc, lần 2 vẫn bắt buộc', () => {
    const members = [
      member({ itemId: 'root', attempt: attempt({ passed: false }) }),
      member({ itemId: 'retake', attempt: attempt({ id: 'a2' }) }),
      retake2,
    ];
    expect(isGroupMemberRequired(members, 'retake')).toBe(true);
    expect(isGroupMemberRequired(members, 'retake2')).toBe(false);
  });

  it('lượt chờ chấm chưa biết đậu → lần sau vẫn bắt buộc', () => {
    const pending = member({
      itemId: 'root',
      attempt: attempt({
        state: ClassAttemptState.PENDING_GRADING,
        percent: null,
        passed: null,
      }),
    });
    expect(isGroupMemberRequired([pending, retake], 'retake')).toBe(true);
  });

  it('mục không thuộc nhóm → bắt buộc', () => {
    expect(isGroupMemberRequired([root], 'khac')).toBe(true);
  });
});

describe('effectiveOpensAt', () => {
  const som = '2026-10-19T11:00:00.000Z';
  const muon = '2026-10-20T13:00:00.000Z';

  it('lấy mốc muộn hơn khi cả chương và mục đều đặt', () => {
    expect(effectiveOpensAt(som, muon)).toBe(muon);
    expect(effectiveOpensAt(muon, som)).toBe(muon);
  });

  it('chỉ một bên đặt thì lấy bên đó', () => {
    expect(effectiveOpensAt(null, som)).toBe(som);
    expect(effectiveOpensAt(som, null)).toBe(som);
    expect(effectiveOpensAt(null, null)).toBeNull();
  });
});

describe('classItemLock', () => {
  function gate(over: Partial<ClassItemGateInput> = {}): ClassItemGateInput {
    return {
      classroomStatus: ClassroomStatus.ONGOING,
      itemType: CurriculumItemType.EXAM,
      opensAt: null,
      deadlineAt: null,
      acceptLate: true,
      hasAttempt: false,
      contentAvailable: true,
      ...over,
    };
  }

  it('lớp đang học, mục mở → vào được', () => {
    expect(classItemLock(gate(), NOW)).toBeNull();
  });

  it.each([
    ClassroomStatus.UPCOMING,
    ClassroomStatus.FINISHED,
    ClassroomStatus.CANCELLED,
  ])('lớp %s → khoá theo lớp (giả định 3)', (status) => {
    expect(classItemLock(gate({ classroomStatus: status }), NOW)).toBe(
      ClassItemLock.CLASSROOM,
    );
  });

  it('chưa tới ngày mở (R9)', () => {
    expect(
      classItemLock(gate({ opensAt: '2026-10-20T11:00:00.000Z' }), NOW),
    ).toBe(ClassItemLock.NOT_OPEN);
  });

  it('đúng mốc mở thì vào được', () => {
    expect(classItemLock(gate({ opensAt: NOW.toISOString() }), NOW)).toBeNull();
  });

  it('mục đề thi đã có lượt → mỗi mục 1 lần (E4.3)', () => {
    expect(classItemLock(gate({ hasAttempt: true }), NOW)).toBe(
      ClassItemLock.DONE,
    );
  });

  it('quá deadline mà không nhận bài quá hạn (R10.1)', () => {
    expect(
      classItemLock(
        gate({ acceptLate: false, deadlineAt: '2026-10-20T09:00:00.000Z' }),
        NOW,
      ),
    ).toBe(ClassItemLock.DEADLINE);
  });

  it('quá deadline nhưng vẫn nhận bài quá hạn', () => {
    expect(
      classItemLock(gate({ deadlineAt: '2026-10-20T09:00:00.000Z' }), NOW),
    ).toBeNull();
  });

  it('bài học: deadline chỉ để nhắc, học lại được nhiều lần', () => {
    const lesson = gate({
      itemType: CurriculumItemType.LESSON,
      acceptLate: false,
      deadlineAt: '2026-10-20T09:00:00.000Z',
      hasAttempt: true,
    });
    expect(classItemLock(lesson, NOW)).toBeNull();
  });

  it('bài học/đề thi đã xoá → khoá mục', () => {
    expect(classItemLock(gate({ contentAvailable: false }), NOW)).toBe(
      ClassItemLock.CONTENT,
    );
  });
});

// ---------------------------------------------------------------------------
// Chuyên cần (Step 11)

const DEADLINE = '2026-10-19T17:00:00.000Z';

function attendanceItem(
  over: Partial<AttendanceItemInput> = {},
): AttendanceItemInput {
  return {
    deadlineAt: DEADLINE,
    removed: false,
    required: true,
    attempt: null,
    ...over,
  };
}

const started = (
  startedAt: string,
  state: ClassAttemptState = ClassAttemptState.GRADED,
) => ({ state, startedAt });

describe('attendanceMarkOf', () => {
  it('bắt đầu trước hạn và đã nộp → đúng hạn (dù nộp sau hạn)', () => {
    expect(
      attendanceMarkOf(
        attendanceItem({ attempt: started('2026-10-19T16:30:00.000Z') }),
        NOW,
      ),
    ).toBe(AttendanceMark.ON_TIME);
  });

  it('chưa chấm xong vẫn tính là đã nộp (E7.2)', () => {
    expect(
      attendanceMarkOf(
        attendanceItem({
          attempt: started(
            '2026-10-19T10:00:00.000Z',
            ClassAttemptState.PENDING_GRADING,
          ),
        }),
        NOW,
      ),
    ).toBe(AttendanceMark.ON_TIME);
  });

  it('bắt đầu sau hạn → muộn', () => {
    expect(
      attendanceMarkOf(
        attendanceItem({ attempt: started('2026-10-19T17:00:00.001Z') }),
        NOW,
      ),
    ).toBe(AttendanceMark.LATE);
  });

  it('quá hạn chưa làm → không nộp', () => {
    expect(attendanceMarkOf(attendanceItem(), NOW)).toBe(AttendanceMark.MISSED);
  });

  it('chưa tới hạn, chưa làm → chưa tính', () => {
    expect(
      attendanceMarkOf(
        attendanceItem({ deadlineAt: '2026-10-25T17:00:00.000Z' }),
        NOW,
      ),
    ).toBe(AttendanceMark.PENDING);
  });

  it('đang làm dở → chưa tính (lượt bỏ dở sẽ bị chốt)', () => {
    expect(
      attendanceMarkOf(
        attendanceItem({
          attempt: started(
            '2026-10-19T16:00:00.000Z',
            ClassAttemptState.IN_PROGRESS,
          ),
        }),
        NOW,
      ),
    ).toBe(AttendanceMark.IN_PROGRESS);
  });

  it('mục không có deadline → không tính', () => {
    expect(attendanceMarkOf(attendanceItem({ deadlineAt: null }), NOW)).toBe(
      AttendanceMark.EXCLUDED,
    );
  });

  it('mục đã bỏ khỏi giáo trình lớp → không tính (E3)', () => {
    expect(attendanceMarkOf(attendanceItem({ removed: true }), NOW)).toBe(
      AttendanceMark.EXCLUDED,
    );
  });

  it('lần thi lại không bắt buộc → không tính (T2.2)', () => {
    const item = attendanceItem({
      required: false,
      attempt: started('2026-10-19T18:00:00.000Z'),
    });
    expect(attendanceMarkOf(item, NOW)).toBe(AttendanceMark.EXCLUDED);
  });

  it('đổi deadline sang tương lai: mục quá hạn thành chưa tính', () => {
    const missed = attendanceItem();
    expect(attendanceMarkOf(missed, NOW)).toBe(AttendanceMark.MISSED);
    expect(
      attendanceMarkOf(
        { ...missed, deadlineAt: '2026-10-21T17:00:00.000Z' },
        NOW,
      ),
    ).toBe(AttendanceMark.PENDING);
  });

  it('lượt đã "Cho làm lại" không truyền vào → coi như chưa làm', () => {
    // Service chỉ đưa lượt còn hiệu lực (`voided_at IS NULL`) vào `attempt`.
    expect(attendanceMarkOf(attendanceItem({ attempt: null }), NOW)).toBe(
      AttendanceMark.MISSED,
    );
  });
});

describe('attendanceRate', () => {
  it('đúng hạn 1, muộn k, quá hạn 0; mục khác không vào mẫu số', () => {
    const rate = attendanceRate(
      [
        AttendanceMark.ON_TIME,
        AttendanceMark.ON_TIME,
        AttendanceMark.LATE,
        AttendanceMark.MISSED,
        AttendanceMark.PENDING,
        AttendanceMark.IN_PROGRESS,
        AttendanceMark.EXCLUDED,
      ],
      0.5,
    );
    expect(rate).toEqual({
      onTime: 2,
      late: 1,
      missed: 1,
      counted: 4,
      score: 2.5,
      percent: 62.5,
    });
  });

  it('chưa có mục nào được tính → không có tỉ lệ', () => {
    const rate = attendanceRate([AttendanceMark.PENDING], 0.5);
    expect(rate.counted).toBe(0);
    expect(rate.percent).toBeNull();
  });

  it('làm tròn 1 chữ số thập phân', () => {
    const rate = attendanceRate(
      [AttendanceMark.ON_TIME, AttendanceMark.LATE, AttendanceMark.MISSED],
      0.5,
    );
    expect(rate.percent).toBe(50);
    expect(
      attendanceRate(
        [AttendanceMark.ON_TIME, AttendanceMark.ON_TIME, AttendanceMark.MISSED],
        0.5,
      ).percent,
    ).toBe(66.7);
  });

  it('k = 0 (không tính bài muộn) và k = 1', () => {
    const marks = [AttendanceMark.ON_TIME, AttendanceMark.LATE];
    expect(attendanceRate(marks, 0).percent).toBe(50);
    expect(attendanceRate(marks, 1).percent).toBe(100);
  });
});

describe('isBelowAttendanceThreshold', () => {
  it('dưới ngưỡng thì cảnh báo, bằng ngưỡng thì không', () => {
    expect(isBelowAttendanceThreshold(69.9, 70)).toBe(true);
    expect(isBelowAttendanceThreshold(70, 70)).toBe(false);
  });

  it('chưa có tỉ lệ thì không cảnh báo', () => {
    expect(isBelowAttendanceThreshold(null, 70)).toBe(false);
  });
});

describe('averagePercent', () => {
  it('bỏ qua mục chưa có điểm', () => {
    expect(averagePercent([80, null, 50])).toBe(65);
  });

  it('không có điểm nào → null', () => {
    expect(averagePercent([null, null])).toBeNull();
    expect(averagePercent([])).toBeNull();
  });

  it('làm tròn 1 chữ số thập phân', () => {
    expect(averagePercent([100, 50, 50])).toBe(66.7);
  });
});

describe('autoScorePercent', () => {
  it('% câu tự chấm đúng', () => {
    expect(autoScorePercent(3, 4)).toBe(75);
  });

  it('không có câu tự chấm → null', () => {
    expect(autoScorePercent(0, 0)).toBeNull();
  });
});
