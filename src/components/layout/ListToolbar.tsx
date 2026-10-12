import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders, faCheck, faFileExport, faTrash, faXmark, faListCheck, faFilterCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { useContactStore } from '../../store/contactStore';
import { useFormatProfileStore } from '../../store/formatProfileStore';
import { useUIStore } from '../../store/uiStore';
import { Popover, PopoverItem, PopoverLabel } from '../ui/Popover';
import { IconButton } from '../ui/IconButton';
import { filterLabel } from './useFacets';
import type { DisplayDensity } from '../../types/contact';

const DENSITY: [DisplayDensity, string][] = [['compact', 'コンパクト'], ['comfortable', '標準'], ['spacious', 'ゆったり']];

interface ListToolbarProps {
  count: number;
  total: number;
  visibleIds: string[];
  onBulkDelete: () => void;
  // Two-line list (phone or next to an open detail): selection starts from a
  // "選択" button and its actions sit in a bar at the bottom instead.
  compact: boolean;
}

// The one place that states how many contacts are listed (the filter chips
// carry no counts, so the number is never shown twice).
export function ListToolbar({ count, total, visibleIds, onBulkDelete, compact }: ListToolbarProps) {
  const { filter, setFilter, searchQuery, setSearchQuery } = useContactStore();
  const { profiles } = useFormatProfileStore();
  const { groupMode, setGroupMode, density, setDensity, selectedIds, isSelecting, setSelecting, clearSelection, selectAll, setExportModalOpen } = useUIStore();

  if (!compact && (selectedIds.size > 0 || isSelecting)) {
    return (
      <div className="flex items-center gap-1 px-3 h-10 border-b border-primary-200 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-800 text-xs flex-shrink-0" role="toolbar" aria-label="一括操作">
        <span className="font-semibold text-primary-700 dark:text-primary-200 mr-2">{selectedIds.size} 件選択中</span>
        <button type="button" onClick={() => selectAll(visibleIds)} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-800"><FontAwesomeIcon icon={faListCheck} />表示中をすべて選択</button>
        <button type="button" onClick={() => setExportModalOpen(true)} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-800"><FontAwesomeIcon icon={faFileExport} />書き出し</button>
        <button type="button" onClick={onBulkDelete} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-status-danger hover:bg-red-50 dark:hover:bg-red-900/20"><FontAwesomeIcon icon={faTrash} />削除</button>
        <span className="ml-auto"><IconButton icon={faXmark} label="選択を解除 (Esc)" size="sm" onClick={clearSelection} /></span>
      </div>
    );
  }

  const filtered = filter !== 'all' || searchQuery.trim() !== '';
  return (
    <div className="flex items-center gap-2 px-3 h-10 border-b border-surface-border/70 dark:border-dark-border/70 text-xs flex-shrink-0">
      {/* The label may be cut short in a narrow list, the count never is. */}
      <span className="flex-1 min-w-0 flex items-baseline gap-1.5">
        {/* "すべて" is already the active chip; a narrow list keeps only the count. */}
        <span className={`min-w-0 truncate ${compact && !filtered ? 'lg:hidden xl:inline' : ''}`}>
          <b className="font-semibold text-ink-primary dark:text-slate-100">{filterLabel(filter, profiles)}</b>
          {searchQuery.trim() && <span className="text-ink-secondary"> ・「{searchQuery.trim()}」</span>}
        </span>
        <span className="flex-shrink-0 text-ink-placeholder tabular-nums whitespace-nowrap">{filtered ? `${count.toLocaleString()} / ${total.toLocaleString()}件` : `${count.toLocaleString()}件`}</span>
      </span>
      {filtered && (
        <button type="button" onClick={() => { setFilter('all'); setSearchQuery(''); }} className="flex items-center gap-1 px-2 py-1 rounded-md text-ink-secondary hover:bg-surface-card dark:hover:bg-dark-surface flex-shrink-0">
          <FontAwesomeIcon icon={faFilterCircleXmark} />解除
        </button>
      )}
      {compact && (
        <button
          type="button"
          onClick={() => setSelecting(!isSelecting)}
          aria-pressed={isSelecting}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md border whitespace-nowrap flex-shrink-0 ${
            isSelecting ? 'bg-primary-100 border-primary-200 text-primary-700 dark:bg-primary-900/40 dark:border-primary-800 dark:text-primary-200' : 'border-surface-border dark:border-dark-border text-ink-secondary hover:bg-surface-card dark:hover:bg-dark-surface'
          }`}
        >
          <FontAwesomeIcon icon={faListCheck} />選択
        </button>
      )}
      <div className="flex bg-surface-base dark:bg-dark-surface rounded-lg p-0.5 flex-shrink-0" role="radiogroup" aria-label="グループ表示">
        {([['kana', '五十音'], ['org', '組織別']] as const).map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={groupMode === k}
            onClick={() => setGroupMode(k)}
            className={`px-2.5 py-0.5 rounded-md transition-colors ${groupMode === k ? 'bg-white dark:bg-dark-card shadow-card font-medium text-ink-primary dark:text-slate-100' : 'text-ink-secondary'}`}
          >
            {l}
          </button>
        ))}
      </div>
      <Popover trigger={({ onClick }) => <IconButton icon={faSliders} label="表示密度" size="sm" onClick={onClick} />}>
        {close => (
          <>
            <PopoverLabel>表示密度</PopoverLabel>
            {DENSITY.map(([d, label]) => (
              <PopoverItem key={d} icon={density === d ? faCheck : undefined} label={label} active={density === d} onClick={() => { setDensity(d); close(); }} />
            ))}
          </>
        )}
      </Popover>
    </div>
  );
}

// Bulk actions for the two-line list, at the bottom where a thumb reaches.
export function SelectionBar({ visibleIds, onBulkDelete }: { visibleIds: string[]; onBulkDelete: () => void }) {
  const { selectedIds, selectAll, clearSelection, setExportModalOpen } = useUIStore();
  const none = selectedIds.size === 0;
  const btn = 'flex flex-col items-center gap-0.5 py-1.5 text-2xs disabled:opacity-40';
  return (
    <div className="flex-shrink-0 border-t border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/30 pb-[env(safe-area-inset-bottom)]" role="toolbar" aria-label="一括操作">
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center px-2">
        <span className="px-2 text-xs font-semibold text-primary-700 dark:text-primary-200 whitespace-nowrap tabular-nums">{selectedIds.size} 件選択中</span>
        <button type="button" onClick={() => selectAll(visibleIds)} className={`${btn} text-primary-700 dark:text-primary-200`}><FontAwesomeIcon icon={faListCheck} className="text-base" />すべて選択</button>
        <button type="button" disabled={none} onClick={() => setExportModalOpen(true)} className={`${btn} text-primary-700 dark:text-primary-200`}><FontAwesomeIcon icon={faFileExport} className="text-base" />書き出し</button>
        <button type="button" disabled={none} onClick={onBulkDelete} className={`${btn} text-status-danger`}><FontAwesomeIcon icon={faTrash} className="text-base" />削除</button>
        <IconButton icon={faXmark} label="選択を終了 (Esc)" onClick={clearSelection} />
      </div>
    </div>
  );
}
