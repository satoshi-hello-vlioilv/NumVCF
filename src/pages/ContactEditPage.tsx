import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { ContactForm } from '../components/contacts/ContactForm';
import { IconButton } from '../components/ui/IconButton';
import { useContactStore } from '../store/contactStore';

export function ContactEditPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { contacts, isLoaded, setSelectedId } = useContactStore();
  const contact = id ? contacts.find(c => c.id === id) : undefined;
  const missing = Boolean(id) && isLoaded && !contact;
  const loading = Boolean(id) && !isLoaded;

  return (
    <div className="h-screen flex flex-col bg-surface-base dark:bg-dark-base text-ink-primary dark:text-slate-100">
      <header className="flex-shrink-0 flex items-center gap-2 px-2 md:px-4 h-14 bg-white dark:bg-dark-card border-b border-surface-border dark:border-dark-border">
        <IconButton icon={faArrowLeft} label="一覧に戻る" onClick={() => navigate('/')} />
        <h1 className="font-semibold">{id ? '連絡先を編集' : '連絡先を追加'}</h1>
        {contact && <span className="text-sm text-ink-secondary truncate">— {contact.name.formatted}</span>}
      </header>
      <div className="flex-1 min-h-0 w-full max-w-3xl mx-auto bg-white dark:bg-dark-card md:border-x border-surface-border dark:border-dark-border">
        {loading && <p className="p-6 text-sm text-ink-placeholder">読み込み中…</p>}
        {missing && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-sm text-ink-secondary">
            <FontAwesomeIcon icon={faUserSlash} className="text-3xl text-ink-placeholder" />
            指定された連絡先は見つかりませんでした
            <button type="button" onClick={() => navigate('/')} className="px-4 py-2 rounded-lg bg-primary-500 text-white">一覧に戻る</button>
          </div>
        )}
        {!loading && !missing && <ContactForm key={contact?.id ?? 'new'} contact={contact} onSave={savedId => setSelectedId(savedId)} />}
      </div>
    </div>
  );
}
