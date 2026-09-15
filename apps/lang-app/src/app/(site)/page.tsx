import Link from 'next/link';
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Headphones,
  Mic,
  PenLine,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import { PlanCards } from '@/components/site/PlanCards';
import { vi } from '@/i18n/vi';

// Màu nhấn Solarized cho các khối minh hoạ, theo design/Home.html.
const SECTION_STYLES: { icon: LucideIcon; color: string }[] = [
  { icon: Headphones, color: '#268bd2' },
  { icon: BookOpen, color: '#859900' },
  { icon: PenLine, color: '#6c71c4' },
  { icon: Mic, color: '#cb4b16' },
];
const STAT_COLORS = ['#268bd2', '#859900', '#cb4b16'];
const FEATURE_STYLES: { icon: LucideIcon; color: string }[] = [
  { icon: FileText, color: '#268bd2' },
  { icon: Timer, color: '#2aa198' },
  { icon: ClipboardCheck, color: '#d33682' },
];

function IconTile({
  icon: Icon,
  color,
  size = 40,
}: {
  icon: LucideIcon;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-xl"
      style={{
        width: size,
        height: size,
        background: `${color}22`,
        color,
      }}
    >
      <Icon size={Math.round(size / 2)} />
    </span>
  );
}

const eyebrowClass =
  'font-mono text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]';
const sectionTitleClass =
  'text-[28px] font-bold leading-[1.15] tracking-[-0.025em] text-[var(--heading)] sm:text-[36px]';

// Landing chung, bố cục theo design/Home.html (hero, tính năng, gói dịch vụ).
export default function HomePage() {
  const { preview } = vi.site;
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:pt-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:pb-[76px]">
        <div className="flex flex-col items-start gap-6">
          <span className="flex items-center gap-2 rounded-full border border-[rgba(88,110,117,.16)] bg-[var(--sidebar)] px-3.5 py-1.5 font-mono text-[12px] tracking-[0.06em] text-[var(--body)]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#859900]" />
            {vi.site.heroBadge}
          </span>
          <h1 className="text-[38px] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--heading)] sm:text-[54px]">
            {vi.site.heroTitle}
          </h1>
          <p className="max-w-[520px] text-[17px] leading-relaxed text-[var(--body)] sm:text-[18.5px]">
            {vi.site.heroText}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {/* Trang cần đăng nhập: tắt prefetch (xem SiteFooter). */}
            <Link
              href="/me/tenants/new"
              prefetch={false}
              className="rounded-xl bg-[var(--accent)] px-6 py-3.5 text-[15.5px] font-semibold text-[#fdf6e3] shadow-[0_10px_24px_rgba(211,54,130,.3)] transition hover:bg-[#b32c6d]"
            >
              {vi.site.registerCenter}
            </Link>
            <Link
              href="/#pricing"
              className="rounded-xl border border-[rgba(88,110,117,.18)] bg-[var(--sidebar)] px-5 py-3.5 text-[15.5px] font-semibold text-[var(--fg)] transition hover:bg-[#e4dcc4]"
            >
              {vi.site.viewPlans}
            </Link>
          </div>
          <p className="max-w-[460px] text-[13.5px] leading-relaxed text-[#839496]">
            {vi.site.heroNote}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-[18px] rounded-[20px] border border-[rgba(88,110,117,.16)] bg-[var(--sidebar)] p-5 shadow-[0_18px_44px_rgba(0,43,54,.12)] sm:p-[26px]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[15px] font-semibold text-[var(--fg)]">
                {preview.title}
              </div>
              <span className="shrink-0 rounded-[7px] bg-[rgba(42,161,152,.14)] px-2.5 py-1 font-mono text-[12px] text-[#2aa198]">
                {preview.duration}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {preview.sections.map((section, index) => (
                <div
                  key={section.title}
                  className="flex items-center gap-3.5 rounded-[13px] border border-[rgba(88,110,117,.12)] bg-[var(--bg)] px-4 py-3.5"
                >
                  <IconTile {...SECTION_STYLES[index]} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-semibold text-[var(--fg)]">
                      {section.title}
                    </div>
                    <div className="mt-0.5 truncate text-[12.5px] text-[var(--muted)]">
                      {section.meta}
                    </div>
                  </div>
                  <div
                    className="shrink-0 font-mono text-[13px] font-medium"
                    style={{ color: SECTION_STYLES[index].color }}
                  >
                    {section.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[12.5px] text-[#839496]">
                <span>{preview.progressLabel}</span>
                <span className="font-mono text-[var(--fg)]">
                  {preview.progressValue}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[rgba(88,110,117,.16)]">
                <div className="h-full w-[42%] rounded-full bg-[var(--accent)]" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {preview.stats.map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[rgba(88,110,117,.16)] bg-[var(--bg)] p-3.5 sm:p-[18px]"
              >
                <div
                  className="font-mono text-[20px] font-medium sm:text-[24px]"
                  style={{ color: STAT_COLORS[index] }}
                >
                  {stat.value}
                </div>
                <div className="mt-1 text-[12px] leading-snug text-[#839496] sm:text-[12.5px]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-[68px] border-y border-[var(--border)] bg-[var(--sidebar)] px-5 py-16 sm:py-[74px]"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="max-w-[640px]">
            <div className={eyebrowClass}>{vi.site.featuresEyebrow}</div>
            <h2 className={`mt-2.5 ${sectionTitleClass}`}>
              {vi.site.featuresTitle}
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {vi.site.features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3.5 rounded-[18px] border border-[rgba(88,110,117,.16)] bg-[var(--bg)] p-7 shadow-[0_8px_22px_rgba(0,43,54,.06)]"
              >
                <IconTile {...FEATURE_STYLES[index]} size={48} />
                <div className="text-[19px] font-bold tracking-[-0.015em] text-[var(--heading)]">
                  {feature.title}
                </div>
                <div className="text-[14.5px] leading-relaxed text-[var(--body)]">
                  {feature.body}
                </div>
                <div
                  className="mt-auto pt-2 font-mono text-[12.5px]"
                  style={{ color: FEATURE_STYLES[index].color }}
                >
                  {feature.stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="mx-auto grid max-w-6xl scroll-mt-[68px] items-center gap-10 px-5 py-16 sm:py-[78px] lg:grid-cols-[.85fr_1.15fr] lg:gap-14"
      >
        <div className="flex flex-col gap-4">
          <div className={eyebrowClass}>{vi.site.plansEyebrow}</div>
          <h2 className={sectionTitleClass}>{vi.site.plansTitle}</h2>
          <p className="text-[16.5px] leading-relaxed text-[var(--body)]">
            {vi.site.plansText}
          </p>
        </div>
        <PlanCards />
      </section>
    </>
  );
}
