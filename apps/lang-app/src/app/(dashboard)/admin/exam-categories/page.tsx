'use client';

import { CatalogScope } from '@lang/shared';
import { ExamCategoriesView } from '@/components/exam-catalog/ExamCategoriesView';

export default function AdminExamCategoriesPage() {
  return (
    <ExamCategoriesView
      apiBase="/admin"
      scope={CatalogScope.SYSTEM}
      canManage
    />
  );
}
