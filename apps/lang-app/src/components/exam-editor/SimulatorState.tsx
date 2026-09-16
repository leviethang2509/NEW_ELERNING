'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Flag, RotateCcw, Send } from 'lucide-react';
import {
  emptyResponses,
  gradeExam,
  type GradeResult,
  type PreviewPlan,
  type Responses,
  type Verdict,
} from '@lang/exam-core';
import { vi } from '@/i18n/vi';

// Trạng thái làm bài của bản giả lập: câu nào đã trả lời, câu nào gắn cờ, đang
// xem part nào, câu trả lời để chấm và kết quả sau khi nộp. Provider bọc cả
// phần đề lẫn footer (bảng số câu) để cùng đọc một nguồn.

const text = vi.examEditor.simulator;

export type AnswerStatus = 'todo' | 'flagged' | 'answered' | Verdict;

interface Respond {
  value: (no: number, input: string) => void;
  picks: (no: number, indexes: number[]) => void;
  order: (no: number, indexes: number[]) => void;
}

interface SimulatorState {
  answered: ReadonlySet<number>;
  flagged: ReadonlySet<number>;
  tab: number;
  setTab: (tab: number) => void;
  /** Cập nhật trạng thái đã trả lời, dạng `{ số câu: đã trả lời? }`. */
  mark: (changes: Record<number, boolean>) => void;
  toggleFlag: (nos: number[]) => void;
  /** Mở tab chứa câu `no`, cuộn tới và focus ô trả lời. */
  goTo: (no: number) => void;
  /** Ghi câu trả lời để chấm — không gây render lại. */
  respond: Respond;
  /** Kết quả sau khi nộp; `null` khi đang làm. Có kết quả thì mọi ô bị khoá. */
  result: GradeResult | null;
  /** Tăng mỗi lần làm lại — làm key để dựng lại toàn bộ ô nhập. */
  attempt: number;
  submit: () => void;
  retry: () => void;
}

const SimulatorContext = createContext<SimulatorState | null>(null);

export function useSimulator(): SimulatorState {
  const state = useContext(SimulatorContext);
  if (!state) throw new Error('useSimulator phải nằm trong SimulatorProvider');
  return state;
}

export function SimulatorProvider({
  plan,
  children,
}: {
  plan: PreviewPlan;
  children: ReactNode;
}) {
  const [answered, setAnswered] = useState<ReadonlySet<number>>(new Set());
  const [flagged, setFlagged] = useState<ReadonlySet<number>>(new Set());
  const [tab, setTab] = useState(0);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const responses = useRef<Responses>(emptyResponses());

  const mark = useCallback((changes: Record<number, boolean>) => {
    setAnswered((prev) => {
      const next = new Set(prev);
      for (const [key, done] of Object.entries(changes)) {
        if (done) next.add(Number(key));
        else next.delete(Number(key));
      }
      return next.size === prev.size && [...next].every((n) => prev.has(n))
        ? prev
        : next;
    });
  }, []);

  const toggleFlag = useCallback((nos: number[]) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      const on = !nos.every((n) => prev.has(n));
      for (const n of nos) {
        if (on) next.add(n);
        else next.delete(n);
      }
      return next;
    });
  }, []);

  const goTo = useCallback(
    (no: number) => {
      const part = plan.parts.findIndex((p) => p.numbers.includes(no));
      if (part >= 0) setTab(part);
      // Đợi tab mới được hiện ra rồi mới cuộn được.
      requestAnimationFrame(() => {
        const badge = document.querySelector<HTMLElement>(
          `[data-sim-q~="${no}"]`,
        );
        badge?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const field =
          document.querySelector<HTMLElement>(`[data-sim-field="${no}"]`) ??
          badge;
        field?.focus({ preventScroll: true });
      });
    },
    [plan],
  );

  const respond = useMemo<Respond>(
    () => ({
      value: (no, input) => {
        responses.current.value[no] = input;
      },
      picks: (no, indexes) => {
        responses.current.picks[no] = indexes;
      },
      order: (no, indexes) => {
        responses.current.order[no] = indexes;
      },
    }),
    [],
  );

  const submit = useCallback(() => {
    setResult(gradeExam(plan, responses.current));
  }, [plan]);

  const retry = useCallback(() => {
    responses.current = emptyResponses();
    setAnswered(new Set());
    setFlagged(new Set());
    setResult(null);
    setAttempt((a) => a + 1);
  }, []);

  const value = useMemo(
    () => ({
      answered,
      flagged,
      tab,
      setTab,
      mark,
      toggleFlag,
      goTo,
      respond,
      result,
      attempt,
      submit,
      retry,
    }),
    [
      answered,
      flagged,
      tab,
      mark,
      toggleFlag,
      goTo,
      respond,
      result,
      attempt,
      submit,
      retry,
    ],
  );

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
}

function statusOf(state: SimulatorState, nos: number[]): AnswerStatus {
  if (state.result) {
    const verdicts = nos.map((n) => state.result!.verdicts[n] ?? 'wrong');
    if (verdicts.every((v) => v === 'correct')) return 'correct';
    if (verdicts.every((v) => v === 'manual')) return 'manual';
    return 'wrong';
  }
  // Gắn cờ được ưu tiên hiển thị: người làm bài cờ lại để xem lại sau.
  if (nos.some((n) => state.flagged.has(n))) return 'flagged';
  if (nos.every((n) => state.answered.has(n))) return 'answered';
  return 'todo';
}

const STATUS_CLASS: Record<AnswerStatus, string> = {
  todo: 'border-[var(--border-strong)] bg-[var(--card)] text-[var(--heading)] hover:border-[var(--accent)]',
  answered: 'border-[#268bd2] bg-[#268bd2] text-white',
  flagged: 'border-[#b58900] bg-[#b58900] text-white',
  correct: 'border-[#859900] bg-[#859900] text-white',
  wrong: 'border-[#dc322f] bg-[#dc322f] text-white',
  manual:
    'border-dashed border-[var(--border-strong)] bg-[var(--sidebar)] text-[var(--muted)]',
};

/** Badge số câu nằm inline trong đề. Đang làm bài: bấm để gắn / gỡ cờ. */
export function QuestionBadge({ nos }: { nos: number[] }) {
  const state = useSimulator();
  if (nos.length === 0) return null;

  const status = statusOf(state, nos);
  const label =
    nos.length > 1 ? `${nos[0]}–${nos[nos.length - 1]}` : String(nos[0]);

  return (
    <button
      type="button"
      data-sim-q={nos.join(' ')}
      onClick={() => {
        if (!state.result) state.toggleFlag(nos);
      }}
      title={
        state.result
          ? text.badgeResult(label, text.status[status])
          : text.badgeFlag(label, status === 'flagged')
      }
      className={`mr-1.5 inline-flex h-[22px] min-w-[26px] items-center justify-center gap-1 rounded-md border px-1.5 align-middle text-[12.5px] font-bold leading-none tabular-nums transition ${STATUS_CLASS[status]}`}
    >
      {status === 'flagged' && <Flag size={11} strokeWidth={2.5} />}
      {label}
    </button>
  );
}

/** Dải kết quả phía trên đề sau khi nộp. */
export function ResultSummary() {
  const { result } = useSimulator();
  if (!result) return null;
  return (
    <div className="flex shrink-0 flex-wrap items-baseline gap-x-2 border-b border-[var(--border)] bg-[var(--card)] px-5 py-2.5">
      <span className="text-[20px] font-bold tabular-nums text-[var(--heading)]">
        {result.correct} / {result.total}
      </span>
      <span className="text-[13.5px] text-[var(--body)]">
        {text.correctSummary(result.manual)}
      </span>
    </div>
  );
}

const buttonClass =
  'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition';

/** Footer: toàn bộ số câu theo từng part, bấm để nhảy tới; nút nộp / làm lại. */
export function AnswerNav({ plan }: { plan: PreviewPlan }) {
  const state = useSimulator();
  const [confirming, setConfirming] = useState(false);

  const numbers = plan.parts.flatMap((p) => p.numbers);
  const done = numbers.filter((n) => state.answered.has(n)).length;
  const legend: AnswerStatus[] = state.result
    ? ['correct', 'wrong', 'manual']
    : ['todo', 'flagged', 'answered'];

  const submit = () => {
    setConfirming(false);
    state.submit();
  };

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex max-h-[92px] flex-wrap items-center gap-x-5 gap-y-1.5 overflow-auto">
        {plan.parts.map((part, p) =>
          part.numbers.length === 0 ? null : (
            <div key={part.key} className="flex flex-wrap items-center gap-1">
              <span
                className={`mr-1 text-[11.5px] font-semibold uppercase tracking-wide ${
                  p === state.tab
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--muted)]'
                }`}
              >
                Part {p + 1}
              </span>
              {part.numbers.map((no) => {
                const status = statusOf(state, [no]);
                return (
                  <button
                    key={no}
                    type="button"
                    onClick={() => state.goTo(no)}
                    title={text.badgeResult(String(no), text.status[status])}
                    className={`inline-flex h-[26px] min-w-[28px] items-center justify-center rounded-md border px-1 text-[12.5px] font-bold tabular-nums transition ${STATUS_CLASS[status]}`}
                  >
                    {no}
                  </button>
                );
              })}
            </div>
          ),
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[var(--muted)]">
        {legend.map((status) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block h-[12px] w-[12px] rounded-[3px] border ${STATUS_CLASS[status]}`}
            />
            {text.status[status]}
          </span>
        ))}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {state.result ? (
            <>
              <span>{text.reviewHint}</span>
              <button
                type="button"
                onClick={state.retry}
                className={`${buttonClass} border border-[var(--border-strong)] text-[var(--body)] hover:bg-[var(--hover)]`}
              >
                <RotateCcw size={14} /> {text.retry}
              </button>
            </>
          ) : confirming ? (
            <>
              <span className="text-[#b58900]">
                {text.unanswered(numbers.length - done)}
              </span>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className={`${buttonClass} border border-[var(--border-strong)] text-[var(--body)] hover:bg-[var(--hover)]`}
              >
                {text.keepGoing}
              </button>
              <button
                type="button"
                onClick={submit}
                className={`${buttonClass} bg-[var(--accent)] text-white hover:opacity-90`}
              >
                <Send size={14} /> {text.submitAnyway}
              </button>
            </>
          ) : (
            <>
              <span>{text.progress(done, numbers.length)}</span>
              <button
                type="button"
                onClick={() =>
                  done < numbers.length ? setConfirming(true) : submit()
                }
                className={`${buttonClass} bg-[var(--accent)] text-white hover:opacity-90`}
              >
                <Send size={14} /> {text.submit}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
