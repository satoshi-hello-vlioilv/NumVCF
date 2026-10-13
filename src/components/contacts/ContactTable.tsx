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
import type { GroupMode } from '../../utils/grouping';
import type { VirtualRowsModel } from '../../hooks/useVirtualRows';
import { profileShortLabel } from '../../utils/profileLabel';
import { relativeDate } from '../../utils/date';
import { WIDE_TABLE_MIN } from './tableLayout';

type Col = 'check' | 'name' | 'org' | 'phone' | 'email' | 'tags' | 'source' | 'updated' | 'person' | 'contact' | 'actions';


const SORTABLE: Partial<Record<Col, SortField>> = { name: 'name', person: 'name', org: 'organization', updated: 'updatedAt' };
const ROW_PAD: Record<DisplayDensity, string> = { compact: 'py-1', comfortable: 'py-1.5', spacious: 'py-2.5' };
// Column widths are computed from the measured list width: with virtualized
// rows an auto table layout would re-measure columns from whichever rows
// happen to be rendered and jitter.
const FIXED: Partial<Record<Col, number>> = { check: 40, phone: 152, source: 96, updated: 88, actions: 128 };
const WEIGHT: Partial<Record<Col, number>> = { name: 19, org: 22, email: 21, tags: 13, person: 34, contact: 28 };

function tableColumns(width: number): Col[] {
  if (width >= WIDE_TABLE_MIN) return ['check', 'name', 'org', 'phone', 'email', 'tags', 'source', 'updated', 'actions'];
  const cols: Col[] = ['check', 'person', 'contact'];
  if (width >= 780) cols.push('tags');
  if (width >= 1100) cols.push('source');
  return [...cols, 'actions'];
}

function columnWidths(cols: Col[], width: number) {
  const fixed = cols.reduce((s, c) => s + (FIXED[c] ?? 0), 0);
  const weights = cols.reduce((s, c) => s + (WEIGHT[c] ?? 0), 0);
  const flexible = Math.max(width - fixed, weights * 6);
  return cols.map(c => FIXED[c] ?? Math.floor((flexible * (WEIGHT[c] ?? 0)) / weights));
}

function copy(text: string, label: string) {
  navigator.clipboard.writeText(text)
    .then(() => useUIStore.getState().addToast({ type: 'success', message: `${label}をコピーしました` }))
    .catch(() => useUIStore.getState().addToast({ type: 'error', message: 'コピーできませんでした' }));
}

function firstDialable(c: Contact) {
  return c.phones.find(p => !p.label.includes('fax'));
}

const CHECKBOX = 'w-4 h-4 accent-primary-500 dark:[color-scheme:dark] cursor-pointer';

interface ContactTableProps {
  virtual: VirtualRowsModel;
  mode: GroupMode;
  width: number;
}

export function ContactTable({ virtual, mode, width }: ContactTableProps) {
  const { selectedId, setSelectedId, sortField, sortOrder, setSortField, setSortOrder, toggleFavorite } = useContactStore();
  const { profiles } = useFormatProfileStore();
  const { density, selectedIds, isSelecting, toggleSelectId, selectAll, clearSelection } = useUIStore();
  const multi = isSelecting || selectedIds.size > 0;

  const cols = tableColumns(width);
  const widths = columnWidths(cols, width);
  const visibleIds = virtual.rows.flatMap(r => (r.kind === 'contact' ? [r.contact.id] : []));
  const allChecked = visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id));
  const orgHeader = mode === 'org' ? '部署 · 役職' : '会社 › 部署';
  const headers: Record<Col, React.ReactNode> = {
    check: (
      <input
        type="checkbox"
        aria-label="表示中をすべて選択"
        checked={allChecked}
        ref={el => { if (el) el.indeterminate = !allChecked && selectedIds.size > 0; }}
        onChange={() => (allChecked ? clearSelection() : selectAll(visibleIds))}
        className={CHECKBOX}
      />
    ),
    name: '名前', org: orgHeader, phone: '電話', email: 'メール', tags: 'タグ', source: '取り込み元', updated: '更新',
    person: `名前 / ${mode === 'org' ? '部署' : '会社'}`, contact: '電話 / メール', actions: <span className="sr-only">操作</span>,
  };

  const onSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder(field === 'updatedAt' ? 'desc' : 'asc'); }
  };

  const orgText = (c: Contact) => (mode === 'org'
    ? [c.department, c.title].filter(Boolean).join(' · ')
    : [c.organization, c.department].filter(Boolean).join(' › '));
  const dash = <span className="text-ink-placeholder">—</span>;
  const slot = <span className="w-7 h-7 flex-shrink-0" aria-hidden />;

  const renderCell = (c: Contact, col: Col) => {
    const tel = firstDialable(c);
    const email = c.emails[0]?.value;
    switch (col) {
      case 'check':
        return (
          <input
            type="checkbox"
            aria-label={`${c.name.formatted} を選択`}
            checked={selectedIds.has(c.id)}
            onChange={() => toggleSelectId(c.id)}
            onClick={e => e.stopPropagation()}
            className={CHECKBOX}
          />
        );
      case 'name':
      case 'person':
        return (
          <span className="flex items-center gap-2 min-w-0">
            <Avatar name={c.name.formatted} family={c.name.family} given={c.name.given} photo={c.photo} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="font-medium text-ink-primary dark:text-slate-100 truncate" title={c.name.formatted}>{c.name.formatted}</span>
                {c.meta.isPinned && <FontAwesomeIcon icon={faThumbTack} className="text-2xs text-primary-400 flex-shrink-0" aria-label="ピン留め" />}
                {c.meta.isFavorite && <FontAwesomeIcon icon={faStar} className="text-2xs text-amber-400 flex-shrink-0" aria-label="お気に入り" />}
              </span>
              {col === 'person' && <span className="block text-xs text-ink-secondary dark:text-slate-400 truncate">{orgText(c) || (mode === 'org' ? '—' : '所属なし')}</span>}
            </span>
          </span>
        );
      case 'org':
        return orgText(c) || dash;
      case 'phone':
        return c.phones[0] ? <span className="font-mono">{c.phones[0].value}</span> : dash;
      case 'email':
        return email ?? dash;
      case 'contact':
        return (
          <span className="block min-w-0 leading-5">
            {tel
              ? <a href={`tel:${tel.value}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 font-mono text-primary-700 dark:text-primary-300 hover:underline truncate"><FontAwesomeIcon icon={faPhone} className="text-2xs" />{tel.value}</a>
              : <span className="block">{c.phones[0] ? <span className="font-mono">{c.phones[0].value}</span> : dash}</span>}
            {email
              ? <a href={`mailto:${email}`} onClick={e => e.stopPropagation()} title={email} className="flex items-center gap-1.5 text-primary-700/90 dark:text-primary-300/90 hover:underline min-w-0"><FontAwesomeIcon icon={faEnvelope} className="text-2xs" /><span className="truncate">{email}</span></a>
              : <span className="block">{dash}</span>}
          </span>
        );
      case 'tags':
        return c.meta.tags.length ? <span className="flex gap-1">{c.meta.tags.slice(0, 2).map(t => <TagChip key={t} name={t} />)}{c.meta.tags.length > 2 && <span className="text-2xs text-ink-placeholder self-center">+{c.meta.tags.length - 2}</span>}</span> : null;
      case 'source':
        return profileShortLabel(c.meta.formatProfileId, profiles);
      case 'updated':
        return <span title={new Date(c.meta.updatedAt).toLocaleString('ja-JP')}>{relativeDate(c.meta.updatedAt)}</span>;
      case 'actions':
        // Always visible (touch screens have no hover), with empty slots so
        // each action stays in the same column on every row.
        return (
          <span className="flex justify-end" onClick={e => e.stopPropagation()}>
            {tel ? <IconButton icon={faPhone} label={`${tel.value} に発信`} href={`tel:${tel.value}`} size="sm" tone="primary" /> : slot}
            {email ? <IconButton icon={faEnvelope} label={`${email} にメール`} href={`mailto:${email}`} size="sm" /> : slot}
            {tel ? <IconButton icon={faCopy} label="電話番号をコピー" onClick={() => copy(tel.value, '電話番号')} size="sm" /> : slot}
            <IconButton icon={faStar} label={c.meta.isFavorite ? 'お気に入りから外す' : 'お気に入りに追加'} tone="favorite" active={c.meta.isFavorite} onClick={() => toggleFavorite(c.id)} size="sm" />
          </span>
        );
    }
  };

  const cellPad = (col: Col) => (col === 'check' ? 'pl-3 pr-0' : col === 'actions' ? 'px-2' : 'px-3');
  const cellText = (col: Col) => {
    if (col === 'name' || col === 'person') return '';
    const wrap = col === 'phone' || col === 'updated' || col === 'source' ? 'whitespace-nowrap' : col === 'contact' || col === 'check' || col === 'actions' ? '' : 'truncate';
    return `text-xs text-ink-secondary dark:text-slate-300 ${wrap}`;
  };

  return (
    <table className="w-full table-fixed text-sm border-separate border-spacing-0">
      <colgroup>
        {cols.map((col, i) => <col key={col} style={{ width: widths[i] }} />)}
      </colgroup>
      <thead className="sticky top-0 z-20 bg-white dark:bg-dark-card text-2xs text-ink-placeholder">
        <tr>
          {cols.map(col => {
            const field = SORTABLE[col];
            const active = field && sortField === field;
            return (
              <th key={col} scope="col" className={`text-left font-semibold ${cellPad(col)} py-2 border-b border-surface-border dark:border-dark-border whitespace-nowrap`}>
                {field ? (
                  <button type="button" onClick={() => onSort(field)} className={`inline-flex items-center gap-1 hover:text-ink-primary ${active ? 'text-primary-600' : ''}`}>
                    {headers[col]}
                    <FontAwesomeIcon icon={active ? (sortOrder === 'asc' ? faSortUp : faSortDown) : faSort} className={`text-[9px] ${active ? '' : 'opacity-40'}`} />
                  </button>
                ) : headers[col]}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {virtual.paddingTop > 0 && <tr aria-hidden style={{ height: virtual.paddingTop }}><td colSpan={cols.length} /></tr>}
        {virtual.items.map(item => {
          const row = virtual.rows[item.index];
          if (row.kind === 'group') {
            const g = row.group;
            return (
              <tr key={item.key} data-index={item.index} ref={virtual.measure}>
                <td colSpan={cols.length} className="px-3 py-1 text-2xs font-semibold text-primary-700 dark:text-primary-300 bg-surface-base dark:bg-dark-base border-b border-surface-border/60 dark:border-dark-border/60">
                  {mode === 'org' && <FontAwesomeIcon icon={faBuilding} className="mr-1.5 text-primary-400" />}
                  {g.label}
                  <span className="ml-2 font-normal text-ink-placeholder">{g.contacts.length}</span>
                </td>
              </tr>
            );
          }
          const c = row.contact;
          const isSel = selectedId === c.id;
          return (
            <tr
              key={item.key}
              data-index={item.index}
              ref={virtual.measure}
              onClick={() => (multi ? toggleSelectId(c.id) : setSelectedId(c.id))}
              onContextMenu={e => { e.preventDefault(); toggleSelectId(c.id); }}
              aria-selected={isSel}
              className={`group cursor-pointer ${
                selectedIds.has(c.id) ? 'bg-primary-50 dark:bg-primary-900/30'
                : isSel ? 'bg-primary-50 dark:bg-primary-900/30 shadow-[inset_3px_0_0_#5B8FAE]'
                : 'hover:bg-surface-base dark:hover:bg-dark-surface'
              }`}
            >
              {cols.map(col => (
                <td key={col} className={`${cellPad(col)} ${ROW_PAD[density]} border-b border-surface-border/50 dark:border-dark-border/50 ${cellText(col)}`}>
                  {renderCell(c, col)}
                </td>
              ))}
            </tr>
          );
        })}
        {virtual.paddingBottom > 0 && <tr aria-hidden style={{ height: virtual.paddingBottom }}><td colSpan={cols.length} /></tr>}
      </tbody>
    </table>
  );
}
