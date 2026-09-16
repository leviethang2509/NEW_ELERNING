'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardCheck, Eye } from 'lucide-react';
import {
  AttemptStatus,
  type GradingAttemptItem,
  type GradingAttemptList,
  type GradingAttemptStatus,
} from '@lang/shared';
import { useTenantDashboard } from '@/components/dashboard/TenantDashboardShell';
import {
  Badge,
  DataTable,
  FormAlert,
  Pagination,
  SearchInput,
  SelectFilter,
  iconButtonClass,
  type DataColumn,
} from '@/components/ui';
import { vi } from '@/i18n/vi';
import { errorMessage } from '@/lib/error-message';
import { formatDateTime } from '@/lib/format';
import { gradingAttemptPath, listGradingAttempts } from '@/lib/grading-api';
import { useDebouncedValue } from '@/lib/use-debounced-value';

const PAGE_SIZE = 20;
const GRID =
  'sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1.5fr)_140px_110px_100px_70px]';

const text = vi.grading;

const STATUSES: GradingAttemptStatus[] = [
  AttemptStatus.SUBMITTED,
  AttemptStatus.GRADED,
];

/** `?status=` trên URL; mặc định mở danh sách bài chờ chấm, `all` = mọi trạng thái. */
function parseStatus(value: string | undefined): GradingAttemptStatus | '' {
  if (value === 'all') return '';
  return STATUSES.find((status) => status === value) ?? AttemptStatus.SUBMITTED;
}

/** Danh sách bài có câu Writing/Speaking đã nộp hết (Owner/Admin/Teacher). */
export default function GradingPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const { tenant } = useTenantDashboard();
  const slug = tenant.slug;

  const [query, setQuery] = useState('');
  const q = useDebouncedValue(query.trim());
  const [status, setStatus] = useState(parseStatus(searchParams.status));
  const [examId, setExamId] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<GradingAttemptList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setPage(1), [q, status, examId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listGradingAttempts(slug, {
      page,
      pageSize: PAGE_SIZE,
      q,
      status,
      examId,
    })
      .then(
        (result) => {
          if (cancelled) return;
          setData(result);
          setError(null);
        },
        (err: unknown) => {
          if (!cancelled) setError(errorMessage(err, vi.common.loadFailed));
        },
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, page, q, status, examId]);

  const columns: DataColumn<GradingAttemptItem>[] = [
    {
      header: text.columns.student,
      render: (row) => (
        <>
          <Link
            href={gradingAttemptPath(slug, row.id)}
            className="block truncate text-[14px] font-semibold text-[var(--heading)] hover:text-[var(--accent)]"
          >
            {row.student.fullName}
          </Link>
          <span className="block truncate text-[12.5px] text-[var(--muted)]">
            {row.student.email}
          </span>
        </>
      ),
    },
    {
      header: text.columns.exam,
      render: (row) => (
        <>
          <span className="block truncate text-[13.5px] text-[var(--body)]">
            {row.exam.title}
          </span>
          <span className="block text-[12.5px] text-[var(--muted)]">
            {text.autoScore(row.autoCorrect, row.autoTotal)}
          </span>
        </>
      ),
    },
    {
      header: text.columns.submittedAt,
      render: (row) => (
        <span className="text-[13px] text-[var(--body)]">
          {formatDateTime(row.submittedAt)}
        </span>
      ),
    },
    {
      header: text.columns.progress,
      render: (row) => (
        <span className="text-[13px] tabular-nums text-[var(--body)]">
          {text.progress(row.manualGradedCount, row.manualCount)}
        </span>
      ),
    },
    {
      header: text.columns.status,
      render: (row) => (
        <Badge
          tone={row.status === AttemptStatus.GRADED ? 'success' : 'warning'}
        >
          {text.status[row.status]}
        </Badge>
      ),
    },
    {
      header: vi.admin.actions,
      render: (row) => {
        const label =
          row.status === AttemptStatus.GRADED ? text.view : text.open;
        return (
          <Link
            href={gradingAttemptPath(slug, row.id)}
            title={label}
            aria-label={label}
            className={iconButtonClass}
          >
            {row.status === AttemptStatus.GRADED ? (
              <Eye size={16} />
            ) : (
              <ClipboardCheck size={16} />
            )}
          </Link>
        );
      },
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <p className="max-w-3xl shrink-0 text-[13.5px] text-[var(--body)]">
        {text.subtitle}
      </p>

      <div className="flex shrink-0 flex-wrap items-center gap-2.5">
        <SearchInput
          value={query}
          placeholder={text.searchPlaceholder}
          onChange={setQuery}
        />
        <SelectFilter
          value={status}
          allLabel={text.allStatuses}
          options={STATUSES.map((value) => ({
            value,
            label: text.status[value],
          }))}
          onChange={setStatus}
        />
        <SelectFilter
          value={examId}
          allLabel={text.allExams}
          options={(data?.exams ?? []).map((exam) => ({
            value: exam.id,
            label: exam.title,
          }))}
          onChange={setExamId}
        />
      </div>

      {error && <FormAlert tone="error">{error}</FormAlert>}

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        gridClass={GRID}
        loading={loading}
        emptyText={text.empty}
        footer={
          data && data.total > 0 ? (
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              onChange={setPage}
            />
          ) : null
        }
      />
    </div>
  );
}
