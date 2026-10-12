import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useContactStore } from '../../store/contactStore';

export const SEARCH_INPUT_ID = 'contact-search';

export function SearchInput({ placeholder = '名前・会社・電話番号・メールで検索', id = SEARCH_INPUT_ID }: { placeholder?: string; id?: string }) {
  const { searchQuery, setSearchQuery } = useContactStore();
  return (
    <div className="relative flex-1 min-w-0">
      <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-placeholder pointer-events-none" />
      <input
        id={id}
        type="search"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="連絡先を検索"
        className="w-full pl-8 pr-8 py-1.5 text-sm bg-surface-base dark:bg-dark-surface border border-surface-border dark:border-dark-border rounded-lg text-ink-primary dark:text-slate-100 placeholder:text-ink-placeholder focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 [&::-webkit-search-cancel-button]:hidden"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          aria-label="検索をクリア"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded text-ink-placeholder hover:text-ink-secondary"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xs" />
        </button>
      )}
    </div>
  );
}
