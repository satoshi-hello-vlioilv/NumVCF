import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface SheetProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Sheet({ title, open, onClose, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm max-h-[70vh] flex flex-col bg-white dark:bg-dark-card rounded-t-2xl sm:rounded-2xl shadow-overlay animate-slide-up">
        <div className="flex items-center justify-between px-4 h-12 border-b border-surface-border dark:border-dark-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-ink-primary dark:text-slate-100">{title}</h2>
          <button type="button" onClick={onClose} aria-label="閉じる" className="w-8 h-8 rounded-lg text-ink-secondary hover:bg-surface-card"><FontAwesomeIcon icon={faXmark} /></button>
        </div>
        <div className="overflow-y-auto p-2">{children}</div>
      </div>
    </div>
  );
}
