import {
  ClipboardCheck,
  FileText,
  GraduationCap,
  UserRound,
  Users,
  UsersRound,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { vi } from '@/i18n/vi';

// Tổng quan tenant; số liệu thật nối API ở Step 8.
export default function TenantOverviewPage() {
  return (
    <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
      <StatCard label={vi.stats.teachers} value={null} icon={UserRound} />
      <StatCard label={vi.stats.students} value={null} icon={GraduationCap} />
      <StatCard label={vi.stats.parents} value={null} icon={UsersRound} />
      <StatCard label={vi.stats.memberQuota} value={null} icon={Users} />
      <StatCard label={vi.stats.exams} value={null} icon={FileText} />
      <StatCard
        label={vi.stats.pendingGrading}
        value={null}
        icon={ClipboardCheck}
      />
    </div>
  );
}
