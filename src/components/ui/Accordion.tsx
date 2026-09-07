import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface AccordionItemProps {
  title: string;
  icon?: IconDefinition;
  badge?: string | number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function AccordionItem({ title, icon, badge, defaultOpen = false, children }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-surface-border/60 dark:border-dark-border/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 py-2.5 text-left group"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-ink-placeholder uppercase tracking-wider group-hover:text-ink-secondary transition-colors">
          {icon && <FontAwesomeIcon icon={icon} className="text-xs" />}
          {title}
          {badge !== undefined && badge !== '' && (
            <span className="px-1.5 py-0.5 rounded-full bg-surface-card dark:bg-dark-surface text-2xs text-ink-secondary normal-case font-medium tracking-normal">
              {badge}
            </span>
          )}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-2xs text-ink-placeholder transition-transform duration-quick flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}
