import { Languages } from 'lucide-react';

// Logo tạm: icon lucide + chữ, theo kiểu thương hiệu của lightc-general.
export function Brand({
  hideLabelOnMobile = false,
  inverted = false,
}: {
  /** Màn hình hẹp chỉ hiện icon (header khu vực chính). */
  hideLabelOnMobile?: boolean;
  /** Chữ sáng trên nền tối (footer). */
  inverted?: boolean;
}) {
  return (
    <span className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--accent)] text-white shadow-[0_2px_8px_rgba(211,54,130,.45)]">
        <Languages size={20} />
      </span>
      <span
        className={`whitespace-nowrap text-[18px] font-bold tracking-tight ${
          inverted ? 'text-[#eee8d5]' : 'text-[var(--fg)]'
        } ${hideLabelOnMobile ? 'hidden sm:inline' : ''}`}
      >
        Lang <span className="text-[var(--accent)]">Simulator</span>
      </span>
    </span>
  );
}
