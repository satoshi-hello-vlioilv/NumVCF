import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faThumbTack, faBuilding, faPhone, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { Avatar } from '../ui/Avatar';
import { useContactStore } from '../../store/contactStore';
import { useUIStore } from '../../store/uiStore';
import type { Contact, DisplayDensity } from '../../types/contact';
import type { GroupMode } from '../../utils/grouping';
import type { VirtualRowsModel } from '../../hooks/useVirtualRows';

const ROW_PAD: Record<DisplayDensity, string> = { compact: 'py-1.5', comfortable: 'py-2', spacious: 'py-3' };

function subline(c: Contact, mode: GroupMode) {
  if (mode === 'org') return [c.department, c.title].filter(Boolean).join(' · ') || '—';
  return c.organization ?? '所属なし';
}

function GroupHeader({ label, count, mode, overlay }: { label: string; count: number; mode: GroupMode; overlay?: boolean }) {
  return (
    <div className={`${overlay ? 'absolute inset-x-0 top-0' : ''} flex items-center gap-1.5 px-4 h-[26px] bg-surface-base/95 dark:bg-dark-base/95 backdrop-blur border-b border-surface-border/60 dark:border-dark-border/60`}>
      {mode === 'org' && <FontAwesomeIcon icon={faBuilding} className="text-2xs text-primary-400" />}
      <span className="flex-1 text-2xs font-semibold text-primary-700 dark:text-primary-300 truncate">{label}</span>
      <span className="text-2xs text-ink-placeholder">{count}</span>
    </div>
  );
}

interface ContactMobileListProps {
  virtual: VirtualRowsModel;
  mode: GroupMode;
  // Full-width list: the number becomes a call button. Next to an open
  // detail the list is narrow and the detail already has the call actions.
  callButton?: boolean;
}

export function ContactMobileList({ virtual, mode, callButton }: ContactMobileListProps) {
  const { selectedId, setSelectedId } = useContactStore();
  const { density, selectedIds, isSelecting, toggleSelectId } = useUIStore();
  const multi = isSelecting || selectedIds.size > 0;
  const current = virtual.currentGroup;

  return (
    <div>
      {current?.label && (
        <div className="sticky top-0 z-10 h-0">
          <GroupHeader label={current.label} count={current.contacts.length} mode={mode} overlay />
        </div>
      )}
      {virtual.paddingTop > 0 && <div aria-hidden style={{ height: virtual.paddingTop }} />}
      {virtual.items.map(item => {
        const row = virtual.rows[item.index];
        if (row.kind === 'group') {
          return (
            <div key={item.key} data-index={item.index} ref={virtual.measure}>
              <GroupHeader label={row.group.label} count={row.group.contacts.length} mode={mode} />
            </div>
          );
        }
        const c = row.contact;
        const phone = c.phones.find(p => !p.label.includes('fax'))?.value;
        const checked = selectedIds.has(c.id);
        return (
          <div
            key={item.key}
            data-index={item.index}
            ref={virtual.measure}
            role="button"
            tabIndex={0}
            aria-pressed={multi ? checked : undefined}
            onClick={() => (multi ? toggleSelectId(c.id) : setSelectedId(c.id))}
            onKeyDown={e => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              if (multi) toggleSelectId(c.id); else setSelectedId(c.id);
            }}
            onContextMenu={e => { e.preventDefault(); toggleSelectId(c.id); }}
            className={`w-full flex items-center gap-3 px-4 ${ROW_PAD[density]} text-left cursor-pointer border-b border-surface-border/40 dark:border-dark-border/40 ${
              checked || selectedId === c.id ? 'bg-primary-50 dark:bg-primary-900/30' : 'active:bg-surface-base'
            }`}
          >
            {multi
              ? (
                <span className="w-9 h-9 flex items-center justify-center flex-shrink-0" aria-hidden>
                  {checked
                    ? <FontAwesomeIcon icon={faCircleCheck} className="text-[22px] text-primary-500" />
                    : <span className="w-[22px] h-[22px] rounded-full border-2 border-ink-placeholder/50" />}
                </span>
              )
              : <Avatar name={c.name.formatted} family={c.name.family} given={c.name.given} photo={c.photo} size="md" />}
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-ink-primary dark:text-slate-100 truncate">{c.name.formatted}</span>
                {c.meta.isPinned && <FontAwesomeIcon icon={faThumbTack} className="text-2xs text-primary-400" />}
                {c.meta.isFavorite && <FontAwesomeIcon icon={faStar} className="text-2xs text-amber-400" />}
              </span>
              <span className="flex items-center gap-2 text-xs min-w-0">
                <span className="truncate text-ink-secondary">{subline(c, mode)}</span>
                {phone && !callButton && <span className="ml-auto font-mono text-ink-placeholder flex-shrink-0">{phone}</span>}
              </span>
            </span>
            {phone && callButton && !multi && (
              <a
                href={`tel:${phone}`}
                onClick={e => e.stopPropagation()}
                aria-label={`${phone} に発信`}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-200 text-xs font-mono active:bg-primary-100"
              >
                <FontAwesomeIcon icon={faPhone} className="text-2xs" />{phone}
              </a>
            )}
          </div>
        );
      })}
      {virtual.paddingBottom > 0 && <div aria-hidden style={{ height: virtual.paddingBottom }} />}
    </div>
  );
}
