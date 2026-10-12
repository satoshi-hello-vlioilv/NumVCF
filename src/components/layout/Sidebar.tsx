import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faAddressBook, faPlus, faUsers, faStar, faThumbTack, faFileCode, faFileImport, faFileExport,
  faGear, faMoon, faSun,
} from '@fortawesome/free-solid-svg-icons';
import { useContactStore } from '../../store/contactStore';
import { useFormatProfileStore } from '../../store/formatProfileStore';
import { useUIStore } from '../../store/uiStore';
import { IconButton } from '../ui/IconButton';
import { tagStyle } from '../../utils/tagStyle';
import { useFacets } from './useFacets';

function NavItem({ icon, label, count, active, onClick, bar }: {
  icon: IconDefinition; label: string; count: number; active: boolean; onClick: () => void; bar?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
        active ? 'bg-primary-100 text-primary-700 font-medium dark:bg-primary-900/40 dark:text-primary-200' : 'text-ink-primary dark:text-slate-200 hover:bg-surface-card dark:hover:bg-dark-surface'
      }`}
    >
      <FontAwesomeIcon icon={icon} className={`w-3.5 text-xs ${active ? 'text-primary-600' : 'text-ink-placeholder'}`} />
      <span className="flex-1 text-left truncate">{label}</span>
      {bar !== undefined && (
        <span className="w-10 h-1 rounded bg-surface-card dark:bg-dark-surface overflow-hidden" aria-hidden>
          <span className="block h-1 bg-primary-300" style={{ width: `${Math.max(bar * 100, 6)}%` }} />
        </span>
      )}
      <span className="w-6 text-right text-2xs text-ink-placeholder tabular-nums">{count}</span>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-2.5 pt-4 pb-1.5 text-2xs font-semibold text-ink-placeholder tracking-wider">{children}</p>;
}

export function Sidebar() {
  const navigate = useNavigate();
  const { contacts, filter, setFilter } = useContactStore();
  const { profiles } = useFormatProfileStore();
  const { isDarkMode, toggleDarkMode, setImportModalOpen, setExportModalOpen } = useUIStore();
  const { tags, sources } = useFacets(contacts, profiles);
  const maxSource = Math.max(1, ...sources.map(s => s.count));

  return (
    <aside className="w-56 flex-shrink-0 h-full flex flex-col bg-surface-base dark:bg-dark-base border-r border-surface-border dark:border-dark-border">
      <div className="flex items-center gap-2 px-4 h-14 flex-shrink-0">
        <FontAwesomeIcon icon={faAddressBook} className="text-primary-500 text-lg" />
        <span className="font-bold text-primary-700 dark:text-primary-300 tracking-tight">NumVCF</span>
        <span className="text-2xs font-mono text-ink-placeholder">v{__APP_VERSION__}</span>
        <span className="ml-auto">
          <IconButton icon={isDarkMode ? faSun : faMoon} label={isDarkMode ? 'ライトモード' : 'ダークモード'} size="sm" onClick={toggleDarkMode} />
        </span>
      </div>

      <div className="px-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => navigate('/add')}
          title="連絡先を追加 (Ctrl+N)"
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} />連絡先を追加
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="絞り込み">
        <div className="space-y-0.5">
          <NavItem icon={faUsers} label="すべて" count={contacts.length} active={filter === 'all'} onClick={() => setFilter('all')} />
          <NavItem icon={faStar} label="お気に入り" count={contacts.filter(c => c.meta.isFavorite).length} active={filter === 'fav'} onClick={() => setFilter('fav')} />
          <NavItem icon={faThumbTack} label="ピン留め" count={contacts.filter(c => c.meta.isPinned).length} active={filter === 'pin'} onClick={() => setFilter('pin')} />
        </div>

        {tags.length > 0 && (
          <>
            <SectionLabel>タグ</SectionLabel>
            <div className="flex flex-wrap gap-1 px-2">
              {tags.map(({ name, count }) => {
                const active = filter === `tag:${name}`;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFilter(active ? 'all' : `tag:${name}`)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${active ? 'bg-primary-500 text-white' : tagStyle(name)}`}
                  >
                    {name}<span className="opacity-60 text-2xs">{count}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {sources.length > 0 && (
          <>
            <SectionLabel>取り込み元</SectionLabel>
            <div className="space-y-0.5">
              {sources.map(s => (
                <NavItem key={s.id} icon={faFileCode} label={s.label} count={s.count} bar={s.count / maxSource} active={filter === `fmt:${s.id}`} onClick={() => setFilter(`fmt:${s.id}`)} />
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="grid grid-cols-3 gap-1 p-2 border-t border-surface-border dark:border-dark-border flex-shrink-0">
        {([
          [faFileImport, 'インポート', () => setImportModalOpen(true), 'Ctrl+I'],
          [faFileExport, 'エクスポート', () => setExportModalOpen(true), 'Ctrl+Shift+E'],
          [faGear, '設定', () => navigate('/settings'), ''],
        ] as const).map(([icon, label, onClick, key]) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            title={key ? `${label} (${key})` : label}
            className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-2xs text-ink-secondary hover:bg-surface-card dark:hover:bg-dark-surface transition-colors"
          >
            <FontAwesomeIcon icon={icon} className="text-sm" />{label}
          </button>
        ))}
      </div>
    </aside>
  );
}
