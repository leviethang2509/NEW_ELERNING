import Link from 'next/link';
import { vi } from '@/i18n/vi';

// Landing tạm; nội dung đầy đủ theo design/Home.html làm ở Step 8.
export default function HomePage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="text-[34px] font-bold leading-tight text-[var(--heading)] sm:text-[42px]">
        {vi.site.heroTitle}
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--body)]">
        {vi.site.heroText}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/register"
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(211,54,130,.35)] transition hover:brightness-105"
        >
          {vi.site.registerCenter}
        </Link>
        <Link
          href="/me"
          className="rounded-xl border border-[var(--border-strong)] px-5 py-3 text-[15px] font-medium text-[var(--body)] transition hover:bg-[var(--hover)]"
        >
          {vi.site.myWorkspace}
        </Link>
      </div>
    </section>
  );
}
