// Layout toàn màn hình cho giả lập thi (Step 13): không header/sidebar.
export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[var(--bg)]">{children}</div>;
}
