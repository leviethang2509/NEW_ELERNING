import Link from 'next/link';
import { Brand } from '@/components/Brand';
import { vi } from '@/i18n/vi';

// Layout khu vực chính. Giao diện đầy đủ theo design/Home.html làm ở Step 8.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-3 px-5">
          <Link href="/">
            <Brand />
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-[14px] font-medium text-[var(--body)] transition hover:bg-[var(--hover)]"
            >
              {vi.auth.login}
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[14px] font-semibold text-white transition hover:brightness-105"
            >
              {vi.auth.register}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-[13px] text-[var(--muted)]">
        © {new Date().getFullYear()} {vi.app.name}
      </footer>
    </div>
  );
}
