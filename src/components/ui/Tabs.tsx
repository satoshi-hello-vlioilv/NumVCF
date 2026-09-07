import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface TabItem {
  id: string;
  label: string;
  icon?: IconDefinition;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex gap-1 px-2 border-b border-surface-border dark:border-dark-border flex-shrink-0 overflow-x-auto">
      {tabs.map(tab => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              isActive
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-ink-secondary hover:text-ink-primary hover:border-surface-border dark:hover:border-dark-border'
            }`}
          >
            {tab.icon && <FontAwesomeIcon icon={tab.icon} className="text-xs" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
