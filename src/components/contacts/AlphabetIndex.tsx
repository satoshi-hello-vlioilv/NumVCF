import { useRef } from 'react';
import { INDEX_KEYS } from '../../utils/grouping';

interface AlphabetIndexProps {
  availableKeys: Set<string>;
  onSelect: (key: string) => void;
}

export function AlphabetIndex({ availableKeys, onSelect }: AlphabetIndexProps) {
  const lastTouched = useRef<string | null>(null);

  const handleTouch = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const key = document.elementFromPoint(t.clientX, t.clientY)?.getAttribute('data-index-key');
    if (key && key !== lastTouched.current && availableKeys.has(key)) {
      lastTouched.current = key;
      onSelect(key);
    }
  };

  return (
    <nav
      aria-label="索引"
      className="flex flex-col items-center justify-center py-1 px-0.5 select-none touch-none flex-shrink-0 border-l border-surface-border/60 dark:border-dark-border/60 bg-white dark:bg-dark-card"
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
    >
      {INDEX_KEYS.map(key => {
        const available = availableKeys.has(key);
        return (
          <button
            key={key}
            type="button"
            data-index-key={key}
            disabled={!available}
            onClick={() => onSelect(key)}
            className={`text-2xs leading-none py-[3px] w-5 text-center rounded ${available ? 'text-primary-600 font-medium hover:bg-primary-100' : 'text-ink-placeholder/50'}`}
          >
            {key}
          </button>
        );
      })}
    </nav>
  );
}
