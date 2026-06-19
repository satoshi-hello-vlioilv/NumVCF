import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid, faThumbTack } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import type { Contact } from '../../../types/contact';
import { useContactStore } from '../../../store/contactStore';
import { useUIStore } from '../../../store/uiStore';

interface CompactItemProps {
  contact: Contact;
  isSelected: boolean;
  isChecked: boolean;
}

export function CompactItem({ contact, isSelected, isChecked }: CompactItemProps) {
  const { setSelectedId, toggleFavorite } = useContactStore();
  const { setDetailPanelOpen, toggleSelectId, selectedIds } = useUIStore();
  const isMultiSelect = selectedIds.size > 0;

  const primaryPhone = contact.phones[0];
  const secondPhone = contact.phones[1];

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
      className={`flex items-center gap-2.5 px-3 py-1.5 cursor-pointer transition-colors border-b border-surface-border/40 dark:border-dark-border/40 min-h-[48px]
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
          size="sm"
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
          {primaryPhone && (
            <>
              <Badge
                label={primaryPhone.labelDisplay || primaryPhone.label}
                variant={primaryPhone.label as 'mobile' | 'work' | 'home' | 'other'}
              />
              <span className="text-xs text-ink-secondary font-mono">{primaryPhone.value}</span>
            </>
          )}
          {secondPhone && (
            <>
              <span className="text-ink-placeholder text-xs hidden md:block">|</span>
              <span className="hidden md:inline-block">
                <Badge
                  label={secondPhone.labelDisplay || secondPhone.label}
                  variant={secondPhone.label as 'mobile' | 'work' | 'home' | 'other'}
                />
              </span>
              <span className="text-xs text-ink-secondary font-mono hidden md:block">{secondPhone.value}</span>
            </>
          )}
        </div>
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
