import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAddressBook, faPlus, faEllipsisVertical, faFileImport, faFileExport, faGear, faMoon, faSun,
  faStar, faThumbTack, faTag, faFileCode, faChevronDown, faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useContactStore } from '../../store/contactStore';
import { useFormatProfileStore } from '../../store/formatProfileStore';
import { useUIStore } from '../../store/uiStore';
import { SearchInput } from '../search/SearchInput';
import { IconButton } from '../ui/IconButton';
import { Popover, PopoverItem, PopoverDivider } from '../ui/Popover';
import { Sheet } from '../ui/Sheet';
import { useFacets } from './useFacets';
import { profileShortLabel } from '../../utils/profileLabel';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const HEADER_BTN = 'flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-card dark:hover:bg-dark-surface whitespace-nowrap';

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border whitespace-nowrap transition-colors ${
        active ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white dark:bg-dark-card border-surface-border dark:border-dark-border text-ink-secondary'
      }`}
    >
      {children}
    </button>
  );
}

function PickerRow({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left ${active ? 'bg-primary-50 text-primary-700' : 'hover:bg-surface-base'}`}>
      <span className="w-4 text-xs">{active && <FontAwesomeIcon icon={faCheck} />}</span>
      <span className="flex-1">{label}</span>
      <span className="text-xs text-ink-placeholder">{count}</span>
    </button>
  );
}

// One header for every width, so search and filters never move when the window
// is resized or a contact is opened.
export function TopBar() {
  const navigate = useNavigate();
  const { contacts, filter, setFilter } = useContactStore();
  const { profiles } = useFormatProfileStore();
  const { isDarkMode, toggleDarkMode, setImportModalOpen, setExportModalOpen } = useUIStore();
  const { tags, sources } = useFacets(contacts, profiles);
  const [picker, setPicker] = useState<'tag' | 'src' | null>(null);
  const tagActive = filter.startsWith('tag:');
  const srcActive = filter.startsWith('fmt:');

  const choose = (f: string) => { setFilter(f); setPicker(null); };
  const isLg = useMediaQuery('(min-width: 1024px)');

  return (
    <div className="flex-shrink-0 bg-white dark:bg-dark-card border-b border-surface-border dark:border-dark-border">
      <div className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 h-12 lg:h-14">
        <span className="flex items-center gap-2 flex-shrink-0">
          <FontAwesomeIcon icon={faAddressBook} className="text-primary-500 text-lg" aria-label="NumVCF" />
          <span className="hidden sm:inline font-bold text-primary-700 dark:text-primary-300 tracking-tight">NumVCF</span>
          <span className="hidden sm:inline text-2xs font-mono text-ink-placeholder">v{__APP_VERSION__}</span>
        </span>
        <div className="flex-1 min-w-0 lg:flex-none lg:w-[28rem] xl:w-[34rem]">
          <SearchInput placeholder={isLg ? '名前・会社・電話番号・メール・タグで検索（/）' : '検索'} />
        </div>
        <span className="hidden lg:block flex-1" />
        {isLg && (
          <>
            <button type="button" onClick={() => setImportModalOpen(true)} title="VCF インポート (Ctrl+I)" className={HEADER_BTN}><FontAwesomeIcon icon={faFileImport} />取り込み</button>
            <button type="button" onClick={() => setExportModalOpen(true)} title="VCF エクスポート (Ctrl+Shift+E)" className={HEADER_BTN}><FontAwesomeIcon icon={faFileExport} />書き出し</button>
            <button type="button" onClick={() => navigate('/add')} title="連絡先を追加 (Ctrl+N)" className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm whitespace-nowrap"><FontAwesomeIcon icon={faPlus} />追加</button>
          </>
        )}
        {!isLg && <IconButton icon={faPlus} label="連絡先を追加" tone="primary" onClick={() => navigate('/add')} />}
        <Popover trigger={({ onClick }) => <IconButton icon={faEllipsisVertical} label="メニュー" onClick={onClick} />}>
          {close => (
            <>
              {!isLg && <>
                <PopoverItem icon={faFileImport} label="VCF インポート" onClick={() => { setImportModalOpen(true); close(); }} />
                <PopoverItem icon={faFileExport} label="VCF エクスポート" onClick={() => { setExportModalOpen(true); close(); }} />
                <PopoverDivider />
              </>}
              <PopoverItem icon={isDarkMode ? faSun : faMoon} label={isDarkMode ? 'ライトモード' : 'ダークモード'} onClick={() => { toggleDarkMode(); close(); }} />
              <PopoverItem icon={faGear} label="設定" onClick={() => { navigate('/settings'); close(); }} />
              <div className="px-3 pt-1 pb-1.5 text-2xs font-mono text-ink-placeholder">NumVCF v{__APP_VERSION__}</div>
            </>
          )}
        </Popover>
      </div>
      <div className="flex gap-1.5 overflow-x-auto px-3 lg:px-4 pb-2 [scrollbar-width:none]">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>すべて <span className="opacity-70">{contacts.length}</span></Chip>
        <Chip active={filter === 'fav'} onClick={() => setFilter('fav')}><FontAwesomeIcon icon={faStar} className="text-2xs" />お気に入り</Chip>
        <Chip active={filter === 'pin'} onClick={() => setFilter('pin')}><FontAwesomeIcon icon={faThumbTack} className="text-2xs" />ピン留め</Chip>
        <Chip active={tagActive} onClick={() => setPicker('tag')}>
          <FontAwesomeIcon icon={faTag} className="text-2xs" />{tagActive ? filter.slice(4) : 'タグ'}<FontAwesomeIcon icon={faChevronDown} className="text-[8px]" />
        </Chip>
        <Chip active={srcActive} onClick={() => setPicker('src')}>
          <FontAwesomeIcon icon={faFileCode} className="text-2xs" />{srcActive ? profileShortLabel(filter.slice(4), profiles) : '取り込み元'}<FontAwesomeIcon icon={faChevronDown} className="text-[8px]" />
        </Chip>
      </div>

      <Sheet title="タグで絞り込み" open={picker === 'tag'} onClose={() => setPicker(null)}>
        {tags.length === 0 && <p className="p-4 text-sm text-ink-placeholder">タグはまだありません</p>}
        {tags.map(t => <PickerRow key={t.name} label={t.name} count={t.count} active={filter === `tag:${t.name}`} onClick={() => choose(`tag:${t.name}`)} />)}
      </Sheet>
      <Sheet title="取り込み元で絞り込み" open={picker === 'src'} onClose={() => setPicker(null)}>
        {sources.map(s => <PickerRow key={s.id} label={s.label} count={s.count} active={filter === `fmt:${s.id}`} onClick={() => choose(`fmt:${s.id}`)} />)}
      </Sheet>
    </div>
  );
}
