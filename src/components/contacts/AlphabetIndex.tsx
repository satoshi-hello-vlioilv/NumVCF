import { useRef } from 'react';

const KANA_GROUPS = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'];
const ABC_GROUPS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ALL_GROUPS = [...KANA_GROUPS, ...ABC_GROUPS, '#'];

interface AlphabetIndexProps {
  availableKeys: Set<string>;
  onSelect: (key: string) => void;
}

export function AlphabetIndex({ availableKeys, onSelect }: AlphabetIndexProps) {
  const touchRef = useRef<string | null>(null);

  const handleTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const btn = elements.find(el => el.getAttribute('data-index-key'));
    const key = btn?.getAttribute('data-index-key');
    if (key && key !== touchRef.current) {
      touchRef.current = key;
      onSelect(key);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center py-1 px-0.5 select-none touch-none"
      onTouchMove={handleTouch}
      onTouchStart={handleTouch}
    >
      {ALL_GROUPS.map(key => {
        const available = availableKeys.has(key);
        return (
          <button
            key={key}
            data-index-key={key}
            onClick={() => available && onSelect(key)}
            className={`text-2xs leading-none py-0.5 px-1 w-5 text-center rounded transition-colors ${
              available
                ? 'text-primary-600 hover:bg-primary-100 font-medium cursor-pointer'
                : 'text-ink-placeholder cursor-default'
            }`}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
