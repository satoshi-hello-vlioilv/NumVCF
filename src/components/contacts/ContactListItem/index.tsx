import type { Contact } from '../../../types/contact';
import { useUIStore } from '../../../store/uiStore';
import { useContactStore } from '../../../store/contactStore';
import { CompactItem } from './Compact';

interface ContactListItemProps {
  contact: Contact;
}

export function ContactListItem({ contact }: ContactListItemProps) {
  const { selectedIds } = useUIStore();
  const { selectedId } = useContactStore();

  const isSelected = selectedId === contact.id;
  const isChecked = selectedIds.has(contact.id);

  // For now Compact handles all density (Comfortable/Spacious extend with more rows)
  return (
    <CompactItem
      contact={contact}
      isSelected={isSelected}
      isChecked={isChecked}
    />
  );
}
