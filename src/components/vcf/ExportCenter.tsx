import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faXmark, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useContactStore } from '../../store/contactStore';
import { useFormatProfileStore } from '../../store/formatProfileStore';
import { useUIStore } from '../../store/uiStore';
import { serializeContacts } from '../../vcf/serializer';

export function ExportCenter() {
  const { contacts, filteredContacts } = useContactStore();
  const { profiles } = useFormatProfileStore();
  const { setExportModalOpen, selectedIds, addToast } = useUIStore();
  const [profileId, setProfileId] = useState('vcf-standard-30');
  const [scope, setScope] = useState<'all' | 'selected' | 'filtered'>('all');

  const enabledProfiles = profiles.filter(p => p.enabled);

  const getTargetContacts = () => {
    if (scope === 'selected' && selectedIds.size > 0) {
      return contacts.filter(c => selectedIds.has(c.id));
    }
    if (scope === 'filtered') return filteredContacts();
    return contacts;
  };

  const targetCount = getTargetContacts().length;

  const handleExport = () => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    const targets = getTargetContacts();
    const vcfText = serializeContacts(targets, profile);
    const blob = new Blob([vcfText], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${new Date().toISOString().slice(0, 10)}.vcf`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({ type: 'success', message: `${targets.length} 件をエクスポートしました` });
    setExportModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border dark:border-dark-border">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faFileExport} className="text-teal-400" />
          <h2 className="font-semibold text-ink-primary">VCF エクスポート</h2>
        </div>
        <button onClick={() => setExportModalOpen(false)} className="p-1.5 text-ink-placeholder hover:text-ink-primary transition-colors">
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <div className="flex-1 p-5 space-y-5">
        {/* Scope */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">エクスポート対象</label>
          <div className="space-y-2">
            {[
              { value: 'all', label: `全件 (${contacts.length}件)` },
              { value: 'filtered', label: `現在の絞り込み結果 (${filteredContacts().length}件)` },
              { value: 'selected', label: `選択中 (${selectedIds.size}件)`, disabled: selectedIds.size === 0 },
            ].map(opt => (
              <label key={opt.value} className={`flex items-center gap-2 cursor-pointer ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                <input
                  type="radio"
                  name="scope"
                  value={opt.value}
                  checked={scope === opt.value}
                  onChange={() => setScope(opt.value as typeof scope)}
                  disabled={opt.disabled}
                  className="text-primary-500"
                />
                <span className="text-sm text-ink-primary">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Format */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">出力フォーマット</label>
          <select
            value={profileId}
            onChange={e => setProfileId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-surface-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-ink-primary focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {enabledProfiles.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div className="bg-surface-card dark:bg-dark-card rounded-lg p-4">
          <div className="text-sm text-ink-secondary">
            <span className="font-semibold text-ink-primary text-lg">{targetCount}</span> 件をエクスポートします
          </div>
          <div className="text-xs text-ink-placeholder mt-1">
            {profiles.find(p => p.id === profileId)?.description}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 px-5 py-4 border-t border-surface-border dark:border-dark-border">
        <button
          onClick={handleExport}
          disabled={targetCount === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-teal-400 text-white rounded-lg hover:bg-teal-500 disabled:opacity-50 transition-colors"
        >
          <FontAwesomeIcon icon={faDownload} className="text-xs" />
          エクスポート ({targetCount}件)
        </button>
      </div>
    </div>
  );
}
