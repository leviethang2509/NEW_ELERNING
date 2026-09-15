import { Building2, Hourglass, Users } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { vi } from '@/i18n/vi';

// Tổng quan hệ thống; số liệu thật nối API ở Step 7.
export default function AdminOverviewPage() {
  return (
    <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
      <StatCard label={vi.stats.users} value={null} icon={Users} />
      <StatCard label={vi.stats.tenants} value={null} icon={Building2} />
      <StatCard label={vi.stats.pendingTenants} value={null} icon={Hourglass} />
    </div>
  );
}
