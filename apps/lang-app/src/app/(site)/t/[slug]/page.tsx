import { TenantHome } from './TenantHome';

// Trang trung tâm: công khai phần giới thiệu, thành viên thấy thêm đề thi (Step 13).
export default function TenantPage({ params }: { params: { slug: string } }) {
  return <TenantHome slug={params.slug} />;
}
