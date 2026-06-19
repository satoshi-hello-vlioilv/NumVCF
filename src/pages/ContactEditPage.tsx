import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ContactForm } from '../components/contacts/ContactForm';
import { useContactStore } from '../store/contactStore';

export function ContactEditPage() {
  const { id } = useParams<{ id?: string }>();
  const { contacts } = useContactStore();
  const contact = id ? contacts.find(c => c.id === id) : undefined;
  const isEdit = Boolean(id && contact);

  return (
    <div className="h-screen flex flex-col bg-surface-base dark:bg-dark-base">
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-card border-b border-surface-border dark:border-dark-border">
        <FontAwesomeIcon icon={isEdit ? faPencil : faPlus} className="text-primary-400" />
        <h1 className="font-semibold text-ink-primary">{isEdit ? '連絡先を編集' : '連絡先を追加'}</h1>
        {isEdit && contact && (
          <span className="text-sm text-ink-secondary ml-1">— {contact.name.formatted}</span>
        )}
      </header>
      <div className="flex-1 overflow-hidden bg-white dark:bg-dark-card max-w-2xl mx-auto w-full">
        <ContactForm contact={contact} />
      </div>
    </div>
  );
}
