const toneClass = {
  error: 'bg-[#fdf1ef] text-[var(--danger)] ring-[#f4d5d0]',
  success: 'bg-[rgba(133,153,0,.1)] text-[#5f6d00] ring-[rgba(133,153,0,.28)]',
  warning: 'bg-[rgba(181,137,0,.12)] text-[#8a6900] ring-[rgba(181,137,0,.3)]',
  info: 'bg-[rgba(38,139,210,.08)] text-[#1f6fa8] ring-[rgba(38,139,210,.25)]',
} as const;

// Thông báo lỗi/cảnh báo/thành công/thông tin (dưới form, đầu trang).
export function FormAlert({
  tone,
  children,
}: {
  tone: keyof typeof toneClass;
  children: React.ReactNode;
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl px-3.5 py-2.5 text-sm ring-1 ${toneClass[tone]}`}
    >
      {children}
    </div>
  );
}
