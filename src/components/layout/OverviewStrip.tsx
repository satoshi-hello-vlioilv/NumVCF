import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faStar, faClockRotateLeft, faTags } from '@fortawesome/free-solid-svg-icons';
import { useContactStore } from '../../store/contactStore';
import { isWithinDays } from '../../utils/date';

export function OverviewStrip() {
  const { contacts, setFilter } = useContactStore();
  const tagCount = new Set(contacts.flatMap(c => c.meta.tags)).size;
  const stats = [
    { icon: faUsers, label: '連絡先', value: contacts.length, onClick: () => setFilter('all') },
    { icon: faStar, label: 'お気に入り', value: contacts.filter(c => c.meta.isFavorite).length, onClick: () => setFilter('fav') },
    { icon: faClockRotateLeft, label: '30日以内に更新', value: contacts.filter(c => isWithinDays(c.meta.updatedAt, 30)).length },
    { icon: faTags, label: 'タグ', value: tagCount },
  ];
  return (
    <div className="flex items-center gap-6 px-4 py-2 border-b border-surface-border dark:border-dark-border bg-white dark:bg-dark-card text-xs flex-shrink-0">
      {stats.map(s => {
        const body = <><FontAwesomeIcon icon={s.icon} className="text-ink-placeholder" />{s.label}<b className="text-sm font-semibold text-ink-primary dark:text-slate-100 tabular-nums">{s.value}</b></>;
        return s.onClick
          ? <button key={s.label} type="button" onClick={s.onClick} className="flex items-center gap-1.5 text-ink-secondary hover:text-primary-600">{body}</button>
          : <span key={s.label} className="flex items-center gap-1.5 text-ink-secondary">{body}</span>;
      })}
    </div>
  );
}
