import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faPhone, faMessage, faEnvelope, faCopy, faPencil, faEllipsisVertical, faArrowLeft, faXmark,
  faLocationDot, faGlobe, faCakeCandles, faNoteSticky, faFileCode, faBuilding, faFax, faUsers,
  faClockRotateLeft, faStar, faThumbTack, faFileExport, faTrash, faComments, faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { Avatar } from '../../ui/Avatar';
import { TagChip } from '../../ui/TagChip';
import { IconButton } from '../../ui/IconButton';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Popover, PopoverItem, PopoverDivider } from '../../ui/Popover';
import { useContactStore } from '../../../store/contactStore';
import { useFormatProfileStore } from '../../../store/formatProfileStore';
import { useUIStore } from '../../../store/uiStore';
import type { Contact, ContactAddress } from '../../../types/contact';
import { relativeDate } from '../../../utils/date';

function copy(text: string, label: string) {
  navigator.clipboard.writeText(text)
    .then(() => useUIStore.getState().addToast({ type: 'success', message: `${label}をコピーしました` }))
    .catch(() => useUIStore.getState().addToast({ type: 'error', message: 'コピーできませんでした' }));
}

function addressText(a: ContactAddress) {
  return a.formatted || [a.postalCode && `〒${a.postalCode}`, a.region, a.city, a.street, a.extended, a.country].filter(Boolean).join(' ');
}

function isFax(label: string) {
  return label.includes('fax');
}

function MethodRow({ icon, label, value, kind }: { icon: IconDefinition; label: string; value: string; kind: 'tel' | 'fax' | 'mail' | 'im' }) {
  return (
    <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 rounded-lg hover:bg-surface-base dark:hover:bg-dark-surface min-w-0">
      <FontAwesomeIcon icon={icon} className={`w-4 text-sm flex-shrink-0 ${kind === 'mail' ? 'text-teal-400' : kind === 'im' ? 'text-sage-500' : 'text-primary-400'}`} />
      <span className="w-16 flex-shrink-0 text-xs text-ink-placeholder truncate">{label}</span>
      <span className={`flex-1 min-w-0 text-sm text-ink-primary dark:text-slate-100 truncate ${kind === 'tel' || kind === 'fax' ? 'font-mono' : ''}`} title={value}>{value}</span>
      <span className="flex items-center flex-shrink-0">
        {kind === 'tel' && <>
          <IconButton icon={faPhone} label={`${value} に発信`} href={`tel:${value}`} size="sm" tone="primary" />
          <IconButton icon={faMessage} label="SMS を送る" href={`sms:${value}`} size="sm" />
        </>}
        {kind === 'mail' && <IconButton icon={faEnvelope} label="メールを作成" href={`mailto:${value}`} size="sm" tone="primary" />}
        <IconButton icon={faCopy} label="コピー" onClick={() => copy(value, kind === 'mail' ? 'メールアドレス' : kind === 'im' ? 'ID' : '番号')} size="sm" />
      </span>
    </div>
  );
}

function Block({ icon, title, children }: { icon: IconDefinition; title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0">
      <h3 className="flex items-center gap-1.5 text-2xs font-semibold text-ink-placeholder tracking-wider mb-1"><FontAwesomeIcon icon={icon} />{title}</h3>
      <div className="text-sm text-ink-primary dark:text-slate-200 min-w-0">{children}</div>
    </section>
  );
}

function Card({ title, icon, children }: { title: string; icon?: IconDefinition; children: React.ReactNode }) {
  return (
    <section className="border border-surface-border dark:border-dark-border rounded-xl p-1 min-w-0 overflow-hidden">
      <h3 className="px-3 pt-2 pb-1 text-2xs font-semibold text-ink-placeholder tracking-wider">{icon && <FontAwesomeIcon icon={icon} className="mr-1.5" />}{title}</h3>
      {children}
    </section>
  );
}

interface ContactDetailProps {
  contact: Contact;
  onClose: () => void;
}

export function ContactDetail({ contact: c, onClose }: ContactDetailProps) {
  const navigate = useNavigate();
  const { contacts, setSelectedId, deleteContact, toggleFavorite, togglePinned } = useContactStore();
  const { profiles } = useFormatProfileStore();
  const { addToast, selectAll, setExportModalOpen } = useUIStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const colleagues = c.organization ? contacts.filter(o => o.id !== c.id && o.organization === c.organization) : [];
  const tel = c.phones.find(p => !isFax(p.label));
  const mail = c.emails[0];
  const profile = profiles.find(p => p.id === c.meta.formatProfileId);
  const history = [
    { label: '更新', iso: c.meta.updatedAt },
    { label: '取り込み', iso: c.meta.importedAt },
    { label: '作成', iso: c.meta.createdAt },
  ].filter((h): h is { label: string; iso: string } => !!h.iso);

  const exportThis = () => { selectAll([c.id]); setExportModalOpen(true); };
  const handleDelete = async () => {
    await deleteContact(c.id);
    setConfirmDelete(false);
    addToast({ type: 'success', message: `${c.name.formatted} を削除しました` });
  };

  const moreMenu = (
    <Popover trigger={({ onClick }) => <IconButton icon={faEllipsisVertical} label="その他の操作" onClick={onClick} />}>
      {close => (
        <>
          <PopoverItem icon={faThumbTack} label={c.meta.isPinned ? 'ピン留めを外す' : 'ピン留め'} onClick={() => { togglePinned(c.id); close(); }} />
          <PopoverItem icon={faFileExport} label="この連絡先をエクスポート" onClick={() => { exportThis(); close(); }} />
          <PopoverDivider />
          <PopoverItem icon={faTrash} label="削除" variant="danger" onClick={() => { setConfirmDelete(true); close(); }} />
        </>
      )}
    </Popover>
  );

  const primaryAction = 'inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-colors';

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-card min-w-0">
      {/* Mobile app bar */}
      <div className="md:hidden flex items-center gap-1 px-2 h-12 border-b border-surface-border dark:border-dark-border flex-shrink-0">
        <IconButton icon={faArrowLeft} label="一覧に戻る" onClick={onClose} />
        <span className="flex-1 text-sm font-medium truncate">{c.name.formatted}</span>
        <IconButton icon={c.meta.isFavorite ? faStar : faStarRegular} label="お気に入り" tone="favorite" active={c.meta.isFavorite} onClick={() => toggleFavorite(c.id)} />
        <IconButton icon={faPencil} label="編集" onClick={() => navigate(`/edit/${c.id}`)} />
        {moreMenu}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <header className="px-4 md:px-6 pt-5 pb-3 flex items-start gap-4">
          <Avatar name={c.name.formatted} family={c.name.family} given={c.name.given} photo={c.photo} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-x-2 flex-wrap">
              <h2 className="text-xl font-semibold text-ink-primary dark:text-slate-100">{c.name.formatted}</h2>
              {c.nameKana?.formatted && <span className="text-xs text-ink-placeholder whitespace-nowrap">{c.nameKana.formatted}</span>}
              {c.nickname && <span className="text-xs text-ink-secondary whitespace-nowrap">「{c.nickname}」</span>}
            </div>
            <p className="mt-0.5 text-sm text-ink-secondary truncate">
              <FontAwesomeIcon icon={faBuilding} className="mr-1.5 text-xs text-ink-placeholder" />
              {c.organization ? [c.organization, c.department].filter(Boolean).join(' › ') : '所属なし'}
              {c.title && <span className="text-ink-placeholder"> · {c.title}</span>}
            </p>
            {c.meta.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{c.meta.tags.map(t => <TagChip key={t} name={t} />)}</div>}
          </div>
          <div className="hidden md:flex items-center">
            <IconButton icon={c.meta.isFavorite ? faStar : faStarRegular} label={c.meta.isFavorite ? 'お気に入りから外す' : 'お気に入りに追加'} tone="favorite" active={c.meta.isFavorite} onClick={() => toggleFavorite(c.id)} />
            <IconButton icon={faPencil} label="編集 (Ctrl+E)" onClick={() => navigate(`/edit/${c.id}`)} />
            {moreMenu}
            <IconButton icon={faXmark} label="閉じる (Esc)" onClick={onClose} />
          </div>
        </header>

        <div className="hidden md:flex gap-2 px-6 pb-4">
          {tel
            ? <a href={`tel:${tel.value}`} className={`${primaryAction} bg-primary-500 hover:bg-primary-600 text-white`}><FontAwesomeIcon icon={faPhone} />電話</a>
            : <span className={`${primaryAction} bg-surface-card text-ink-placeholder cursor-not-allowed`}><FontAwesomeIcon icon={faPhone} />電話</span>}
          {tel && <a href={`sms:${tel.value}`} className={`${primaryAction} bg-surface-card dark:bg-dark-surface text-ink-primary dark:text-slate-200 hover:bg-surface-border`}><FontAwesomeIcon icon={faMessage} />SMS</a>}
          {mail && <a href={`mailto:${mail.value}`} className={`${primaryAction} bg-surface-card dark:bg-dark-surface text-ink-primary dark:text-slate-200 hover:bg-surface-border`}><FontAwesomeIcon icon={faEnvelope} />メール</a>}
        </div>

        <div className="px-3 md:px-4 pb-20 md:pb-6 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="space-y-4 min-w-0">
            <Card title="連絡方法">
              {c.phones.length + c.emails.length + c.instantMessages.length === 0 && <p className="px-3 pb-2 text-sm text-ink-placeholder">電話番号・メールは登録されていません</p>}
              {c.phones.map(p => <MethodRow key={p.id} icon={isFax(p.label) ? faFax : faPhone} label={p.labelDisplay ?? p.label} value={p.value} kind={isFax(p.label) ? 'fax' : 'tel'} />)}
              {c.emails.map(e => <MethodRow key={e.id} icon={faEnvelope} label={e.labelDisplay ?? e.label} value={e.value} kind="mail" />)}
              {c.instantMessages.map(im => <MethodRow key={im.id} icon={faComments} label={im.labelDisplay ?? 'IM'} value={im.value} kind="im" />)}
            </Card>
            {colleagues.length > 0 && (
              <Card title={`同じ組織の連絡先 ${colleagues.length}`} icon={faUsers}>
                {colleagues.map(o => (
                  <button key={o.id} type="button" onClick={() => setSelectedId(o.id)} className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-surface-base dark:hover:bg-dark-surface text-left min-w-0">
                    <Avatar name={o.name.formatted} family={o.name.family} given={o.name.given} photo={o.photo} size="xs" />
                    <span className="text-sm whitespace-nowrap">{o.name.formatted}</span>
                    <span className="flex-1 min-w-0 text-xs text-ink-secondary truncate">{[o.department, o.title].filter(Boolean).join(' · ')}</span>
                    {o.phones[0] && <span className="text-xs font-mono text-ink-placeholder">{o.phones[0].value}</span>}
                  </button>
                ))}
              </Card>
            )}
          </div>

          <div className="px-2 xl:px-1 space-y-4 min-w-0">
            {c.addresses.map(a => (
              <Block key={a.id} icon={faLocationDot} title={`住所（${a.labelDisplay ?? a.label}）`}>
                <p className="break-words">{addressText(a.value)}
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText(a.value))}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-primary-600 hover:underline whitespace-nowrap">
                    地図<FontAwesomeIcon icon={faUpRightFromSquare} className="ml-1 text-[9px]" />
                  </a>
                </p>
              </Block>
            ))}
            {c.urls.map(u => (
              <Block key={u.id} icon={faGlobe} title="Web">
                <a href={u.value} target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:underline truncate">{u.value}</a>
              </Block>
            ))}
            {(c.birthday || c.anniversary) && (
              <Block icon={faCakeCandles} title={c.birthday ? '誕生日' : '記念日'}>
                <p>{c.birthday}{c.birthday && c.anniversary && <span className="ml-3 text-xs text-ink-secondary">記念日 {c.anniversary}</span>}{!c.birthday && c.anniversary}</p>
              </Block>
            )}
            {c.meta.notes && (
              <Block icon={faNoteSticky} title="メモ">
                <p className="px-3 py-2 rounded-lg bg-[#fbf7ec] dark:bg-dark-surface whitespace-pre-wrap">{c.meta.notes}</p>
              </Block>
            )}
            <Block icon={faClockRotateLeft} title="履歴">
              <ol className="relative pl-4 space-y-1 text-xs before:absolute before:left-[3px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-surface-border">
                {history.map(({ label, iso }) => (
                  <li key={label} className="relative">
                    <span className="absolute -left-4 top-1.5 w-[7px] h-[7px] rounded-full bg-primary-300" />
                    <span className="text-ink-secondary">{label}</span>
                    <span className="ml-2 text-ink-placeholder">{new Date(iso).toLocaleDateString('ja-JP')}（{relativeDate(iso)}）</span>
                  </li>
                ))}
              </ol>
            </Block>
            <Block icon={faFileCode} title="VCF 情報">
              <dl className="grid grid-cols-[auto,minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs">
                <dt className="text-ink-placeholder">形式</dt><dd className="truncate">{profile?.name ?? '手動登録'}</dd>
                {c.meta.importedFrom && <><dt className="text-ink-placeholder">ファイル</dt><dd className="truncate">{c.meta.importedFrom}</dd></>}
                {c.uid && <><dt className="text-ink-placeholder">UID</dt><dd className="truncate font-mono">{c.uid}</dd></>}
                {c.customFields.map(f => (
                  <div key={f.id} className="contents">
                    <dt className="text-ink-placeholder font-mono truncate max-w-[9rem]" title={f.key}>{f.key}</dt>
                    <dd className="truncate" title={f.value}>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          </div>
        </div>
      </div>

      {/* Mobile bottom action bar: primary actions within thumb reach */}
      <div className="md:hidden flex-shrink-0 grid grid-cols-3 border-t border-surface-border dark:border-dark-border bg-white dark:bg-dark-card">
        {([[faPhone, '電話', tel && `tel:${tel.value}`], [faMessage, 'SMS', tel && `sms:${tel.value}`], [faEnvelope, 'メール', mail && `mailto:${mail.value}`]] as const).map(([icon, label, href]) => (
          href
            ? <a key={label} href={href} className="flex flex-col items-center gap-0.5 py-2 text-2xs text-primary-600"><FontAwesomeIcon icon={icon} className="text-base" />{label}</a>
            : <span key={label} aria-disabled className="flex flex-col items-center gap-0.5 py-2 text-2xs text-ink-placeholder"><FontAwesomeIcon icon={icon} className="text-base" />{label}</span>
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="連絡先を削除"
        message={`「${c.name.formatted}」を削除しますか？この操作は元に戻せません。`}
        confirmLabel="削除"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
