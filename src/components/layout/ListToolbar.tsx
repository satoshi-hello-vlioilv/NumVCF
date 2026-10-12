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
  visibleIds: string[];
  onBulkDelete: () => void;
}

export function ListToolbar({ count, visibleIds, onBulkDelete }: ListToolbarProps) {
  const { filter, setFilter, searchQuery, setSearchQuery } = useContactStore();
  const { profiles } = useFormatProfileStore();
  const { groupMode, setGroupMode, density, setDensity, selectedIds, clearSelection, selectAll, setExportModalOpen } = useUIStore();

  if (selectedIds.size > 0) {
    return (
      <div className="flex items-center gap-1 px-3 h-10 border-b border-primary-200 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-800 text-xs flex-shrink-0" role="toolbar" aria-label="一括操作">
        <span className="font-semibold text-primary-700 dark:text-primary-200 mr-2">{selectedIds.size} 件選択中</span>
        <button type="button" onClick={() => selectAll(visibleIds)} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-800"><FontAwesomeIcon icon={faListCheck} />表示中をすべて選択</button>
        <button type="button" onClick={() => setExportModalOpen(true)} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-800"><FontAwesomeIcon icon={faFileExport} />エクスポート</button>
        <button type="button" onClick={onBulkDelete} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-status-danger hover:bg-red-50 dark:hover:bg-red-900/20"><FontAwesomeIcon icon={faTrash} />削除</button>
        <span className="ml-auto"><IconButton icon={faXmark} label="選択を解除 (Esc)" size="sm" onClick={clearSelection} /></span>
      </div>
    );
  }

  const filtered = filter !== 'all' || searchQuery.trim() !== '';
  return (
    <div className="flex items-center gap-2 px-3 h-10 border-b border-surface-border/70 dark:border-dark-border/70 text-xs flex-shrink-0">
      <span className="flex-1 min-w-0 truncate">
        <b className="font-semibold text-ink-primary dark:text-slate-100">{filterLabel(filter, profiles)}</b>
        {searchQuery.trim() && <span className="text-ink-secondary"> ・「{searchQuery.trim()}」</span>}
        <span className="ml-1.5 text-ink-placeholder tabular-nums">{count}件</span>
      </span>
      {filtered && (
        <button type="button" onClick={() => { setFilter('all'); setSearchQuery(''); }} className="flex items-center gap-1 px-2 py-1 rounded-md text-ink-secondary hover:bg-surface-card dark:hover:bg-dark-surface flex-shrink-0">
          <FontAwesomeIcon icon={faFilterCircleXmark} />解除
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
