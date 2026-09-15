import Link from 'next/link';
import { Brand } from '@/components/Brand';
import { SiteHeaderNav } from '@/components/site/SiteHeaderNav';
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
          <Link href="/" aria-label={vi.app.name}>
            <Brand hideLabelOnMobile />
          </Link>
          <SiteHeaderNav />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-[13px] text-[var(--muted)]">
        © {new Date().getFullYear()} {vi.app.name}
      </footer>
    </div>
  );
}
