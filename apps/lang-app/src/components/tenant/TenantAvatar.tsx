import { initials } from '@/lib/initials';

const sizeClass = {
  md: 'h-11 w-11 rounded-xl text-[15px]',
  lg: 'h-[72px] w-[72px] rounded-2xl text-[24px]',
} as const;

// Ký hiệu trung tâm theo chữ cái đầu của tên; logo tải lên có ở Step 10.
export function TenantAvatar({
  name,
  size = 'md',
}: {
  name: string;
  size?: keyof typeof sizeClass;
}) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center bg-[var(--accent-soft)] font-bold text-[var(--accent)] ${sizeClass[size]}`}
    >
      {initials(name)}
    </span>
  );
}
