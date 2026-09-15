import { ComingSoon } from '@/components/ComingSoon';
import { vi } from '@/i18n/vi';

// Trang đăng ký thật làm ở Step 5.
export default function RegisterPage() {
  return <ComingSoon title={vi.auth.register} backHref="/" />;
}
