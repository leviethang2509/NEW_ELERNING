'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ServicePlanSummary } from '@lang/shared';
import { vi } from '@/i18n/vi';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/format';

// Gói dịch vụ đang áp dụng trên landing; gói ở giữa được làm nổi như design.
export function PlanCards() {
  const [plans, setPlans] = useState<ServicePlanSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get<ServicePlanSummary[]>('/public/plans').then(
      (result) => {
        if (!cancelled) setPlans(result);
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <p className="text-[14px] text-[var(--muted)]">{vi.site.plansFailed}</p>
    );
  }
  if (!plans) {
    return (
      <div className="grid gap-4 sm:grid-cols-3" aria-hidden>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-[260px] animate-pulse rounded-[18px] bg-[var(--sidebar)]"
          />
        ))}
      </div>
    );
  }
  if (plans.length === 0) {
    return (
      <p className="text-[14px] text-[var(--muted)]">{vi.tenantForm.noPlans}</p>
    );
  }

  const featuredIndex = plans.length >= 3 ? 1 : -1;
  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-3">
      {plans.map((plan, index) => {
        const featured = index === featuredIndex;
        return (
          <div
            key={plan.id}
            className={`flex flex-col gap-3.5 rounded-[18px] border p-6 ${
              featured
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[#fdf6e3] shadow-[0_16px_38px_rgba(211,54,130,.28)]'
                : 'border-[rgba(88,110,117,.18)] bg-[var(--bg)]'
            }`}
          >
            <div
              className={`text-[14px] font-semibold tracking-[0.02em] ${
                featured ? 'text-[rgba(253,246,227,.85)]' : 'text-[#839496]'
              }`}
            >
              {plan.name}
            </div>
            <div
              className={`break-words font-mono text-[24px] font-medium ${
                featured ? 'text-[#fdf6e3]' : 'text-[var(--fg)]'
              }`}
            >
              {plan.price === null
                ? vi.tenantForm.priceContact
                : formatPrice(plan.price)}
            </div>
            <div
              className={`h-px ${
                featured ? 'bg-[rgba(253,246,227,.3)]' : 'bg-[var(--border)]'
              }`}
            />
            <div
              className={`flex flex-col gap-2 text-[13.5px] leading-snug ${
                featured ? 'text-[rgba(253,246,227,.92)]' : 'text-[var(--body)]'
              }`}
            >
              <div className="font-semibold">
                {vi.tenantForm.maxMembers(plan.maxMembers)}
              </div>
              {plan.description && (
                <div className="whitespace-pre-line">{plan.description}</div>
              )}
            </div>
            <Link
              href={`/me/tenants/new?plan=${plan.id}`}
              // Trang cần đăng nhập: tắt prefetch (xem SiteFooter).
              prefetch={false}
              className={`mt-auto rounded-[10px] px-3 py-2.5 text-center text-[14px] font-semibold transition ${
                featured
                  ? 'bg-[#fdf6e3] text-[#002b36] hover:bg-white'
                  : 'bg-[var(--sidebar)] text-[var(--fg)] hover:bg-[#e4dcc4]'
              }`}
            >
              {vi.site.choosePlan}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
