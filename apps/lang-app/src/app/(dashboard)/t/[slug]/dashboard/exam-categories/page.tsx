'use client';

import { CatalogScope, TENANT_MANAGER_ROLES, hasAnyRole } from '@lang/shared';
import { useTenantDashboard } from '@/components/dashboard/TenantDashboardShell';
import { ExamCategoriesView } from '@/components/exam-catalog/ExamCategoriesView';

// Owner/Admin quản lý danh mục của trung tâm; Teacher chỉ xem.
export default function TenantExamCategoriesPage() {
  const { tenant, roles } = useTenantDashboard();
  return (
    <ExamCategoriesView
      apiBase={`/t/${tenant.slug}`}
      scope={CatalogScope.TENANT}
      canManage={hasAnyRole(roles, TENANT_MANAGER_ROLES)}
    />
  );
}
