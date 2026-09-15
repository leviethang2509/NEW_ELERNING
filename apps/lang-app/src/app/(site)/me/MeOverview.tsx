'use client';

import Link from 'next/link';
import {
  ChevronRight,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { vi } from '@/i18n/vi';
import { isSystemManager } from '@/lib/auth-redirect';

function WorkspaceCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-[var(--border-strong)] hover:shadow-[0_6px_18px_rgba(0,43,54,.07)]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-[var(--heading)]">
          {title}
        </span>
        <span className="mt-0.5 block text-[13.5px] text-[var(--body)]">
          {description}
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-[var(--muted)]" />
    </Link>
  );
}

export function MeOverview() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <section className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-[28px] font-bold text-[var(--heading)]">
        {vi.me.title}
      </h1>
      <p className="mt-1 text-[15px] text-[var(--body)]">
        {vi.me.greeting(user.fullName)}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {isSystemManager(user) && (
          <WorkspaceCard
            href="/admin"
            icon={ShieldCheck}
            title={vi.shell.systemWorkspace}
            description={vi.me.systemDescription}
          />
        )}
        <WorkspaceCard
          href="/me/account"
          icon={UserRound}
          title={vi.account.title}
          description={vi.me.accountDescription}
        />
      </div>

      <h2 className="mt-10 text-[12px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
        {vi.me.tenantsHeading}
      </h2>
      <p className="mt-3 rounded-2xl border border-dashed border-[var(--border-strong)] px-4 py-8 text-center text-[14px] text-[var(--body)]">
        {vi.me.noTenants}
      </p>
    </section>
  );
}
