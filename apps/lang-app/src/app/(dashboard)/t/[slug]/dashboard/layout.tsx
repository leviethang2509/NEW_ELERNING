import { TenantRole } from '@lang/shared';
import { AuthedDashboardShell } from '@/components/dashboard/AuthedDashboardShell';

// Dashboard tenant. Tạm hiển thị menu đầy đủ của Tenant Owner; roles thật lấy
// từ membership ở Step 6–8.
export default function TenantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <AuthedDashboardShell
      scope={{
        kind: 'tenant',
        slug: params.slug,
        roles: [TenantRole.TENANT_OWNER],
      }}
      currentWorkspaceKey={`tenant:${params.slug}`}
    >
      {children}
    </AuthedDashboardShell>
  );
}
