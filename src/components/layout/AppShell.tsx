import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressBook, faFileImport, faPlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { TopBar } from './TopBar';
import { ListToolbar } from './ListToolbar';
import { ContactTable } from '../contacts/ContactTable';
import { ContactMobileList } from '../contacts/ContactMobileList';
import { ContactDetail } from '../contacts/ContactDetail';
import { AlphabetIndex } from '../contacts/AlphabetIndex';
import { SEARCH_INPUT_ID } from '../search/SearchInput';
import { ImportCenter } from '../vcf/ImportCenter';
import { ExportCenter } from '../vcf/ExportCenter';
import { ToastContainer } from '../ui/Toast';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useContactStore, filterContacts } from '../../store/contactStore';
import { useUIStore } from '../../store/uiStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { groupContacts, groupAnchorId } from '../../utils/grouping';

const NON_TEXT_INPUTS = new Set(['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file']);

function isTypingTarget(t: EventTarget | null) {
  if (t instanceof HTMLInputElement) return !NON_TEXT_INPUTS.has(t.type);
  return t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement || (t instanceof HTMLElement && t.isContentEditable);
}

export function AppShell() {
  const navigate = useNavigate();
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const { contacts, isLoaded, selectedId, setSelectedId, sortField, sortOrder, searchQuery, filter, deleteContacts } = useContactStore();
  const {
    groupMode, isImportModalOpen, setImportModalOpen, isExportModalOpen, setExportModalOpen,
    selectedIds, clearSelection, addToast,
  } = useUIStore();
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const visible = useMemo(() => filterContacts(contacts, searchQuery, filter, sortField, sortOrder), [contacts, searchQuery, filter, sortField, sortOrder]);
  const groups = useMemo(() => groupContacts(visible, groupMode, sortField), [visible, groupMode, sortField]);
  const ordered = useMemo(() => groups.flatMap(g => g.contacts), [groups]);
  const selected = contacts.find(c => c.id === selectedId) ?? null;
  const showIndex = groupMode === 'kana' && groups.length > 1;

  const jumpTo = (key: string) => {
    document.getElementById(groupAnchorId(key))?.scrollIntoView({ block: 'start' });
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (selectedIds.size > 0) clearSelection();
      else setSelectedId(null);
      return;
    }
    if (isTypingTarget(e.target) || document.querySelector('[role="dialog"]')) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'n') { e.preventDefault(); navigate('/add'); }
    else if (mod && e.key.toLowerCase() === 'i') { e.preventDefault(); setImportModalOpen(true); }
    else if (mod && e.shiftKey && e.key.toLowerCase() === 'e') { e.preventDefault(); setExportModalOpen(true); }
    else if (mod && e.key.toLowerCase() === 'e' && selectedId) { e.preventDefault(); navigate(`/edit/${selectedId}`); }
    else if (e.key === '/') { e.preventDefault(); document.getElementById(SEARCH_INPUT_ID)?.focus(); }
    else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && ordered.length) {
      e.preventDefault();
      const idx = ordered.findIndex(c => c.id === selectedId);
      const next = e.key === 'ArrowDown' ? Math.min(idx + 1, ordered.length - 1) : Math.max(idx - 1, 0);
      setSelectedId(ordered[idx === -1 ? 0 : next].id);
    }
  }, [selectedIds, clearSelection, setSelectedId, navigate, setImportModalOpen, setExportModalOpen, selectedId, ordered]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleBulkDelete = async () => {
    const n = selectedIds.size;
    await deleteContacts([...selectedIds]);
    clearSelection();
    setConfirmBulkDelete(false);
    addToast({ type: 'success', message: `${n} 件を削除しました` });
  };

  const detailOpen = !!selected;
  // Below lg the screen is too narrow for list + detail side by side, so the
  // detail takes the whole width and the list returns when it is closed.
  const listHiddenOnMobile = detailOpen && !isLg;

  let listBody: React.ReactNode;
  if (!isLoaded) {
    listBody = <p className="p-6 text-sm text-ink-placeholder">読み込み中…</p>;
  } else if (contacts.length === 0) {
    listBody = (
      <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="w-16 h-16 rounded-full bg-surface-card dark:bg-dark-surface flex items-center justify-center"><FontAwesomeIcon icon={faAddressBook} className="text-2xl text-ink-placeholder" /></span>
        <p className="font-semibold text-ink-primary dark:text-slate-100">連絡先がまだありません</p>
        <p className="text-sm text-ink-secondary">VCF ファイルを取り込むか、手動で追加してください</p>
        <div className="flex gap-2 mt-1">
          <button type="button" onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm"><FontAwesomeIcon icon={faFileImport} />VCF をインポート</button>
          <button type="button" onClick={() => navigate('/add')} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-surface-border dark:border-dark-border text-sm text-ink-primary dark:text-slate-200 hover:bg-surface-base"><FontAwesomeIcon icon={faPlus} />手動で追加</button>
        </div>
      </div>
    );
  } else if (visible.length === 0) {
    listBody = (
      <div className="h-full flex flex-col items-center justify-center gap-2 px-6 text-center text-sm text-ink-secondary">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-2xl text-ink-placeholder" />
        条件に一致する連絡先はありません
      </div>
    );
  } else {
    // With a contact open, the list narrows to two-line rows (name / org +
    // phone) instead of a cramped table, so no column ever gets cut off.
    listBody = isMd && !detailOpen
      ? <ContactTable groups={groups} mode={groupMode} />
      : <ContactMobileList groups={groups} mode={groupMode} />;
  }

  return (
    <div className="h-screen flex bg-surface-base dark:bg-dark-base text-ink-primary dark:text-slate-100 overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col">
        {!listHiddenOnMobile && <TopBar />}

        <div className="flex-1 min-h-0 flex">
          {!listHiddenOnMobile && (
            <section
              aria-label="連絡先一覧"
              className={`${detailOpen ? 'w-80 xl:w-96 flex-shrink-0' : 'flex-1'} min-w-0 flex flex-col bg-white dark:bg-dark-card border-r border-surface-border dark:border-dark-border`}
            >
              {contacts.length > 0 && <ListToolbar count={visible.length} visibleIds={ordered.map(c => c.id)} onBulkDelete={() => setConfirmBulkDelete(true)} />}
              <div className="flex-1 min-h-0 flex">
                <div className="flex-1 min-w-0 overflow-auto">{listBody}</div>
                {showIndex && visible.length > 0 && <AlphabetIndex availableKeys={new Set(groups.map(g => g.key))} onSelect={jumpTo} />}
              </div>
            </section>
          )}

          {selected && (
            <main className="flex-1 min-w-0 flex flex-col" aria-label="連絡先の詳細">
              <ContactDetail contact={selected} onClose={() => setSelectedId(null)} />
            </main>
          )}
        </div>
      </div>

      {isImportModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="VCF インポート">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setImportModalOpen(false)} />
          <div className="relative bg-white dark:bg-dark-card rounded-t-2xl sm:rounded-xl shadow-overlay w-full max-w-md max-h-[85vh] min-h-[22rem] flex flex-col overflow-hidden">
            <ImportCenter />
          </div>
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="VCF エクスポート">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setExportModalOpen(false)} />
          <div className="relative bg-white dark:bg-dark-card rounded-t-2xl sm:rounded-xl shadow-overlay w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
            <ExportCenter />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmBulkDelete}
        title="一括削除"
        message={`選択中の ${selectedIds.size} 件の連絡先を削除しますか？この操作は元に戻せません。`}
        confirmLabel="削除"
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      <ToastContainer />
    </div>
  );
}
