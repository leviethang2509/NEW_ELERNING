import { TenantRole } from '@lang/shared';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

// Dashboard tenant. Tạm hiển thị menu đầy đủ của Tenant Owner; roles thật lấy
// từ membership và user từ AuthProvider ở Step 5–8.
export default function TenantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <DashboardShell
      scope={{
        kind: 'tenant',
        slug: params.slug,
        roles: [TenantRole.TENANT_OWNER],
      }}
      user={null}
      workspaces={[]}
      currentWorkspaceKey={`tenant:${params.slug}`}
    >
      {children}
    </DashboardShell>
  );
}
