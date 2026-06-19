import { useRef, useCallback } from 'react';
import { faAddressBook } from '@fortawesome/free-solid-svg-icons';
import { useContactStore } from '../../store/contactStore';
import { ContactListItem } from './ContactListItem';
import { AlphabetIndex } from './AlphabetIndex';
import { EmptyState } from '../ui/EmptyState';

export function ContactList() {
  const { groupedContacts, searchQuery } = useContactStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const grouped = groupedContacts();
  const keys = Object.keys(grouped).sort();
  const availableKeys = new Set(keys);

  const handleIndexSelect = useCallback((key: string) => {
    const el = document.getElementById(`group-${key}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const totalCount = keys.reduce((sum, k) => sum + grouped[k].length, 0);

  if (totalCount === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={faAddressBook}
          title={searchQuery ? '検索結果がありません' : '連絡先がありません'}
          description={searchQuery ? '別のキーワードで検索してください' : 'VCF ファイルをインポートするか、新しい連絡先を追加してください'}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main list */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {keys.map(key => (
          <div key={key}>
            <div
              id={`group-${key}`}
              className="sticky top-0 z-10 px-3 py-1 bg-surface-base/90 dark:bg-dark-base/90 backdrop-blur-sm border-b border-surface-border dark:border-dark-border"
            >
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                {key}
              </span>
              <span className="ml-2 text-2xs text-ink-placeholder">{grouped[key].length}</span>
            </div>
            {grouped[key].map(contact => (
              <ContactListItem key={contact.id} contact={contact} />
            ))}
          </div>
        ))}
      </div>

      {/* Alphabet index bar */}
      <div className="flex-shrink-0 overflow-y-auto border-l border-surface-border dark:border-dark-border bg-surface-base dark:bg-dark-base">
        <AlphabetIndex availableKeys={availableKeys} onSelect={handleIndexSelect} />
      </div>
    </div>
  );
}
