import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  /** `null` khi chưa có số liệu. */
  value: number | string | null;
  icon: LucideIcon;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon size={20} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] text-[var(--muted)]">{label}</span>
        <span className="block text-[22px] font-bold text-[var(--heading)]">
          {typeof value === 'number'
            ? value.toLocaleString('vi-VN')
            : (value ?? '—')}
        </span>
      </span>
    </div>
  );
}
