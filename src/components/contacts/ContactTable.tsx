import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar, faThumbTack, faPhone, faEnvelope, faCopy, faBuilding, faSort, faSortUp, faSortDown,
} from '@fortawesome/free-solid-svg-icons';
import { Avatar } from '../ui/Avatar';
import { TagChip } from '../ui/TagChip';
import { IconButton } from '../ui/IconButton';
import { useContactStore } from '../../store/contactStore';
import { useFormatProfileStore } from '../../store/formatProfileStore';
import { useUIStore } from '../../store/uiStore';
import type { Contact, DisplayDensity, SortField } from '../../types/contact';
import { groupAnchorId, type ContactGroup, type GroupMode } from '../../utils/grouping';
import { profileShortLabel } from '../../utils/profileLabel';
import { relativeDate } from '../../utils/date';

type Col = 'name' | 'org' | 'phone' | 'email' | 'tags' | 'source' | 'updated';

const SORTABLE: Partial<Record<Col, SortField>> = { name: 'name', org: 'organization', updated: 'updatedAt' };
const ROW_PAD: Record<DisplayDensity, string> = { compact: 'py-1', comfortable: 'py-1.5', spacious: 'py-2.5' };

function copy(text: string, label: string) {
  navigator.clipboard.writeText(text)
    .then(() => useUIStore.getState().addToast({ type: 'success', message: `${label}をコピーしました` }))
    .catch(() => useUIStore.getState().addToast({ type: 'error', message: 'コピーできませんでした' }));
}

function firstDialable(c: Contact) {
  return c.phones.find(p => !p.label.includes('fax'));
}

interface ContactTableProps {
  groups: ContactGroup[];
  mode: GroupMode;
  narrow: boolean;
}

// Full-width comparison table while browsing; once a contact is open it keeps
// the same rows and sort headers but narrows to name / org / phone so the
// detail panel can sit beside it without hiding the list.
export function ContactTable({ groups, mode, narrow }: ContactTableProps) {
  const { selectedId, setSelectedId, sortField, sortOrder, setSortField, setSortOrder, toggleFavorite } = useContactStore();
  const { profiles } = useFormatProfileStore();
  const { density, selectedIds, toggleSelectId } = useUIStore();
  const selectedRowRef = useRef<HTMLTableRowElement>(null);
  const multi = selectedIds.size > 0;

  const cols: Col[] = narrow ? ['name', 'org', 'phone'] : ['name', 'org', 'phone', 'email', 'tags', 'source', 'updated'];
  const headers: Record<Col, string> = {
    name: '名前', org: mode === 'org' ? '部署 · 役職' : '会社 › 部署', phone: '電話', email: 'メール', tags: 'タグ', source: '取り込み元', updated: '更新',
  };

  useEffect(() => {
    selectedRowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selectedId, narrow]);

  const onSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder(field === 'updatedAt' ? 'desc' : 'asc'); }
  };

  const dash = <span className="text-ink-placeholder">—</span>;
  const renderCell = (c: Contact, col: Col) => {
    switch (col) {
      case 'name':
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span className="relative flex-shrink-0" onClick={e => { e.stopPropagation(); toggleSelectId(c.id); }}>
              <span className={multi ? 'invisible' : 'group-hover:invisible'}>
                <Avatar name={c.name.formatted} family={c.name.family} given={c.name.given} photo={c.photo} size="sm" />
              </span>
              <input
                type="checkbox"
                aria-label={`${c.name.formatted} を選択`}
                checked={selectedIds.has(c.id)}
                readOnly
                tabIndex={-1}
                className={`absolute inset-0 m-auto w-4 h-4 rounded border-surface-border text-primary-500 ${multi ? '' : 'hidden group-hover:block'}`}
              />
            </span>
            <span className="font-medium text-ink-primary dark:text-slate-100 truncate">{c.name.formatted}</span>
            {c.meta.isPinned && <FontAwesomeIcon icon={faThumbTack} className="text-2xs text-primary-400 flex-shrink-0" aria-label="ピン留め" />}
            {c.meta.isFavorite && <FontAwesomeIcon icon={faStar} className="text-2xs text-amber-400 flex-shrink-0" aria-label="お気に入り" />}
          </span>
        );
      case 'org':
        return (mode === 'org'
          ? [c.department, c.title].filter(Boolean).join(' · ')
          : [c.organization, c.department].filter(Boolean).join(' › ')) || dash;
      case 'phone':
        return c.phones[0] ? <span className="font-mono">{c.phones[0].value}</span> : dash;
      case 'email':
        return c.emails[0]?.value ?? dash;
      case 'tags':
        return c.meta.tags.length ? <span className="flex gap-1">{c.meta.tags.slice(0, 2).map(t => <TagChip key={t} name={t} />)}{c.meta.tags.length > 2 && <span className="text-2xs text-ink-placeholder self-center">+{c.meta.tags.length - 2}</span>}</span> : null;
      case 'source':
        return profileShortLabel(c.meta.formatProfileId, profiles);
      case 'updated':
        return <span title={new Date(c.meta.updatedAt).toLocaleString('ja-JP')}>{relativeDate(c.meta.updatedAt)}</span>;
    }
  };

  const colSpan = cols.length + (narrow ? 0 : 1);

  return (
    <table className="w-full text-sm border-separate border-spacing-0">
      <thead className="sticky top-0 z-20 bg-white dark:bg-dark-card text-2xs text-ink-placeholder">
        <tr>
          {cols.map(col => {
            const field = SORTABLE[col];
            const active = field && sortField === field;
            return (
              <th key={col} scope="col" className="text-left font-semibold px-3 py-2 border-b border-surface-border dark:border-dark-border whitespace-nowrap">
                {field ? (
                  <button type="button" onClick={() => onSort(field)} className={`inline-flex items-center gap-1 hover:text-ink-primary ${active ? 'text-primary-600' : ''}`}>
                    {headers[col]}
                    <FontAwesomeIcon icon={active ? (sortOrder === 'asc' ? faSortUp : faSortDown) : faSort} className={`text-[9px] ${active ? '' : 'opacity-40'}`} />
                  </button>
                ) : headers[col]}
              </th>
            );
          })}
          {!narrow && <th scope="col" className="border-b border-surface-border dark:border-dark-border"><span className="sr-only">操作</span></th>}
        </tr>
      </thead>
      {groups.map(g => (
        <tbody key={g.key || 'all'}>
          {g.label && (
            <tr id={groupAnchorId(g.key)} className="scroll-mt-8">
              <td colSpan={colSpan} className="px-3 py-1 text-2xs font-semibold text-primary-700 dark:text-primary-300 bg-surface-base dark:bg-dark-base border-b border-surface-border/60 dark:border-dark-border/60">
                {mode === 'org' && <FontAwesomeIcon icon={faBuilding} className="mr-1.5 text-primary-400" />}
                {g.label}
                <span className="ml-2 font-normal text-ink-placeholder">{g.contacts.length}</span>
              </td>
            </tr>
          )}
          {g.contacts.map(c => {
            const isSel = selectedId === c.id;
            const tel = firstDialable(c);
            return (
              <tr
                key={c.id}
                ref={isSel ? selectedRowRef : undefined}
                onClick={() => (multi ? toggleSelectId(c.id) : setSelectedId(c.id))}
                onContextMenu={e => { e.preventDefault(); toggleSelectId(c.id); }}
                aria-selected={isSel}
                className={`group cursor-pointer ${
                  isSel ? 'bg-primary-50 dark:bg-primary-900/30 shadow-[inset_3px_0_0_#5B8FAE]'
                  : selectedIds.has(c.id) ? 'bg-primary-50/60 dark:bg-primary-900/20'
                  : 'hover:bg-surface-base dark:hover:bg-dark-surface'
                }`}
              >
                {cols.map(col => (
                  <td
                    key={col}
                    className={`px-3 ${ROW_PAD[density]} border-b border-surface-border/50 dark:border-dark-border/50 ${
                      col === 'name' ? 'max-w-[220px]' : 'text-xs text-ink-secondary dark:text-slate-300'
                    } ${col === 'phone' || col === 'updated' || col === 'source' ? 'whitespace-nowrap' : col === 'name' ? '' : narrow ? 'max-w-[150px] truncate' : 'max-w-[240px] truncate'}`}
                  >
                    {renderCell(c, col)}
                  </td>
                ))}
                {!narrow && (
                  <td className={`px-2 ${ROW_PAD[density]} w-36 border-b border-surface-border/50 dark:border-dark-border/50`}>
                    <span className="flex justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100" onClick={e => e.stopPropagation()}>
                      {tel && <IconButton icon={faPhone} label={`${tel.value} に発信`} href={`tel:${tel.value}`} size="sm" tone="primary" />}
                      {c.emails[0] && <IconButton icon={faEnvelope} label={`${c.emails[0].value} にメール`} href={`mailto:${c.emails[0].value}`} size="sm" />}
                      {tel && <IconButton icon={faCopy} label="電話番号をコピー" onClick={() => copy(tel.value, '電話番号')} size="sm" />}
                      <IconButton icon={faStar} label={c.meta.isFavorite ? 'お気に入りから外す' : 'お気に入りに追加'} tone="favorite" active={c.meta.isFavorite} onClick={() => toggleFavorite(c.id)} size="sm" />
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      ))}
    </table>
  );
}
