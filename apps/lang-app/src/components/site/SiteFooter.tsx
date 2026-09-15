import Link from 'next/link';
import { Brand } from '@/components/Brand';
import { vi } from '@/i18n/vi';

const linkClass = 'block transition hover:text-[#eee8d5]';

// Footer tối theo design/Home.html của lightc-general.
// Link tới trang cần đăng nhập tắt prefetch: khách prefetch sẽ nhận redirect
// `/login` của middleware và router cache giữ redirect đó cả sau khi đăng nhập.
export function SiteFooter() {
  return (
    <footer className="bg-[#002b36] px-5 pb-10 pt-12 text-[#93a1a1]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-10">
        <div className="flex max-w-[320px] flex-col gap-3">
          <Brand inverted />
          <p className="text-[13.5px] leading-relaxed">{vi.site.footerText}</p>
        </div>
        <div className="flex flex-wrap gap-x-16 gap-y-6 text-[13.5px] leading-8">
          <div>
            <div className="mb-1.5 font-semibold text-[#eee8d5]">
              {vi.site.footerProduct}
            </div>
            <Link href="/#features" className={linkClass}>
              {vi.site.navFeatures}
            </Link>
            <Link href="/#pricing" className={linkClass}>
              {vi.site.navPlans}
            </Link>
            <Link href="/me/tenants/new" prefetch={false} className={linkClass}>
              {vi.site.registerCenter}
            </Link>
          </div>
          <div>
            <div className="mb-1.5 font-semibold text-[#eee8d5]">
              {vi.site.footerAccount}
            </div>
            <Link href="/login" className={linkClass}>
              {vi.auth.login}
            </Link>
            <Link href="/register" className={linkClass}>
              {vi.auth.register}
            </Link>
            <Link href="/me" prefetch={false} className={linkClass}>
              {vi.site.myWorkspace}
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-9 max-w-6xl border-t border-[rgba(147,161,161,.2)] pt-5 font-mono text-[12px] text-[#657b83]">
        © {new Date().getFullYear()} {vi.app.name}
      </div>
    </footer>
  );
}
