import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface IconButtonProps {
  icon: IconDefinition;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  tone?: 'default' | 'primary' | 'danger' | 'favorite';
  size?: 'sm' | 'md';
  active?: boolean;
}

const TONES = {
  default: 'text-ink-secondary hover:text-ink-primary hover:bg-surface-card dark:hover:bg-dark-surface',
  primary: 'text-primary-600 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-900/30',
  danger: 'text-ink-secondary hover:text-status-danger hover:bg-red-50 dark:hover:bg-red-900/20',
  favorite: 'text-ink-placeholder hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20',
};

export function IconButton({ icon, label, onClick, href, tone = 'default', size = 'md', active }: IconButtonProps) {
  const cls = `${size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'} inline-flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${
    active && tone === 'favorite' ? 'text-amber-400 hover:bg-amber-50' : active ? 'bg-primary-100 text-primary-700' : TONES[tone]
  }`;
  if (href) {
    return <a href={href} title={label} aria-label={label} onClick={onClick} className={cls}><FontAwesomeIcon icon={icon} /></a>;
  }
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className={cls}>
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}
