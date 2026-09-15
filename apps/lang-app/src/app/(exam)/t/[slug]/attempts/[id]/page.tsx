import { ComingSoon } from '@/components/ComingSoon';
import { vi } from '@/i18n/vi';

// Trang làm bài thi làm ở Step 13.
export default function AttemptPage({ params }: { params: { slug: string } }) {
  return <ComingSoon title={vi.nav.exams} backHref={`/t/${params.slug}`} />;
}
