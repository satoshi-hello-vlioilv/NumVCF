import { useState, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileImport, faCloudArrowUp, faCircleCheck, faTriangleExclamation,
  faXmark, faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { useContactStore } from '../../store/contactStore';
import { useFormatProfileStore } from '../../store/formatProfileStore';
import { useUIStore } from '../../store/uiStore';
import { parseVCFBuffer } from '../../vcf/parser';
import type { Contact } from '../../types/contact';
import type { ImportResult } from '../../types/vcfFormat';

type Step = 'drop' | 'parsing' | 'preview' | 'done';

export function ImportCenter() {
  const [step, setStep] = useState<Step>('drop');
  const [isDragOver, setIsDragOver] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [detectedProfile, setDetectedProfile] = useState<string | null>(null);
  const [pendingContacts, setPendingContacts] = useState<Contact[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const { addContact } = useContactStore();
  const { profiles } = useFormatProfileStore();
  const { setImportModalOpen, addToast } = useUIStore();

  const processFile = useCallback(async (file: File) => {
    setStep('parsing');
    try {
      const buffer = await file.arrayBuffer();
      const output = await parseVCFBuffer(buffer, {
        filename: file.name,
        profiles,
      });
      setDetectedProfile(output.detectedProfileId);
      setPendingContacts(output.contacts);
      setResult(output.result);
      setStep('preview');
    } catch (e) {
      addToast({ type: 'error', message: `解析エラー: ${String(e)}` });
      setStep('drop');
    }
  }, [profiles, addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = async () => {
    setStep('parsing');
    for (const contact of pendingContacts) {
      await addContact(contact);
    }
    setResult(prev => prev ? { ...prev, imported: pendingContacts.length } : prev);
    setStep('done');
    addToast({ type: 'success', message: `${pendingContacts.length} 件の連絡先をインポートしました` });
  };

  const profileName = profiles.find(p => p.id === detectedProfile)?.name;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border dark:border-dark-border">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faFileImport} className="text-primary-400" />
          <h2 className="font-semibold text-ink-primary">VCF インポート</h2>
        </div>
        <button onClick={() => setImportModalOpen(false)} className="p-1.5 text-ink-placeholder hover:text-ink-primary transition-colors">
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {step === 'drop' && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'border-surface-border dark:border-dark-border hover:border-primary-300 hover:bg-surface-card'
            }`}
          >
            <FontAwesomeIcon icon={faCloudArrowUp} className="text-4xl text-ink-placeholder mb-3" />
            <p className="text-sm font-medium text-ink-primary mb-1">VCF ファイルをドロップ</p>
            <p className="text-xs text-ink-secondary">または クリックして選択</p>
            <p className="text-xs text-ink-placeholder mt-3">vCard 2.1 / 3.0 / 4.0 対応（Docomo / au / SoftBank 等）</p>
            <input ref={fileRef} type="file" accept=".vcf,.vcard" onChange={handleFileChange} className="hidden" />
          </div>
        )}

        {step === 'parsing' && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FontAwesomeIcon icon={faSpinner} className="text-3xl text-primary-400 animate-spin" />
            <p className="text-sm text-ink-secondary">解析中...</p>
          </div>
        )}

        {step === 'preview' && result && (
          <div className="space-y-4">
            {/* Detection result */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
              <p className="text-xs text-ink-secondary">
                <span className="font-medium text-primary-700 dark:text-primary-300">検出フォーマット:</span>
                {' '}{profileName || '標準 vCard'}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '検出件数', value: result.total, color: 'text-ink-primary' },
                { label: 'インポート予定', value: result.imported, color: 'text-status-success' },
                { label: 'エラー', value: result.errors.length, color: result.errors.length ? 'text-status-danger' : 'text-ink-placeholder' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-surface-card dark:bg-dark-card rounded-lg p-3 text-center">
                  <div className={`text-xl font-semibold ${color}`}>{value}</div>
                  <div className="text-2xs text-ink-secondary mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="text-status-danger text-xs" />
                  <span className="text-xs font-medium text-status-danger">解析エラー</span>
                </div>
                <div className="space-y-1">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <p key={i} className="text-xs text-ink-secondary">{err.message}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FontAwesomeIcon icon={faCircleCheck} className="text-4xl text-status-success" />
            <p className="font-semibold text-ink-primary">{pendingContacts.length} 件をインポート完了</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {step === 'preview' && (
        <div className="flex-shrink-0 flex gap-2 px-5 py-4 border-t border-surface-border dark:border-dark-border">
          <button onClick={() => { setStep('drop'); setPendingContacts([]); setResult(null); }} className="px-4 py-2 text-sm border border-surface-border dark:border-dark-border rounded-lg text-ink-secondary hover:text-ink-primary transition-colors">
            戻る
          </button>
          <button onClick={handleImport} className="flex-1 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            {result?.imported} 件をインポート
          </button>
        </div>
      )}
      {step === 'done' && (
        <div className="flex-shrink-0 px-5 py-4 border-t border-surface-border dark:border-dark-border">
          <button onClick={() => { setImportModalOpen(false); setStep('drop'); }} className="w-full px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            閉じる
          </button>
        </div>
      )}
    </div>
  );
}
