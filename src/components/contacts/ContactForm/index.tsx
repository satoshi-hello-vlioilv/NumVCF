import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { Contact } from '../../../types/contact';
import { useContactStore } from '../../../store/contactStore';
import { useUIStore } from '../../../store/uiStore';
import { useNavigate } from 'react-router-dom';

const labeledValueSchema = z.object({
  id: z.string(),
  label: z.string(),
  labelDisplay: z.string().optional(),
  value: z.string(),
  isPrimary: z.boolean().optional(),
});

const schema = z.object({
  nameFormatted: z.string().min(1, '名前は必須です'),
  nameFamily: z.string().optional(),
  nameGiven: z.string().optional(),
  nameKanaFormatted: z.string().optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  phones: z.array(labeledValueSchema),
  emails: z.array(labeledValueSchema),
  urls: z.array(labeledValueSchema),
  birthday: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const PHONE_LABELS = [
  { value: 'mobile', display: '携帯' },
  { value: 'work',   display: '会社' },
  { value: 'home',   display: '自宅' },
  { value: 'work-fax', display: 'FAX(会社)' },
  { value: 'other',  display: 'その他' },
];
const EMAIL_LABELS = [
  { value: 'work',  display: '会社' },
  { value: 'home',  display: '自宅' },
  { value: 'other', display: 'その他' },
];

interface ContactFormProps {
  contact?: Contact;
  onSave?: (id: string) => void;
}

export function ContactForm({ contact, onSave }: ContactFormProps) {
  const { addContact, updateContact } = useContactStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: contact ? {
      nameFormatted: contact.name.formatted,
      nameFamily: contact.name.family,
      nameGiven: contact.name.given,
      nameKanaFormatted: contact.nameKana?.formatted,
      organization: contact.organization,
      department: contact.department,
      title: contact.title,
      phones: contact.phones,
      emails: contact.emails,
      urls: contact.urls,
      birthday: contact.birthday,
      notes: contact.meta.notes,
    } : {
      phones: [{ id: crypto.randomUUID(), label: 'mobile', labelDisplay: '携帯', value: '' }],
      emails: [],
      urls: [],
    },
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({ control, name: 'phones' });
  const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({ control, name: 'emails' });
  useFieldArray({ control, name: 'urls' });

  const onSubmit = async (data: FormData) => {
    const now = new Date().toISOString();
    if (contact) {
      await updateContact(contact.id, {
        name: { formatted: data.nameFormatted, family: data.nameFamily, given: data.nameGiven },
        nameKana: data.nameKanaFormatted ? { formatted: data.nameKanaFormatted } : undefined,
        organization: data.organization,
        department: data.department,
        title: data.title,
        phones: data.phones.filter(p => p.value),
        emails: data.emails.filter(e => e.value),
        urls: data.urls.filter(u => u.value),
        birthday: data.birthday,
        meta: { ...contact.meta, notes: data.notes, updatedAt: now },
      });
      addToast({ type: 'success', message: '連絡先を更新しました' });
      onSave?.(contact.id);
    } else {
      const newContact: Contact = {
        id: crypto.randomUUID(),
        name: { formatted: data.nameFormatted, family: data.nameFamily, given: data.nameGiven },
        nameKana: data.nameKanaFormatted ? { formatted: data.nameKanaFormatted } : undefined,
        organization: data.organization,
        department: data.department,
        title: data.title,
        phones: data.phones.filter(p => p.value),
        emails: data.emails.filter(e => e.value),
        urls: data.urls.filter(u => u.value),
        addresses: [],
        socialProfiles: [],
        instantMessages: [],
        birthday: data.birthday,
        customFields: [],
        meta: {
          createdAt: now, updatedAt: now,
          groups: [], tags: [],
          isFavorite: false, isPinned: false,
          notes: data.notes,
        },
      };
      await addContact(newContact);
      addToast({ type: 'success', message: '連絡先を追加しました' });
      onSave?.(newContact.id);
    }
    navigate('/');
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-surface-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-ink-primary focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all";
  const labelClass = "block text-xs font-medium text-ink-secondary mb-1";
  const sectionClass = "border-b border-surface-border dark:border-dark-border pb-5 mb-5";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-0">
        {/* Name */}
        <section className={sectionClass}>
          <h3 className="text-xs font-semibold text-ink-placeholder uppercase tracking-wider mb-3">基本情報</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>表示名 *</label>
              <input {...register('nameFormatted')} className={inputClass} placeholder="山田 太郎" />
              {errors.nameFormatted && <p className="text-xs text-status-danger mt-1">{errors.nameFormatted.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>姓</label>
                <input {...register('nameFamily')} className={inputClass} placeholder="山田" />
              </div>
              <div>
                <label className={labelClass}>名</label>
                <input {...register('nameGiven')} className={inputClass} placeholder="太郎" />
              </div>
            </div>
            <div>
              <label className={labelClass}>読み仮名</label>
              <input {...register('nameKanaFormatted')} className={inputClass} placeholder="やまだ たろう" />
            </div>
          </div>
        </section>

        {/* Organization */}
        <section className={sectionClass}>
          <h3 className="text-xs font-semibold text-ink-placeholder uppercase tracking-wider mb-3">組織</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>会社名</label>
              <input {...register('organization')} className={inputClass} placeholder="株式会社サンプル" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>部署</label>
                <input {...register('department')} className={inputClass} placeholder="営業部" />
              </div>
              <div>
                <label className={labelClass}>役職</label>
                <input {...register('title')} className={inputClass} placeholder="部長" />
              </div>
            </div>
          </div>
        </section>

        {/* Phones */}
        <section className={sectionClass}>
          <h3 className="text-xs font-semibold text-ink-placeholder uppercase tracking-wider mb-3">電話番号</h3>
          <div className="space-y-2">
            {phoneFields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Controller
                  control={control}
                  name={`phones.${idx}.label`}
                  render={({ field: f }) => (
                    <select
                      {...f}
                      onChange={e => {
                        f.onChange(e.target.value);
                      }}
                      className="text-xs border border-surface-border dark:border-dark-border rounded-lg px-2 py-2 bg-white dark:bg-dark-surface text-ink-secondary focus:outline-none focus:ring-2 focus:ring-primary-300 w-24 flex-shrink-0"
                    >
                      {PHONE_LABELS.map(l => <option key={l.value} value={l.value}>{l.display}</option>)}
                    </select>
                  )}
                />
                <input
                  {...register(`phones.${idx}.value`)}
                  className={`${inputClass} flex-1`}
                  placeholder="090-0000-0000"
                  type="tel"
                />
                <button type="button" onClick={() => removePhone(idx)} className="p-2 text-ink-placeholder hover:text-status-danger transition-colors flex-shrink-0">
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => appendPhone({ id: crypto.randomUUID(), label: 'mobile', labelDisplay: '携帯', value: '' })} className="flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-700 transition-colors">
              <FontAwesomeIcon icon={faPlus} className="text-xs" />電話番号を追加
            </button>
          </div>
        </section>

        {/* Emails */}
        <section className={sectionClass}>
          <h3 className="text-xs font-semibold text-ink-placeholder uppercase tracking-wider mb-3">メールアドレス</h3>
          <div className="space-y-2">
            {emailFields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Controller
                  control={control}
                  name={`emails.${idx}.label`}
                  render={({ field: f }) => (
                    <select {...f} className="text-xs border border-surface-border dark:border-dark-border rounded-lg px-2 py-2 bg-white dark:bg-dark-surface text-ink-secondary focus:outline-none focus:ring-2 focus:ring-primary-300 w-24 flex-shrink-0">
                      {EMAIL_LABELS.map(l => <option key={l.value} value={l.value}>{l.display}</option>)}
                    </select>
                  )}
                />
                <input {...register(`emails.${idx}.value`)} className={`${inputClass} flex-1`} placeholder="taro@example.com" type="email" />
                <button type="button" onClick={() => removeEmail(idx)} className="p-2 text-ink-placeholder hover:text-status-danger transition-colors flex-shrink-0">
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => appendEmail({ id: crypto.randomUUID(), label: 'work', labelDisplay: '会社', value: '' })} className="flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-700 transition-colors">
              <FontAwesomeIcon icon={faPlus} className="text-xs" />メールを追加
            </button>
          </div>
        </section>

        {/* Other */}
        <section>
          <h3 className="text-xs font-semibold text-ink-placeholder uppercase tracking-wider mb-3">その他</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>誕生日</label>
              <input {...register('birthday')} className={inputClass} type="date" />
            </div>
            <div>
              <label className={labelClass}>メモ</label>
              <textarea {...register('notes')} className={`${inputClass} resize-none`} rows={3} placeholder="メモを入力..." />
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 flex gap-2 px-5 py-4 border-t border-surface-border dark:border-dark-border bg-surface-base/80 dark:bg-dark-base/80">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 text-sm border border-surface-border dark:border-dark-border rounded-lg text-ink-secondary hover:text-ink-primary transition-colors">
          <FontAwesomeIcon icon={faXmark} className="text-xs" />キャンセル
        </button>
        <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors">
          <FontAwesomeIcon icon={faCheck} className="text-xs" />
          {contact ? '更新する' : '追加する'}
        </button>
      </div>
    </form>
  );
}
