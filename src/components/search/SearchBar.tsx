import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useContactStore } from '../../store/contactStore';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useContactStore();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex-1">
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-placeholder text-sm pointer-events-none"
      />
      <input
        ref={inputRef}
        type="search"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="名前・電話番号・会社を検索..."
        className="w-full pl-9 pr-8 py-2 text-sm bg-surface-base dark:bg-dark-surface border border-surface-border dark:border-dark-border rounded-lg text-ink-primary placeholder:text-ink-placeholder focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
      />
      {searchQuery && (
        <button
          onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-placeholder hover:text-ink-secondary transition-colors"
        >
          <FontAwesomeIcon icon={faXmark} className="text-sm" />
        </button>
      )}
    </div>
  );
}
