import { REFRESH_TOKEN_COOKIE } from '@lang/shared';
import type { Metadata } from 'next';
import { Noto_Sans, Noto_Sans_JP, Roboto, Roboto_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { GlobalLoadingBar } from '@/components/GlobalLoadingBar';
import { vi } from '@/i18n/vi';

// Roboto: font UI chính (Latin + Vietnamese) theo bộ design.
const roboto = Roboto({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

// Roboto Mono: dùng cho email, thời gian, nhãn kỹ thuật.
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

// Latin + Vietnamese glyphs (dự phòng cho Roboto).
const notoSans = Noto_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans',
  display: 'swap',
});

// Chữ Nhật cho đề JLPT. Font CJK nặng và không có tham số subset nên không
// preload; font stack chỉ rơi xuống đây khi gặp kana/kanji.
const notoSansJp = Noto_Sans_JP({
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: vi.app.name,
  description: vi.app.tagline,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${roboto.variable} ${robotoMono.variable} ${notoSans.variable} ${notoSansJp.variable}`}
    >
      <body className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased">
        <GlobalLoadingBar />
        {/* Chỉ báo có cookie refresh (httpOnly, JS không đọc được) để client
            biết có nên gọi /auth/refresh khi tải trang. */}
        <AuthProvider hasSession={cookies().has(REFRESH_TOKEN_COOKIE)}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
