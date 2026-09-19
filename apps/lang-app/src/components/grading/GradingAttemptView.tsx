'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Mic, PenLine, Timer } from 'lucide-react';
import type { ExamElement } from '@lang/exam-core';
import {
  AttemptStatus,
  GRADING_COMMENT_MAX_LENGTH,
  isValidManualScore,
  type GradeAnswerResult,
  type GradingAttemptDetail,
  type GradingQuestion,
  type GradingSection,
} from '@lang/shared';
import { ExamBlocks } from '@/components/exam-simulator/ExamSimulator';
import {
  Badge,
  FormAlert,
  compactPrimaryButtonClass,
  inputClass,
  labelTextClass,
  secondaryButtonClass,
} from '@/components/ui';
import { vi } from '@/i18n/vi';
import { errorMessage } from '@/lib/error-message';
import { formatDateTime } from '@/lib/format';
import {
  getGradingAttempt,
  getGradingRecordingUrl,
  gradeAnswer,
  gradingAttemptPath,
  gradingListPath,
} from '@/lib/grading-api';

const text = vi.grading;

interface Item {
  section: GradingSection;
  question: GradingQuestion;
}

interface Draft {
  score: string;
  comment: string;
}

const draftOf = (question: GradingQuestion): Draft => ({
  score: question.score === null ? '' : String(question.score),
  comment: question.comment ?? '',
});

const isDirty = (draft: Draft | undefined, question: GradingQuestion) =>
  draft !== undefined &&
  (draft.score !== draftOf(question).score ||
    draft.comment.trim() !== (question.comment ?? ''));

const parseScore = (value: string): number | null => {
  const normalized = value.trim().replace(',', '.');
  return normalized === '' ? null : Number(normalized);
};

const countWords = (value: string) =>
  value.trim() === '' ? 0 : value.trim().split(/\s+/).length;

const qtypeLabel = (qtype: string) => vi.learner.qtypes[qtype] ?? qtype;

/** Chấm một lượt làm: đề bài + bài làm từng câu Writing/Speaking, lưu từng câu. */
export function GradingAttemptView({
  slug,
  attemptId,
}: {
  slug: string;
  attemptId: string;
}) {
  const [detail, setDetail] = useState<GradingAttemptDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setDrafts({});
    getGradingAttempt(slug, attemptId).then(
      (data) => {
        if (cancelled) return;
        setDetail(data);
        const items = data.sections.flatMap((s) => s.questions);
        // Mở câu chưa chấm đầu tiên.
        setSelectedId(
          (items.find((q) => q.score === null) ?? items[0])?.answerId ?? null,
        );
      },
      (err: unknown) => {
        if (!cancelled) setLoadError(errorMessage(err, vi.common.loadFailed));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [slug, attemptId]);

  const items = useMemo<Item[]>(
    () =>
      detail?.sections.flatMap((section) =>
        section.questions.map((question) => ({ section, question })),
      ) ?? [],
    [detail],
  );
  const index = items.findIndex(
    (item) => item.question.answerId === selectedId,
  );
  const current = index >= 0 ? items[index] : null;

  function select(answerId: string) {
    setSelectedId(answerId);
    setSaveError(null);
    setSavedId(null);
  }

  function applyResult(result: GradeAnswerResult) {
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            ...result.attempt,
            sections: prev.sections.map((section) => ({
              ...section,
              questions: section.questions.map((question) =>
                question.answerId === result.answer.answerId
                  ? { ...question, ...result.answer }
                  : question,
              ),
            })),
          }
        : prev,
    );
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[result.answer.answerId];
      return next;
    });
  }

  async function save(goNext: boolean) {
    if (!current) return;
    const { question } = current;
    const draft = drafts[question.answerId] ?? draftOf(question);
    const score = parseScore(draft.score);
    if (!isValidManualScore(score, question.maxScore)) {
      setSaveError(text.invalidScore(question.maxScore));
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSavedId(null);
    try {
      const result = await gradeAnswer(slug, question.answerId, {
        score,
        comment: draft.comment.trim() || null,
      });
      applyResult(result);
      if (goNext && index + 1 < items.length) {
        select(items[index + 1].question.answerId);
      } else {
        setSavedId(question.answerId);
      }
    } catch (err) {
      setSaveError(errorMessage(err, vi.common.loadFailed));
    } finally {
      setSaving(false);
    }
  }

  const listHref = gradingListPath(slug);

  if (loadError) {
    return (
      <div className="flex max-w-xl flex-col gap-4 p-4 sm:p-6">
        <FormAlert tone="error">{loadError}</FormAlert>
        <Link href={listHref} className={`${secondaryButtonClass} self-start`}>
          {text.backToList}
        </Link>
      </div>
    );
  }
  if (!detail) {
    return (
      <p className="py-24 text-center text-[14px] text-[var(--muted)]">
        {vi.common.loading}
      </p>
    );
  }

  const done = detail.status === AttemptStatus.GRADED;
  const draft = current
    ? (drafts[current.question.answerId] ?? draftOf(current.question))
    : null;
  const setDraft = (patch: Partial<Draft>) => {
    if (!current || !draft) return;
    setSavedId(null);
    setDrafts((prev) => ({
      ...prev,
      [current.question.answerId]: { ...draft, ...patch },
    }));
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <Link
        href={listHref}
        className="inline-flex items-center gap-1.5 self-start text-[13.5px] font-medium text-[var(--muted)] transition hover:text-[var(--accent)]"
      >
        <ArrowLeft size={15} /> {text.backToList}
      </Link>

      <section className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[19px] font-bold text-[var(--heading)]">
              {detail.student.fullName}
            </h1>
            <Badge tone={done ? 'success' : 'warning'}>
              {text.status[detail.status]}
            </Badge>
          </div>
          <p className="mt-0.5 text-[13px] text-[var(--muted)]">
            {detail.student.email}
          </p>
          <p className="mt-1.5 text-[14px] text-[var(--body)]">
            {detail.exam.title}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 text-[13px] text-[var(--body)] sm:items-end">
          <span>{text.submittedAt(formatDateTime(detail.submittedAt))}</span>
          <span>{text.autoScore(detail.autoCorrect, detail.autoTotal)}</span>
          <span className="font-semibold text-[var(--heading)]">
            {vi.learner.manualProgress(
              detail.manualGradedCount,
              detail.manualCount,
            )}
          </span>
        </div>
      </section>

      {done && (
        <FormAlert tone="success">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{text.allGraded}</span>
            {detail.nextAttemptId && (
              <Link
                href={gradingAttemptPath(slug, detail.nextAttemptId)}
                className="inline-flex items-center gap-1 font-semibold underline"
              >
                {text.nextAttempt} <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </FormAlert>
      )}

      <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
        <nav
          aria-label={text.questionsHeading}
          className="flex flex-col gap-3 self-start rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3"
        >
          <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)]">
            {text.questionsHeading}
          </p>
          {detail.sections.map((section) => (
            <div key={section.id} className="flex flex-col gap-1">
              <p className="px-1 text-[12.5px] font-semibold text-[var(--body)]">
                {section.name}
              </p>
              {section.questions.map((question) => {
                const active = question.answerId === selectedId;
                const Icon = question.qtype === 'speaking' ? Mic : PenLine;
                return (
                  <button
                    key={question.answerId}
                    type="button"
                    aria-current={active ? 'true' : undefined}
                    onClick={() => select(question.answerId)}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition ${
                      active
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'text-[var(--body)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate">
                      {text.questionLabel(
                        question.number,
                        qtypeLabel(question.qtype),
                      )}
                    </span>
                    {isDirty(drafts[question.answerId], question) ? (
                      <Badge tone="accent">{text.unsaved}</Badge>
                    ) : question.score === null ? (
                      <Badge tone="warning">{text.waiting}</Badge>
                    ) : (
                      <Badge tone="success">
                        {text.scoreBadge(question.score, question.maxScore)}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {current && draft && (
          <QuestionPanel
            key={current.question.answerId}
            slug={slug}
            attemptId={detail.id}
            item={current}
            draft={draft}
            onDraft={setDraft}
            saving={saving}
            saved={savedId === current.question.answerId}
            error={saveError}
            hasNext={index + 1 < items.length}
            onSave={(goNext) => void save(goNext)}
          />
        )}
      </div>
    </div>
  );
}

function QuestionPanel({
  slug,
  attemptId,
  item: { section, question },
  draft,
  onDraft,
  saving,
  saved,
  error,
  hasNext,
  onSave,
}: {
  slug: string;
  attemptId: string;
  item: Item;
  draft: Draft;
  onDraft: (patch: Partial<Draft>) => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
  hasNext: boolean;
  onSave: (goNext: boolean) => void;
}) {
  const passage =
    question.partIndex === null
      ? []
      : ((section.parts[question.partIndex] ?? []) as ExamElement[]);
  const cardClass =
    'rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4';
  const headingClass =
    'mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)]';

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-[16px] font-semibold text-[var(--heading)]">
          {text.questionLabel(question.number, qtypeLabel(question.qtype))}
        </h2>
        <span className="text-[13px] text-[var(--muted)]">
          {text.partLabel(section.name, question.partIndex)}
        </span>
        {section.autoSubmitted && (
          <Badge tone="warning">
            <Timer size={12} className="mr-1" /> {text.autoSubmitted}
          </Badge>
        )}
      </div>

      {passage.length > 0 && (
        <details className={cardClass}>
          <summary className="cursor-pointer text-[13.5px] font-semibold text-[var(--body)]">
            {text.passage}
          </summary>
          <div className="mt-3 max-h-[420px] overflow-auto">
            <ExamBlocks blocks={passage} />
          </div>
        </details>
      )}

      <section className={cardClass}>
        <h3 className={headingClass}>{text.prompt}</h3>
        <ExamBlocks blocks={question.prompt as ExamElement[]} />
      </section>

      {question.explanations.length > 0 && (
        <section className={cardClass}>
          <h3 className={headingClass}>{text.explanations}</h3>
          {question.explanations.map((blocks, index) => (
            <ExamBlocks key={index} blocks={blocks as ExamElement[]} />
          ))}
        </section>
      )}

      <section className={cardClass}>
        <h3 className={headingClass}>{text.response}</h3>
        {question.qtype === 'speaking' ? (
          <SpeakingAnswer
            slug={slug}
            attemptId={attemptId}
            question={question}
          />
        ) : question.text === null ? (
          <p className="text-[14px] italic text-[var(--muted)]">{text.blank}</p>
        ) : (
          <>
            <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[var(--heading)]">
              {question.text}
            </p>
            <p className="mt-2 text-right text-[12px] text-[var(--muted)]">
              {text.charCount(
                question.text.length,
                countWords(question.text),
                question.maxChars,
              )}
            </p>
          </>
        )}
      </section>

      {/* Tự kiểm điểm để luôn báo lỗi tiếng Việt thay vì tooltip của trình duyệt. */}
      <form
        noValidate
        className={`${cardClass} flex flex-col gap-3`}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(false);
        }}
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5">
            <span className={labelTextClass}>
              {text.score}{' '}
              <span className="font-normal text-[var(--muted)]">
                ({text.scoreHint(question.maxScore)})
              </span>
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={question.maxScore}
              step={0.5}
              value={draft.score}
              onChange={(event) => onDraft({ score: event.target.value })}
              className={`${inputClass} w-32`}
            />
          </label>
          {question.text === null && !question.hasRecording && (
            <button
              type="button"
              onClick={() => onDraft({ score: '0' })}
              className={secondaryButtonClass}
            >
              {text.zero}
            </button>
          )}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className={labelTextClass}>{text.comment}</span>
          <textarea
            rows={4}
            value={draft.comment}
            maxLength={GRADING_COMMENT_MAX_LENGTH}
            placeholder={text.commentPlaceholder}
            onChange={(event) => onDraft({ comment: event.target.value })}
            className={`${inputClass} resize-y`}
          />
        </label>

        {error && <FormAlert tone="error">{error}</FormAlert>}
        {saved && <FormAlert tone="success">{text.saved}</FormAlert>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[12.5px] text-[var(--muted)]">
            {question.gradedAt &&
              (question.grader
                ? text.gradedBy(
                    question.grader.fullName,
                    formatDateTime(question.gradedAt),
                  )
                : text.gradedByUnknown(formatDateTime(question.gradedAt)))}
          </span>
          <div className="flex flex-wrap gap-2">
            {hasNext && (
              <button
                type="button"
                disabled={saving}
                onClick={() => onSave(true)}
                className={secondaryButtonClass}
              >
                {text.saveAndNext} <ArrowRight size={15} />
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className={compactPrimaryButtonClass}
            >
              {saving ? vi.common.processing : text.save}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/** Ghi âm của học viên: lấy presigned URL khi mở câu, thử lại khi hết hạn/lỗi. */
function SpeakingAnswer({
  slug,
  attemptId,
  question,
}: {
  slug: string;
  attemptId: string;
  question: GradingQuestion;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!question.hasRecording) return;
    let cancelled = false;
    setFailed(false);
    getGradingRecordingUrl(slug, attemptId, question.answerId).then(
      (result) => {
        if (!cancelled) setUrl(result.url);
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [slug, attemptId, question.answerId, question.hasRecording, attempt]);

  if (!question.hasRecording) {
    return (
      <p className="text-[14px] italic text-[var(--muted)]">
        {text.noRecording}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {url && !failed && (
        <audio
          controls
          preload="metadata"
          src={url}
          onError={() => setFailed(true)}
          className="w-full"
        />
      )}
      {failed && (
        <div className="flex flex-wrap items-center gap-2">
          <FormAlert tone="error">{text.recordingFailed}</FormAlert>
          <button
            type="button"
            onClick={() => {
              setUrl(null);
              setAttempt((value) => value + 1);
            }}
            className={secondaryButtonClass}
          >
            {text.loadRecording}
          </button>
        </div>
      )}
      {question.seconds !== null && (
        <p className="text-[12px] text-[var(--muted)]">
          {text.maxSeconds(question.seconds)}
        </p>
      )}
    </div>
  );
}
