import type { Contact } from '../../../types/contact';
import { useUIStore } from '../../../store/uiStore';
import { useContactStore } from '../../../store/contactStore';
import { ContactRow } from './ContactRow';

interface ContactListItemProps {
  contact: Contact;
}

export function ContactListItem({ contact }: ContactListItemProps) {
  const { density, selectedIds } = useUIStore();
  const { selectedId } = useContactStore();

  return (
    <ContactRow
      contact={contact}
      density={density}
      isSelected={selectedId === contact.id}
      isChecked={selectedIds.has(contact.id)}
    />
  );
}
