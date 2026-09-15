import Link from 'next/link';
import { vi } from '@/i18n/vi';

// Trang tạm cho route đã có trong cấu trúc nhưng chưa làm tới step tương ứng.
export function ComingSoon({
  title,
  backHref,
}: {
  title: string;
  backHref?: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-20 text-center">
      <h1 className="text-[22px] font-bold text-[var(--heading)]">{title}</h1>
      <p className="mt-2 text-[14px] text-[var(--body)]">
        {vi.common.comingSoon}
      </p>
      {backHref && (
        <Link
          href={backHref}
          className="mt-6 rounded-lg border border-[var(--border-strong)] px-4 py-2 text-[14px] font-medium text-[var(--body)] transition hover:bg-[var(--hover)]"
        >
          {vi.common.backHome}
        </Link>
      )}
    </div>
  );
}
