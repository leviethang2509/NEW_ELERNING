import { DashboardShell } from '@/components/dashboard/DashboardShell';

// Dashboard System Owner/Admin. User và danh sách không gian lấy từ
// AuthProvider ở Step 5.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      scope={{ kind: 'system' }}
      user={null}
      workspaces={[]}
      currentWorkspaceKey="system"
    >
      {children}
    </DashboardShell>
  );
}
