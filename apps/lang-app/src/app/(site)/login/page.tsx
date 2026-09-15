import { ComingSoon } from '@/components/ComingSoon';
import { vi } from '@/i18n/vi';

// Trang đăng nhập thật làm ở Step 5; middleware đã chuyển hướng về đây.
export default function LoginPage() {
  return <ComingSoon title={vi.auth.login} backHref="/" />;
}
