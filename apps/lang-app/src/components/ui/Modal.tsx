'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { vi } from '@/i18n/vi';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Tailwind width class cho panel, mặc định max-w-lg. */
  widthClass?: string;
  /** Tailwind class nền panel, mặc định bg-[var(--card)]. */
  surfaceClass?: string;
  /** Class thay cho cách cuộn/padding mặc định của phần thân. */
  bodyClass?: string;
  footer?: React.ReactNode;
}

// Modal chung, style theo token Solarized. Panel tối đa cao ~85vh, phần thân
// tự cuộn; header/footer cố định.
// Click ra ngoài backdrop KHÔNG đóng popup — tránh mất dữ liệu đang nhập; chỉ
// đóng qua nút X, nút ở footer hoặc phím Esc.
export function Modal({
  open,
  onClose,
  title,
  children,
  widthClass = 'max-w-lg',
  surfaceClass = 'bg-[var(--card)]',
  bodyClass = 'overflow-auto px-5 py-4',
  footer,
}: ModalProps) {
  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', onEsc);
      return () => document.removeEventListener('keydown', onEsc);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ls-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[85vh] w-full ${widthClass} flex-col overflow-hidden rounded-2xl border border-[var(--border)] ${surfaceClass} shadow-[0_30px_70px_rgba(0,43,54,.28)]`}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-[17px] font-bold text-[var(--heading)]">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={vi.common.close}
              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--hover)] hover:text-[var(--body)]"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className={`min-h-0 flex-1 ${bodyClass}`}>{children}</div>

        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border)] px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
