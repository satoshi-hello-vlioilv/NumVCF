import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface PopoverProps {
  trigger: (props: { onClick: () => void; isOpen: boolean }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: 'left' | 'right';
}

export function Popover({ trigger, children, align = 'right' }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative inline-block">
      {trigger({ onClick: () => setIsOpen(v => !v), isOpen })}
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 ${align === 'right' ? 'right-0' : 'left-0'} z-30 w-max min-w-48 max-w-72 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-lg shadow-panel py-1 animate-slide-up`}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

interface PopoverItemProps {
  icon?: IconDefinition;
  label: string;
  hint?: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  active?: boolean;
}

export function PopoverItem({ icon, label, hint, onClick, variant = 'default', active = false }: PopoverItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors whitespace-nowrap
        ${variant === 'danger' ? 'text-status-danger hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-ink-primary dark:text-slate-200 hover:bg-surface-card dark:hover:bg-dark-surface'}
        ${active ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : ''}
      `}
    >
      {icon && <FontAwesomeIcon icon={icon} className="text-xs w-4 text-center flex-shrink-0" />}
      <span className="flex-1">{label}</span>
      {hint && <span className="text-2xs text-ink-placeholder font-mono flex-shrink-0">{hint}</span>}
    </button>
  );
}

export function PopoverDivider() {
  return <div className="my-1 border-t border-surface-border dark:border-dark-border" />;
}

export function PopoverLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-2xs font-semibold text-ink-placeholder uppercase tracking-wider">
      {children}
    </div>
  );
}
