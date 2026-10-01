import {
  findSessionOverlaps,
  heldSessionCount,
  isValidCalendarRange,
  recomputeSchedule,
  slotOccurrences,
  trainingDateOf,
  trainingDateTimeToIso,
  trainingMonthStartOf,
  trainingTimeOf,
  validateScheduleSlots,
  weekdayOf,
  type DateRange,
  type RecomputeScheduleInput,
  type RegularSessionState,
  type ScheduleSlot,
} from './schedule';

// Bảng ví dụ ở bối cảnh T4 (req-3-question-r4): T2 + T4, 10 buổi, bắt đầu T2 05/01.
const MON_WED: ScheduleSlot[] = [
  { weekday: 1, startTime: '18:00', endTime: '19:30' },
  { weekday: 3, startTime: '18:00', endTime: '19:30' },
];
const BEFORE_START = new Date('2026-01-01T00:00:00+07:00');

function base(
  overrides: Partial<RecomputeScheduleInput> = {},
): RecomputeScheduleInput {
  return {
    startDate: '2026-01-05',
    plannedSessions: 10,
    slots: MON_WED,
    holidays: [],
    sessions: [],
    now: BEFORE_START,
    ...overrides,
  };
}

/** Áp kết quả tính lại lên danh sách buổi như service ghi DB. */
function apply(
  sessions: RegularSessionState[],
  input: RecomputeScheduleInput,
): RegularSessionState[] {
  const result = recomputeSchedule({ ...input, sessions });
  const removed = new Set(result.removed.map((row) => row.id));
  const changed = new Map(result.changed.map((row) => [row.id, row]));
  return [
    ...sessions
      .filter((session) => !removed.has(session.id))
      .map((session) => {
        const change = changed.get(session.id);
        return change
          ? {
              ...session,
              startsAt: change.startsAt,
              endsAt: change.endsAt,
              timeOverridden: false,
              movedWarning: change.movedWarning,
            }
          : session;
      }),
    ...result.created.map((row) => ({
      id: `s${row.seq}`,
      seq: row.seq,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      timeOverridden: false,
      customTeachers: false,
      movedWarning: false,
    })),
  ].sort((a, b) => a.seq - b.seq);
}

function dates(sessions: RegularSessionState[]): string[] {
  return sessions.map((session) => trainingDateOf(session.startsAt));
}

const NO_HOLIDAY_DATES = [
  '2026-01-05',
  '2026-01-07',
  '2026-01-12',
  '2026-01-14',
  '2026-01-19',
  '2026-01-21',
  '2026-01-26',
  '2026-01-28',
  '2026-02-02',
  '2026-02-04',
];

describe('ngày giờ theo +07:00', () => {
  it('đổi ngày/giờ theo giờ Việt Nam', () => {
    expect(trainingDateOf('2026-01-04T17:30:00Z')).toBe('2026-01-05');
    expect(trainingTimeOf('2026-01-04T17:30:00Z')).toBe('00:30');
    expect(trainingDateTimeToIso('2026-01-05', '18:00')).toBe(
      '2026-01-05T11:00:00.000Z',
    );
  });

  it('đầu tháng theo giờ Việt Nam', () => {
    expect(trainingMonthStartOf('2026-10-15T08:00:00Z')).toBe(
      '2026-09-30T17:00:00.000Z',
    );
    // 31/10 18:00 UTC đã là 01/11 theo giờ Việt Nam.
    expect(trainingMonthStartOf('2026-10-31T18:00:00Z')).toBe(
      '2026-10-31T17:00:00.000Z',
    );
  });

  it('thứ trong tuần 1 = T2 … 7 = CN', () => {
    expect(weekdayOf('2026-01-05')).toBe(1);
    expect(weekdayOf('2026-01-11')).toBe(7);
  });

  it('khoảng ngày của lịch', () => {
    expect(isValidCalendarRange('2026-01-01', '2026-01-31')).toBe(true);
    expect(isValidCalendarRange('2026-01-31', '2026-01-01')).toBe(false);
    expect(isValidCalendarRange('2026-01-01', '2026-06-01')).toBe(false);
  });
});

describe('validateScheduleSlots', () => {
  it('chấp nhận 2 ô cùng ngày không chồng nhau', () => {
    expect(
      validateScheduleSlots([
        { weekday: 1, startTime: '08:00', endTime: '09:30' },
        { weekday: 1, startTime: '09:30', endTime: '11:00' },
      ]),
    ).toBeNull();
  });

  it.each<[ScheduleSlot[], string]>([
    [[{ weekday: 0, startTime: '08:00', endTime: '09:00' }], 'weekday'],
    [[{ weekday: 8, startTime: '08:00', endTime: '09:00' }], 'weekday'],
    [[{ weekday: 1, startTime: '8:00', endTime: '09:00' }], 'time'],
    [[{ weekday: 1, startTime: '24:00', endTime: '09:00' }], 'time'],
    [[{ weekday: 1, startTime: '09:00', endTime: '09:00' }], 'order'],
    [
      [
        { weekday: 2, startTime: '08:00', endTime: '10:00' },
        { weekday: 2, startTime: '09:00', endTime: '11:00' },
      ],
      'overlap',
    ],
  ])('%j → %s', (slots, error) => {
    expect(validateScheduleSlots(slots)).toBe(error);
  });
});

describe('slotOccurrences', () => {
  it('theo thứ tự thời gian, 2 ô cùng ngày theo giờ, bỏ ngày nghỉ', () => {
    const slots: ScheduleSlot[] = [
      { weekday: 3, startTime: '19:00', endTime: '20:00' },
      { weekday: 3, startTime: '08:00', endTime: '09:00' },
      { weekday: 5, startTime: '08:00', endTime: '09:00' },
    ];
    const out = [];
    for (const occurrence of slotOccurrences(slots, '2026-01-07', [
      { startDate: '2026-01-09', endDate: '2026-01-09' },
    ])) {
      out.push(`${occurrence.date} ${trainingTimeOf(occurrence.startsAt)}`);
      if (out.length === 4) break;
    }
    expect(out).toEqual([
      '2026-01-07 08:00',
      '2026-01-07 19:00',
      '2026-01-14 08:00',
      '2026-01-14 19:00',
    ]);
  });

  it('không có ô lặp thì không sinh gì', () => {
    expect([...slotOccurrences([], '2026-01-01')]).toEqual([]);
  });
});

describe('recomputeSchedule', () => {
  it('sinh 10 buổi T2 + T4 từ ngày bắt đầu, lấy giờ của ô', () => {
    const result = recomputeSchedule(base());
    expect(result.created.map((row) => row.seq)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(result.created.map((row) => trainingDateOf(row.startsAt))).toEqual(
      NO_HOLIDAY_DATES,
    );
    expect(result.created[0]).toEqual({
      seq: 1,
      startsAt: '2026-01-05T11:00:00.000Z',
      endsAt: '2026-01-05T12:30:00.000Z',
    });
    expect(result.endDate).toBe('2026-02-04');
    expect(result.heldCount).toBe(0);
  });

  it('ngày bắt đầu giữa tuần: buổi 1 là ô đầu tiên từ ngày đó', () => {
    const result = recomputeSchedule(base({ startDate: '2026-01-07' }));
    expect(trainingDateOf(result.created[0]!.startsAt)).toBe('2026-01-07');
    expect(result.endDate).toBe('2026-02-09');
  });

  it('thêm ngày nghỉ T4 07/01: buổi 2…10 lùi một ô, kết thúc T2 09/02 (bảng T4)', () => {
    const initial = apply([], base());
    const holidays: DateRange[] = [
      { startDate: '2026-01-07', endDate: '2026-01-07' },
    ];
    const result = recomputeSchedule(base({ sessions: initial, holidays }));
    expect(result.created).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.changed.map((row) => row.seq)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(result.changed.every((row) => row.dateChanged)).toBe(true);
    expect(result.endDate).toBe('2026-02-09');

    const moved = apply(initial, base({ holidays }));
    expect(dates(moved)).toEqual([
      '2026-01-05',
      '2026-01-12',
      '2026-01-14',
      '2026-01-19',
      '2026-01-21',
      '2026-01-26',
      '2026-01-28',
      '2026-02-02',
      '2026-02-04',
      '2026-02-09',
    ]);
    // Id giữ nguyên: nội dung map, ghi chú, giáo viên đi theo buổi (U2).
    expect(moved.map((session) => session.id)).toEqual(
      initial.map((session) => session.id),
    );

    // Xoá ngày nghỉ → về như chưa từng có (U5.1).
    const back = apply(moved, base());
    expect(dates(back)).toEqual(NO_HOLIDAY_DATES);
  });

  it('ngày nghỉ nhiều ngày bỏ mọi ô trong khoảng', () => {
    const holidays = [{ startDate: '2026-01-10', endDate: '2026-01-20' }];
    const sessions = apply([], base({ holidays }));
    expect(dates(sessions).slice(0, 4)).toEqual([
      '2026-01-05',
      '2026-01-07',
      '2026-01-21',
      '2026-01-26',
    ]);
    expect(trainingDateOf(sessions[9]!.startsAt)).toBe('2026-02-16');
  });

  it('buổi đã diễn ra giữ nguyên, kể cả khi thêm ngày nghỉ ở quá khứ', () => {
    const initial = apply([], base());
    // Sau buổi 3 (T2 12/01 18:00).
    const now = new Date('2026-01-12T20:00:00+07:00');
    const holidays = [
      { startDate: '2026-01-07', endDate: '2026-01-07' },
      { startDate: '2026-01-14', endDate: '2026-01-14' },
    ];
    const result = recomputeSchedule(
      base({ sessions: initial, holidays, now }),
    );
    expect(result.heldCount).toBe(3);
    expect(result.changed.map((row) => row.seq)).toEqual([
      4, 5, 6, 7, 8, 9, 10,
    ]);
    const moved = apply(initial, base({ holidays, now }));
    expect(dates(moved)).toEqual([
      '2026-01-05',
      '2026-01-07',
      '2026-01-12',
      '2026-01-19',
      '2026-01-21',
      '2026-01-26',
      '2026-01-28',
      '2026-02-02',
      '2026-02-04',
      '2026-02-09',
    ]);
  });

  it('buổi hôm nay chưa tới giờ vẫn dời được, đã bắt đầu thì giữ', () => {
    const initial = apply([], base());
    const holidays = [{ startDate: '2026-01-07', endDate: '2026-01-07' }];
    const before = recomputeSchedule(
      base({
        sessions: initial,
        holidays,
        now: new Date('2026-01-07T17:59:00+07:00'),
      }),
    );
    expect(before.changed[0]!.seq).toBe(2);
    const after = recomputeSchedule(
      base({
        sessions: initial,
        holidays,
        now: new Date('2026-01-07T18:00:00+07:00'),
      }),
    );
    expect(after.heldCount).toBe(2);
    expect(after.changed).toEqual([]);
  });

  it('buổi huỷ vẫn chiếm ô: dời như buổi thường (V1)', () => {
    // Trạng thái huỷ không phải đầu vào: buổi 5 huỷ vẫn là "Buổi 5" trong dãy.
    const initial = apply([], base());
    const result = recomputeSchedule(
      base({
        sessions: initial,
        holidays: [{ startDate: '2026-01-19', endDate: '2026-01-19' }],
      }),
    );
    expect(result.changed.map((row) => row.seq)).toEqual([5, 6, 7, 8, 9, 10]);
  });

  it('tăng số buổi tạo thêm buổi cuối, giảm thì xoá buổi cuối', () => {
    const initial = apply([], base());
    const more = recomputeSchedule(
      base({ sessions: initial, plannedSessions: 12 }),
    );
    expect(more.created.map((row) => row.seq)).toEqual([11, 12]);
    expect(more.changed).toEqual([]);
    expect(more.endDate).toBe('2026-02-11');

    const fewer = recomputeSchedule(
      base({ sessions: initial, plannedSessions: 8 }),
    );
    expect(fewer.removed.map((row) => row.seq)).toEqual([9, 10]);
    expect(fewer.endDate).toBe('2026-01-28');
  });

  it('không xoá buổi đã diễn ra khi số buổi nhỏ hơn số buổi đã học', () => {
    const initial = apply([], base());
    const result = recomputeSchedule(
      base({
        sessions: initial,
        plannedSessions: 2,
        now: new Date('2026-01-13T00:00:00+07:00'),
      }),
    );
    expect(result.heldCount).toBe(3);
    expect(result.removed.map((row) => row.seq)).toEqual([
      4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(result.endDate).toBe('2026-01-12');
  });

  it('2 ô/tuần giờ khác nhau: buổi dời sang ô khác lấy giờ ô mới', () => {
    const slots: ScheduleSlot[] = [
      { weekday: 1, startTime: '18:00', endTime: '19:30' },
      { weekday: 3, startTime: '19:00', endTime: '20:30' },
    ];
    const initial = apply([], base({ slots }));
    expect(trainingTimeOf(initial[1]!.startsAt)).toBe('19:00');
    const result = recomputeSchedule(
      base({
        slots,
        sessions: initial,
        holidays: [{ startDate: '2026-01-07', endDate: '2026-01-07' }],
      }),
    );
    const second = result.changed.find((row) => row.seq === 2)!;
    expect(trainingDateOf(second.startsAt)).toBe('2026-01-12');
    expect(trainingTimeOf(second.startsAt)).toBe('18:00');
    expect(trainingTimeOf(second.endsAt)).toBe('19:30');
    const third = result.changed.find((row) => row.seq === 3)!;
    expect(trainingTimeOf(third.startsAt)).toBe('19:00');
  });

  it('đổi giờ ô lặp: buổi cùng ngày đổi giờ, giờ sửa tay cùng ngày được giữ', () => {
    const initial = apply([], base());
    initial[3] = {
      ...initial[3]!,
      startsAt: trainingDateTimeToIso('2026-01-14', '17:00'),
      endsAt: trainingDateTimeToIso('2026-01-14', '18:30'),
      timeOverridden: true,
    };
    const slots: ScheduleSlot[] = [
      { weekday: 1, startTime: '18:30', endTime: '20:00' },
      { weekday: 3, startTime: '18:30', endTime: '20:00' },
    ];
    const result = recomputeSchedule(base({ sessions: initial, slots }));
    expect(result.changed.map((row) => row.seq)).toEqual([
      1, 2, 3, 5, 6, 7, 8, 9, 10,
    ]);
    expect(result.changed.every((row) => !row.dateChanged)).toBe(true);
    expect(result.changed.every((row) => !row.movedWarning)).toBe(true);
  });

  it('buổi đổi ngày bỏ giờ sửa tay, bật cảnh báo khi có giờ sửa tay/giáo viên riêng (U2)', () => {
    const initial = apply([], base());
    initial[2] = {
      ...initial[2]!,
      startsAt: trainingDateTimeToIso('2026-01-12', '17:00'),
      endsAt: trainingDateTimeToIso('2026-01-12', '18:30'),
      timeOverridden: true,
    };
    initial[3] = { ...initial[3]!, customTeachers: true };
    const result = recomputeSchedule(
      base({
        sessions: initial,
        holidays: [{ startDate: '2026-01-07', endDate: '2026-01-07' }],
      }),
    );
    const bySeq = new Map(result.changed.map((row) => [row.seq, row]));
    expect(trainingDateOf(bySeq.get(3)!.startsAt)).toBe('2026-01-14');
    expect(trainingTimeOf(bySeq.get(3)!.startsAt)).toBe('18:00');
    expect(bySeq.get(3)!.movedWarning).toBe(true);
    expect(bySeq.get(4)!.movedWarning).toBe(true);
    expect(bySeq.get(5)!.movedWarning).toBe(false);
  });

  it('cảnh báo dời cũ giữ nguyên tới khi người dùng tắt', () => {
    const initial = apply([], base()).map((session) =>
      session.seq === 6 ? { ...session, movedWarning: true } : session,
    );
    const result = recomputeSchedule(
      base({
        sessions: initial,
        holidays: [{ startDate: '2026-01-07', endDate: '2026-01-07' }],
      }),
    );
    expect(result.changed.find((row) => row.seq === 6)!.movedWarning).toBe(
      true,
    );
  });

  it('không có ô lặp: không xếp buổi mới, chỉ xoá buổi thừa', () => {
    const initial = apply([], base());
    const result = recomputeSchedule(
      base({ sessions: initial, slots: [], plannedSessions: 12 }),
    );
    expect(result.created).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.endDate).toBe('2026-02-04');
    expect(recomputeSchedule(base({ slots: [] })).endDate).toBeNull();
  });

  it('không đổi gì khi lịch đã đúng', () => {
    const initial = apply([], base());
    const result = recomputeSchedule(base({ sessions: initial }));
    expect(result.created).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.removed).toEqual([]);
  });

  it('heldSessionCount lấy số buổi lớn nhất đã bắt đầu', () => {
    const initial = apply([], base());
    expect(heldSessionCount(initial, BEFORE_START)).toBe(0);
    expect(
      heldSessionCount(initial, new Date('2026-02-04T18:00:00+07:00')),
    ).toBe(10);
  });
});

describe('findSessionOverlaps', () => {
  const at = (date: string, from: string, to: string) => ({
    startsAt: trainingDateTimeToIso(date, from),
    endsAt: trainingDateTimeToIso(date, to),
  });

  it('trùng khi chồng giờ ở lớp khác và có chung người', () => {
    const target = {
      id: 'a',
      classroomId: 'c1',
      ...at('2026-01-05', '18:00', '19:30'),
      people: ['t1', 's1'],
    };
    const others = [
      {
        id: 'b',
        classroomId: 'c2',
        ...at('2026-01-05', '19:00', '20:00'),
        people: ['s1', 's2'],
      },
      // Liền kề, không chồng.
      {
        id: 'c',
        classroomId: 'c2',
        ...at('2026-01-05', '19:30', '21:00'),
        people: ['t1'],
      },
      // Cùng lớp.
      {
        id: 'd',
        classroomId: 'c1',
        ...at('2026-01-05', '18:00', '19:30'),
        people: ['t1'],
      },
      // Không chung người.
      {
        id: 'e',
        classroomId: 'c3',
        ...at('2026-01-05', '18:00', '19:30'),
        people: ['t9'],
      },
    ];
    const result = findSessionOverlaps([target], others);
    expect(result.get('a')).toEqual([{ other: others[0], people: ['s1'] }]);
  });
});
