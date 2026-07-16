import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAddressBook, faFileImport, faFileExport, faGear,
  faMoon, faSun, faPlus, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { SearchBar } from '../search/SearchBar';
import { ContactList } from '../contacts/ContactList';
import { ContactDetail } from '../contacts/ContactDetail';
import { ImportCenter } from '../vcf/ImportCenter';
import { ExportCenter } from '../vcf/ExportCenter';
import { ToastContainer } from '../ui/Toast';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useContactStore } from '../../store/contactStore';
import { useUIStore } from '../../store/uiStore';
import { useState } from 'react';

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

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => navigate('/add')}
            title="新規追加 (Ctrl+N)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline">追加</span>
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            title="VCF インポート (Ctrl+I)"
            className="p-2 text-ink-secondary hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faFileImport} className="text-sm" />
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            title="VCF エクスポート (Ctrl+Shift+E)"
            className="p-2 text-ink-secondary hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faFileExport} className="text-sm" />
          </button>
          <button
            onClick={toggleDarkMode}
            title="ダークモード切替"
            className="p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-card rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="text-sm" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            title="設定"
            className="p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-card rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faGear} className="text-sm" />
          </button>
        </div>
      </header>

      {/* Sub Bar: density + status */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-1.5 bg-surface-base dark:bg-dark-base border-b border-surface-border/60 dark:border-dark-border/60">
        <div className="flex items-center gap-1">
          {(['compact', 'comfortable', 'spacious'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`px-2 py-0.5 text-2xs rounded transition-colors ${density === d ? 'bg-primary-100 text-primary-700 font-medium' : 'text-ink-placeholder hover:text-ink-secondary'}`}
            >
              {d === 'compact' ? 'コンパクト' : d === 'comfortable' ? '標準' : 'ゆったり'}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {selectedIds.size > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary-600 font-medium">{selectedIds.size} 件選択中</span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1 px-2 py-0.5 text-xs text-status-danger hover:bg-red-50 rounded transition-colors"
            >
              <FontAwesomeIcon icon={faTrash} className="text-2xs" />削除
            </button>
            <button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-1 px-2 py-0.5 text-xs text-teal-600 hover:bg-teal-50 rounded transition-colors"
            >
              <FontAwesomeIcon icon={faFileExport} className="text-2xs" />エクスポート
            </button>
            <button onClick={clearSelection} className="text-xs text-ink-placeholder hover:text-ink-secondary transition-colors">
              解除
            </button>
          </div>
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
