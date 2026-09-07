import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAddressBook, faFileImport, faFileExport, faGear,
  faMoon, faSun, faPlus, faTrash, faEllipsisVertical,
  faSliders, faCheck, faChevronDown, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { SearchBar } from '../search/SearchBar';
import { ContactList } from '../contacts/ContactList';
import { ContactDetail } from '../contacts/ContactDetail';
import { ImportCenter } from '../vcf/ImportCenter';
import { ExportCenter } from '../vcf/ExportCenter';
import { ToastContainer } from '../ui/Toast';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Popover, PopoverItem, PopoverDivider, PopoverLabel } from '../ui/Popover';
import { useContactStore } from '../../store/contactStore';
import { useUIStore } from '../../store/uiStore';
import type { DisplayDensity } from '../../types/contact';

const DENSITY_LABELS: Record<DisplayDensity, string> = {
  compact: 'コンパクト',
  comfortable: '標準',
  spacious: 'ゆったり',
};

export function AppShell() {
  const navigate = useNavigate();
  const {
    contacts, selectedId, filteredContacts, deleteContacts, loadContacts,
  } = useContactStore();
  const {
    isDarkMode, toggleDarkMode,
    density, setDensity,
    isDetailPanelOpen, setDetailPanelOpen,
    isImportModalOpen, setImportModalOpen,
    isExportModalOpen, setExportModalOpen,
    selectedIds, clearSelection,
    addToast,
  } = useUIStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const selectedContact = contacts.find(c => c.id === selectedId);
  const totalFiltered = filteredContacts().length;

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); navigate('/add'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); setImportModalOpen(true); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') { e.preventDefault(); setExportModalOpen(true); }
    if (e.key === 'Escape') { setDetailPanelOpen(false); clearSelection(); }
  }, [navigate, setImportModalOpen, setExportModalOpen, setDetailPanelOpen, clearSelection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleBulkDelete = async () => {
    await deleteContacts([...selectedIds]);
    clearSelection();
    addToast({ type: 'success', message: `${selectedIds.size} 件を削除しました` });
    setShowDeleteConfirm(false);
  };

  return (
    <div className="h-screen flex flex-col bg-surface-base dark:bg-dark-base text-ink-primary overflow-hidden">
      {/* Top Bar */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-dark-card border-b border-surface-border dark:border-dark-border shadow-card z-20">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <FontAwesomeIcon icon={faAddressBook} className="text-primary-500 text-lg" />
          <span className="font-bold text-sm text-primary-700 dark:text-primary-300 tracking-tight">NumVCF</span>
          <span className="px-1.5 py-0.5 text-2xs font-mono font-medium text-ink-secondary bg-surface-card dark:bg-dark-surface rounded">
            v{__APP_VERSION__}
          </span>
        </div>

        {/* Search */}
        <SearchBar />

        {/* Primary action + overflow menu — secondary actions (import,
            export, dark mode, settings) live in a popover instead of four
            separate always-visible icon buttons. */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => navigate('/add')}
            title="新規追加 (Ctrl+N)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline">追加</span>
          </button>

          <Popover
            trigger={({ onClick, isOpen }) => (
              <button
                onClick={onClick}
                title="その他の操作"
                className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-surface-card text-ink-primary' : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-card'}`}
              >
                <FontAwesomeIcon icon={faEllipsisVertical} className="text-sm" />
              </button>
            )}
          >
            {close => (
              <>
                <PopoverItem icon={faFileImport} label="VCF インポート" hint="Ctrl+I" onClick={() => { setImportModalOpen(true); close(); }} />
                <PopoverItem icon={faFileExport} label="VCF エクスポート" hint="Ctrl+⇧E" onClick={() => { setExportModalOpen(true); close(); }} />
                <PopoverDivider />
                <PopoverItem icon={isDarkMode ? faSun : faMoon} label={isDarkMode ? 'ライトモードに切替' : 'ダークモードに切替'} onClick={() => { toggleDarkMode(); close(); }} />
                <PopoverItem icon={faGear} label="設定" onClick={() => { navigate('/settings'); close(); }} />
              </>
            )}
          </Popover>
        </div>
      </header>

      {/* Sub Bar: density + status */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-1.5 bg-surface-base dark:bg-dark-base border-b border-surface-border/60 dark:border-dark-border/60">
        <Popover
          align="left"
          trigger={({ onClick, isOpen }) => (
            <button
              onClick={onClick}
              className={`flex items-center gap-1.5 px-2 py-1 text-2xs rounded transition-colors ${isOpen ? 'bg-surface-card text-ink-primary' : 'text-ink-secondary hover:bg-surface-card'}`}
            >
              <FontAwesomeIcon icon={faSliders} className="text-2xs" />
              表示: {DENSITY_LABELS[density]}
              <FontAwesomeIcon icon={faChevronDown} className="text-2xs text-ink-placeholder" />
            </button>
          )}
        >
          {close => (
            <>
              <PopoverLabel>表示密度</PopoverLabel>
              {(['compact', 'comfortable', 'spacious'] as const).map(d => (
                <PopoverItem
                  key={d}
                  icon={density === d ? faCheck : undefined}
                  label={DENSITY_LABELS[d]}
                  active={density === d}
                  onClick={() => { setDensity(d); close(); }}
                />
              ))}
            </>
          )}
        </Popover>

        <div className="flex-1" />

        {selectedIds.size > 0 ? (
          <Popover
            trigger={({ onClick, isOpen }) => (
              <button
                onClick={onClick}
                className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${isOpen ? 'bg-primary-100 text-primary-700' : 'text-primary-600 hover:bg-primary-50'}`}
              >
                <span className="font-medium">{selectedIds.size} 件選択中</span>
                <FontAwesomeIcon icon={faChevronDown} className="text-2xs" />
              </button>
            )}
          >
            {close => (
              <>
                <PopoverItem icon={faFileExport} label="選択項目をエクスポート" onClick={() => { setExportModalOpen(true); close(); }} />
                <PopoverItem icon={faTrash} label="選択項目を削除" variant="danger" onClick={() => { setShowDeleteConfirm(true); close(); }} />
                <PopoverDivider />
                <PopoverItem icon={faXmark} label="選択解除" onClick={() => { clearSelection(); close(); }} />
              </>
            )}
          </Popover>
        ) : (
          <span className="text-xs text-ink-placeholder">{totalFiltered} 件</span>
        )}
      </div>

      {/* Main area: list + detail panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Contact list */}
        <div className={`flex flex-col transition-all duration-base ${isDetailPanelOpen ? 'w-80 flex-shrink-0' : 'flex-1'} border-r border-surface-border dark:border-dark-border overflow-hidden`}>
          <ContactList />
        </div>

        {/* Detail panel */}
        {isDetailPanelOpen && selectedContact && (
          <div className="flex-1 overflow-hidden bg-white dark:bg-dark-card">
            <ContactDetail contact={selectedContact} />
          </div>
        )}
        {isDetailPanelOpen && !selectedContact && (
          <div className="flex-1 flex items-center justify-center text-ink-placeholder text-sm bg-white dark:bg-dark-card">
            <div className="text-center">
              <FontAwesomeIcon icon={faAddressBook} className="text-3xl mb-3 block" />
              <p>連絡先を選択してください</p>
            </div>
          </div>
        )}
      </div>

      {/* Import modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setImportModalOpen(false)} />
          <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-overlay w-full max-w-md h-[70vh] flex flex-col overflow-hidden">
            <ImportCenter />
          </div>
        </div>
      )}

      {/* Export modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setExportModalOpen(false)} />
          <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-overlay w-full max-w-md h-auto max-h-[70vh] flex flex-col overflow-hidden">
            <ExportCenter />
          </div>
        </div>
      )}

      {/* Bulk delete confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="一括削除"
        message={`選択中の ${selectedIds.size} 件の連絡先を削除しますか？`}
        confirmLabel="削除"
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ToastContainer />
    </div>
  );
}
