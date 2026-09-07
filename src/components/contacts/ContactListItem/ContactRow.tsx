import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid, faThumbTack, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import type { Contact, DisplayDensity } from '../../../types/contact';
import { useContactStore } from '../../../store/contactStore';
import { useUIStore } from '../../../store/uiStore';

interface ContactRowProps {
  contact: Contact;
  density: DisplayDensity;
  isSelected: boolean;
  isChecked: boolean;
}

const ROW_HEIGHT: Record<DisplayDensity, string> = {
  compact: 'min-h-[48px] py-1.5',
  comfortable: 'min-h-[64px] py-2',
  spacious: 'min-h-[80px] py-3',
};

const AVATAR_SIZE: Record<DisplayDensity, 'sm' | 'md'> = {
  compact: 'sm',
  comfortable: 'md',
  spacious: 'md',
};

const PHONE_COUNT: Record<DisplayDensity, number> = {
  compact: 1,
  comfortable: 2,
  spacious: 2,
};

export function ContactRow({ contact, density, isSelected, isChecked }: ContactRowProps) {
  const { setSelectedId, toggleFavorite } = useContactStore();
  const { setDetailPanelOpen, toggleSelectId, selectedIds } = useUIStore();
  const isMultiSelect = selectedIds.size > 0;

  const phones = contact.phones.slice(0, PHONE_COUNT[density]);
  const primaryEmail = contact.emails[0];

  const handleClick = () => {
    if (isMultiSelect) {
      toggleSelectId(contact.id);
    } else {
      setSelectedId(contact.id);
      setDetailPanelOpen(true);
    }
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={e => { e.preventDefault(); toggleSelectId(contact.id); }}
      className={`flex items-center gap-2.5 px-3 cursor-pointer transition-colors border-b border-surface-border/40 dark:border-dark-border/40 ${ROW_HEIGHT[density]}
        ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-surface-card dark:hover:bg-dark-card'}
      `}
    >
      {/* Checkbox (multi-select) or Avatar */}
      {isMultiSelect ? (
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggleSelectId(contact.id)}
          className="w-4 h-4 rounded border-surface-border text-primary-500 flex-shrink-0"
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <Avatar
          name={contact.name.formatted}
          family={contact.name.family}
          given={contact.name.given}
          photo={contact.photo}
          size={AVATAR_SIZE[density]}
        />
      )}

      {/* Name + Organization */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {contact.meta.isPinned && (
            <FontAwesomeIcon icon={faThumbTack} className="text-2xs text-primary-400 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-ink-primary truncate leading-tight">
            {contact.name.formatted}
          </span>
          {contact.organization && (
            <span className="text-xs text-ink-secondary truncate hidden sm:block">
              &nbsp;·&nbsp;{contact.organization}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          {phones.map((phone, idx) => (
            <span key={phone.id} className={`flex items-center gap-1.5 ${idx > 0 ? 'hidden md:flex' : ''}`}>
              {idx > 0 && <span className="text-ink-placeholder text-xs">|</span>}
              <Badge label={phone.labelDisplay || phone.label} variant={phone.label as 'mobile' | 'work' | 'home' | 'other'} />
              <span className="text-xs text-ink-secondary font-mono">{phone.value}</span>
            </span>
          ))}
        </div>

        {density === 'spacious' && (primaryEmail || contact.meta.updatedAt) && (
          <div className="flex items-center gap-3 mt-0.5 text-xs text-ink-secondary">
            {primaryEmail && (
              <span className="flex items-center gap-1 truncate min-w-0">
                <FontAwesomeIcon icon={faEnvelope} className="text-2xs text-ink-placeholder flex-shrink-0" />
                <span className="truncate">{primaryEmail.value}</span>
              </span>
            )}
            {contact.meta.updatedAt && (
              <span className="text-ink-placeholder flex-shrink-0">
                更新: {new Date(contact.meta.updatedAt).toLocaleDateString('ja-JP')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Favorite toggle */}
      <button
        onClick={e => { e.stopPropagation(); toggleFavorite(contact.id); }}
        className={`p-1 transition-colors flex-shrink-0 ${contact.meta.isFavorite ? 'text-amber-400' : 'text-ink-placeholder hover:text-amber-300'}`}
      >
        <FontAwesomeIcon icon={contact.meta.isFavorite ? faStarSolid : faStarRegular} className="text-xs" />
      </button>
    </div>
  );
}
