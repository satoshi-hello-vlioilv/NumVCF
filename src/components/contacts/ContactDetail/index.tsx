import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone, faEnvelope, faGlobe, faLocationDot, faBuilding,
  faPencil, faTrash, faStar as faStarSolid, faThumbTack,
  faCopy, faMessage, faEllipsisVertical, faChevronDown, faChevronUp,
  faCalendar, faNoteSticky, faTag, faFileCode,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { useContactStore } from '../../../store/contactStore';
import { useUIStore } from '../../../store/uiStore';
import type { Contact, LabeledValue, ContactAddress } from '../../../types/contact';
import { useNavigate } from 'react-router-dom';

function copyToClipboard(text: string, label: string, addToast: (t: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void) {
  navigator.clipboard.writeText(text).then(() => addToast({ type: 'success', message: `${label}をコピーしました` }));
}

function PhoneRow({ phone, addToast }: { phone: LabeledValue<string>; addToast: (t: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void }) {
  return (
    <div className="flex items-center gap-3 py-2 group">
      <div className="w-6 flex justify-center flex-shrink-0">
        <FontAwesomeIcon icon={faPhone} className="text-primary-400 text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-mono text-ink-primary">{phone.value}</div>
        <Badge label={phone.labelDisplay || phone.label} variant={phone.label as 'mobile' | 'work' | 'home' | 'other'} />
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a href={`tel:${phone.value}`} className="p-1.5 rounded hover:bg-primary-100 text-primary-500 transition-colors" title="電話">
          <FontAwesomeIcon icon={faPhone} className="text-xs" />
        </a>
        <a href={`sms:${phone.value}`} className="p-1.5 rounded hover:bg-teal-400/20 text-teal-500 transition-colors" title="SMS">
          <FontAwesomeIcon icon={faMessage} className="text-xs" />
        </a>
        <button onClick={() => copyToClipboard(phone.value, '電話番号', addToast)} className="p-1.5 rounded hover:bg-surface-card text-ink-placeholder hover:text-ink-secondary transition-colors" title="コピー">
          <FontAwesomeIcon icon={faCopy} className="text-xs" />
        </button>
      </div>
    </div>
  );
}

function EmailRow({ email, addToast }: { email: LabeledValue<string>; addToast: (t: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void }) {
  return (
    <div className="flex items-center gap-3 py-2 group">
      <div className="w-6 flex justify-center flex-shrink-0">
        <FontAwesomeIcon icon={faEnvelope} className="text-teal-400 text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-ink-primary truncate">{email.value}</div>
        <Badge label={email.labelDisplay || email.label} variant={email.label as 'work' | 'home' | 'other'} />
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a href={`mailto:${email.value}`} className="p-1.5 rounded hover:bg-teal-400/20 text-teal-500 transition-colors" title="メール送信">
          <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
        </a>
        <button onClick={() => copyToClipboard(email.value, 'メールアドレス', addToast)} className="p-1.5 rounded hover:bg-surface-card text-ink-placeholder hover:text-ink-secondary transition-colors" title="コピー">
          <FontAwesomeIcon icon={faCopy} className="text-xs" />
        </button>
      </div>
    </div>
  );
}

function AddressRow({ addr }: { addr: LabeledValue<ContactAddress> }) {
  const formatted = addr.value.formatted ||
    [addr.value.postalCode, addr.value.region, addr.value.city, addr.value.street].filter(Boolean).join(' ');
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-6 flex justify-center flex-shrink-0 pt-0.5">
        <FontAwesomeIcon icon={faLocationDot} className="text-sage-400 text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-ink-primary whitespace-pre-wrap">{formatted}</div>
        <Badge label={addr.labelDisplay || addr.label} variant={addr.label as 'work' | 'home' | 'other'} />
      </div>
    </div>
  );
}

interface ContactDetailProps {
  contact: Contact;
}

export function ContactDetail({ contact }: ContactDetailProps) {
  const { deleteContact, toggleFavorite, togglePinned } = useContactStore();
  const { addToast, setDetailPanelOpen } = useUIStore();
  const navigate = useNavigate();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  const handleDelete = async () => {
    await deleteContact(contact.id);
    setDetailPanelOpen(false);
    addToast({ type: 'success', message: `${contact.name.formatted} を削除しました` });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-surface-border dark:border-dark-border bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar
              name={contact.name.formatted}
              family={contact.name.family}
              given={contact.name.given}
              photo={contact.photo}
              size="xl"
            />
            <div>
              <h2 className="text-lg font-semibold text-ink-primary leading-tight">{contact.name.formatted}</h2>
              {contact.nameKana?.formatted && (
                <p className="text-xs text-ink-secondary">{contact.nameKana.formatted}</p>
              )}
              {contact.organization && (
                <div className="flex items-center gap-1 mt-1">
                  <FontAwesomeIcon icon={faBuilding} className="text-2xs text-ink-placeholder" />
                  <span className="text-xs text-ink-secondary">
                    {contact.organization}
                    {contact.department && ` · ${contact.department}`}
                  </span>
                </div>
              )}
              {contact.title && (
                <p className="text-xs text-ink-secondary mt-0.5">{contact.title}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => toggleFavorite(contact.id)} className={`p-2 rounded-lg transition-colors ${contact.meta.isFavorite ? 'text-amber-400 bg-amber-50' : 'text-ink-placeholder hover:text-amber-400 hover:bg-amber-50'}`} title="お気に入り">
              <FontAwesomeIcon icon={contact.meta.isFavorite ? faStarSolid : faStarRegular} />
            </button>
            <button onClick={() => togglePinned(contact.id)} className={`p-2 rounded-lg transition-colors ${contact.meta.isPinned ? 'text-primary-500 bg-primary-50' : 'text-ink-placeholder hover:text-primary-400 hover:bg-primary-50'}`} title="ピン留め">
              <FontAwesomeIcon icon={faThumbTack} />
            </button>
            <button onClick={() => navigate(`/edit/${contact.id}`)} className="p-2 rounded-lg text-ink-secondary hover:text-primary-600 hover:bg-primary-50 transition-colors" title="編集">
              <FontAwesomeIcon icon={faPencil} />
            </button>
            <button onClick={() => setShowConfirmDelete(true)} className="p-2 rounded-lg text-ink-secondary hover:text-status-danger hover:bg-red-50 transition-colors" title="削除">
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1">
        {/* Phones */}
        {contact.phones.length > 0 && (
          <section>
            <h3 className="text-2xs font-semibold text-ink-placeholder uppercase tracking-wider mb-1">電話番号</h3>
            <div className="divide-y divide-surface-border/50 dark:divide-dark-border/50">
              {contact.phones.map(p => <PhoneRow key={p.id} phone={p} addToast={addToast} />)}
            </div>
          </section>
        )}

        {/* Emails */}
        {contact.emails.length > 0 && (
          <section className="pt-3">
            <h3 className="text-2xs font-semibold text-ink-placeholder uppercase tracking-wider mb-1">メールアドレス</h3>
            <div className="divide-y divide-surface-border/50 dark:divide-dark-border/50">
              {contact.emails.map(e => <EmailRow key={e.id} email={e} addToast={addToast} />)}
            </div>
          </section>
        )}

        {/* Addresses */}
        {contact.addresses.length > 0 && (
          <section className="pt-3">
            <h3 className="text-2xs font-semibold text-ink-placeholder uppercase tracking-wider mb-1">住所</h3>
            <div className="divide-y divide-surface-border/50 dark:divide-dark-border/50">
              {contact.addresses.map(a => <AddressRow key={a.id} addr={a} />)}
            </div>
          </section>
        )}

        {/* URLs */}
        {contact.urls.length > 0 && (
          <section className="pt-3">
            <h3 className="text-2xs font-semibold text-ink-placeholder uppercase tracking-wider mb-1">Web / URL</h3>
            {contact.urls.map(u => (
              <div key={u.id} className="flex items-center gap-3 py-2">
                <div className="w-6 flex justify-center"><FontAwesomeIcon icon={faGlobe} className="text-primary-300 text-sm" /></div>
                <a href={u.value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline truncate flex-1">{u.value}</a>
              </div>
            ))}
          </section>
        )}

        {/* Tags */}
        {contact.meta.tags.length > 0 && (
          <section className="pt-3">
            <h3 className="text-2xs font-semibold text-ink-placeholder uppercase tracking-wider mb-2">
              <FontAwesomeIcon icon={faTag} className="mr-1" />タグ
            </h3>
            <div className="flex flex-wrap gap-1">
              {contact.meta.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        {contact.meta.notes && (
          <section className="pt-3">
            <h3 className="text-2xs font-semibold text-ink-placeholder uppercase tracking-wider mb-1">
              <FontAwesomeIcon icon={faNoteSticky} className="mr-1" />メモ
            </h3>
            <p className="text-sm text-ink-primary whitespace-pre-wrap">{contact.meta.notes}</p>
          </section>
        )}

        {/* Birthday */}
        {contact.birthday && (
          <section className="pt-3">
            <h3 className="text-2xs font-semibold text-ink-placeholder uppercase tracking-wider mb-1">
              <FontAwesomeIcon icon={faCalendar} className="mr-1" />誕生日
            </h3>
            <p className="text-sm text-ink-primary">{contact.birthday}</p>
          </section>
        )}

        {/* Custom fields */}
        {contact.customFields.length > 0 && (
          <section className="pt-3">
            <h3 className="text-2xs font-semibold text-ink-placeholder uppercase tracking-wider mb-1">
              <FontAwesomeIcon icon={faEllipsisVertical} className="mr-1" />拡張フィールド
            </h3>
            <div className="space-y-1">
              {contact.customFields.map(f => (
                <div key={f.id} className="flex gap-2 text-xs">
                  <span className="text-ink-placeholder font-mono w-32 flex-shrink-0 truncate">{f.key}</span>
                  <span className="text-ink-secondary">{f.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Meta */}
        <section className="pt-3">
          <button
            onClick={() => setShowMeta(v => !v)}
            className="flex items-center gap-1.5 text-2xs text-ink-placeholder hover:text-ink-secondary transition-colors"
          >
            <FontAwesomeIcon icon={faFileCode} className="text-xs" />
            VCF メタ情報
            <FontAwesomeIcon icon={showMeta ? faChevronUp : faChevronDown} className="text-2xs" />
          </button>
          {showMeta && (
            <div className="mt-2 space-y-1 pl-4 border-l-2 border-surface-border dark:border-dark-border">
              {[
                ['フォーマット', contact.meta.formatProfileId],
                ['UID', contact.uid],
                ['REV', contact.rev],
                ['インポート元', contact.meta.importedFrom],
                ['作成日時', contact.meta.createdAt],
                ['更新日時', contact.meta.updatedAt],
              ].map(([label, val]) => val ? (
                <div key={label} className="flex gap-2 text-xs">
                  <span className="text-ink-placeholder w-28 flex-shrink-0">{label}</span>
                  <span className="text-ink-secondary font-mono">{val}</span>
                </div>
              ) : null)}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="連絡先を削除"
        message={`「${contact.name.formatted}」を削除しますか？この操作は元に戻せません。`}
        confirmLabel="削除"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </div>
  );
}
