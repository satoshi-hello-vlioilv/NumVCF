import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface EmptyStateProps {
  icon: IconDefinition;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-card flex items-center justify-center mb-4">
        <FontAwesomeIcon icon={icon} className="text-2xl text-ink-placeholder" />
      </div>
      <p className="text-base font-semibold text-ink-primary mb-1">{title}</p>
      {description && <p className="text-sm text-ink-secondary mb-4">{description}</p>}
      {action}
    </div>
  );
}
