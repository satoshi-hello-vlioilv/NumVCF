import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { DisplayDensity } from '../types/contact';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  action?: { label: string; onClick: () => void };
}

interface UIStore {
  density: DisplayDensity;
  isDarkMode: boolean;
  isDetailPanelOpen: boolean;
  isImportModalOpen: boolean;
  isExportModalOpen: boolean;
  isFormatMasterOpen: boolean;
  selectedIds: Set<string>;
  toasts: Toast[];

  setDensity: (d: DisplayDensity) => void;
  toggleDarkMode: () => void;
  setDetailPanelOpen: (open: boolean) => void;
  setImportModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setFormatMasterOpen: (open: boolean) => void;
  toggleSelectId: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    density: 'compact',
    isDarkMode: false,
    isDetailPanelOpen: false,
    isImportModalOpen: false,
    isExportModalOpen: false,
    isFormatMasterOpen: false,
    selectedIds: new Set(),
    toasts: [],

    setDensity: (d) => set(s => { s.density = d; }),
    toggleDarkMode: () => set(s => { s.isDarkMode = !s.isDarkMode; }),
    setDetailPanelOpen: (open) => set(s => { s.isDetailPanelOpen = open; }),
    setImportModalOpen: (open) => set(s => { s.isImportModalOpen = open; }),
    setExportModalOpen: (open) => set(s => { s.isExportModalOpen = open; }),
    setFormatMasterOpen: (open) => set(s => { s.isFormatMasterOpen = open; }),

    toggleSelectId: (id) => set(s => {
      const next = new Set(s.selectedIds);
      if (next.has(id)) next.delete(id); else next.add(id);
      s.selectedIds = next;
    }),
    clearSelection: () => set(s => { s.selectedIds = new Set(); }),
    selectAll: (ids) => set(s => { s.selectedIds = new Set(ids); }),

    addToast: (toast) => set(s => {
      const id = crypto.randomUUID();
      s.toasts.push({ ...toast, id });
      setTimeout(() => {
        useUIStore.getState().removeToast(id);
      }, 4000);
    }),
    removeToast: (id) => set(s => {
      s.toasts = s.toasts.filter(t => t.id !== id);
    }),
  }))
);
