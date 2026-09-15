import { Languages } from 'lucide-react';

// Logo tạm: icon lucide + chữ, theo kiểu thương hiệu của lightc-general.
export function Brand() {
  return (
    <span className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--accent)] text-white shadow-[0_2px_8px_rgba(211,54,130,.45)]">
        <Languages size={20} />
      </span>
      <span className="text-[18px] font-bold tracking-tight text-[var(--fg)]">
        Lang <span className="text-[var(--accent)]">Simulator</span>
      </span>
    </span>
  );
}
