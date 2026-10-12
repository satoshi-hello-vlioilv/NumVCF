import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faThumbTack, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { Avatar } from '../ui/Avatar';
import { useContactStore } from '../../store/contactStore';
import { useUIStore } from '../../store/uiStore';
import type { Contact, DisplayDensity } from '../../types/contact';
import { groupAnchorId, type ContactGroup, type GroupMode } from '../../utils/grouping';

const ROW_PAD: Record<DisplayDensity, string> = { compact: 'py-1.5', comfortable: 'py-2', spacious: 'py-3' };

function subline(c: Contact, mode: GroupMode) {
  if (mode === 'org') return [c.department, c.title].filter(Boolean).join(' · ') || '—';
  return c.organization ?? '所属なし';
}

export function ContactMobileList({ groups, mode }: { groups: ContactGroup[]; mode: GroupMode }) {
  const { selectedId, setSelectedId } = useContactStore();
  const { density, selectedIds, toggleSelectId } = useUIStore();
  const multi = selectedIds.size > 0;

  return (
    <div>
      {groups.map(g => (
        <section key={g.key || 'all'}>
          {g.label && (
            <div id={groupAnchorId(g.key)} className="sticky top-0 z-10 flex items-center gap-1.5 px-4 py-1 bg-surface-base/95 dark:bg-dark-base/95 backdrop-blur border-b border-surface-border/60 dark:border-dark-border/60">
              {mode === 'org' && <FontAwesomeIcon icon={faBuilding} className="text-2xs text-primary-400" />}
              <span className="flex-1 text-2xs font-semibold text-primary-700 dark:text-primary-300 truncate">{g.label}</span>
              <span className="text-2xs text-ink-placeholder">{g.contacts.length}</span>
            </div>
          )}
          {g.contacts.map(c => {
            const phone = c.phones.find(p => !p.label.includes('fax'))?.value;
            const checked = selectedIds.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => (multi ? toggleSelectId(c.id) : setSelectedId(c.id))}
                onContextMenu={e => { e.preventDefault(); toggleSelectId(c.id); }}
                className={`w-full flex items-center gap-3 px-4 ${ROW_PAD[density]} text-left border-b border-surface-border/40 dark:border-dark-border/40 ${
                  checked || selectedId === c.id ? 'bg-primary-50 dark:bg-primary-900/30' : 'active:bg-surface-base'
                }`}
              >
                {multi
                  ? <input type="checkbox" checked={checked} readOnly tabIndex={-1} aria-label={`${c.name.formatted} を選択`} className="w-5 h-5 mx-2.5 rounded text-primary-500" />
                  : <Avatar name={c.name.formatted} family={c.name.family} given={c.name.given} photo={c.photo} size="md" />}
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-ink-primary dark:text-slate-100 truncate">{c.name.formatted}</span>
                    {c.meta.isPinned && <FontAwesomeIcon icon={faThumbTack} className="text-2xs text-primary-400" />}
                    {c.meta.isFavorite && <FontAwesomeIcon icon={faStar} className="text-2xs text-amber-400" />}
                  </span>
                  <span className="flex items-center gap-2 text-xs min-w-0">
                    <span className="truncate text-ink-secondary">{subline(c, mode)}</span>
                    {phone && <span className="ml-auto font-mono text-ink-placeholder flex-shrink-0">{phone}</span>}
                  </span>
                </span>
              </button>
            );
          })}
        </section>
      ))}
    </div>
  );
}
