'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Issue, OutlineItem } from '@lang/exam-core';
import { vi } from '@/i18n/vi';

// Bảng kiểm tra dưới mini map: liệt kê lỗi soạn thảo, bấm vào là cuộn tới
// indicator của câu hỏi đó.

interface IssuePanelProps {
  issues: Issue[];
  outline: OutlineItem[];
  scrollerRef: React.RefObject<HTMLDivElement>;
}

export function IssuePanel({ issues, outline, scrollerRef }: IssuePanelProps) {
  const text = vi.examEditor.issues;
  const errors = issues.filter((issue) => issue.severity === 'error');
  const labelOf = (id: string | null) =>
    (id && outline.find((item) => item.id === id)?.label) ?? text.section;

  return (
    <div className="flex min-h-[128px] shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--sidebar)] lg:max-h-[45%]">
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-3.5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
        {errors.length ? (
          <AlertTriangle size={13} className="text-[#dc322f]" />
        ) : (
          <CheckCircle2 size={13} className="text-[#2f9e44]" />
        )}
        {text.title(errors.length)}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-1.5">
        {issues.length === 0 ? (
          <p className="px-2 py-3 text-[13px] leading-relaxed text-[var(--muted)]">
            {text.none}
          </p>
        ) : (
          issues.map((issue) => (
            <button
              key={issue.key}
              type="button"
              onClick={() => {
                if (!issue.indicatorId) return;
                scrollerRef.current
                  ?.querySelector(`[data-indicator-id="${issue.indicatorId}"]`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="mb-0.5 block w-full rounded-lg px-2.5 py-1.5 text-left transition hover:bg-[var(--hover)]"
            >
              <span
                className={`block text-[12px] font-semibold ${
                  issue.severity === 'error'
                    ? 'text-[var(--accent)]'
                    : 'text-[#b58900]'
                }`}
              >
                {labelOf(issue.indicatorId)}
                {issue.severity === 'warning' && ` · ${text.warning}`}
              </span>
              <span className="block text-[12.5px] leading-snug text-[var(--body)]">
                {issue.message}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
