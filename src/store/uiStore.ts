import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { DisplayDensity } from '../types/contact';
import type { GroupMode } from '../utils/grouping';

enableMapSet();

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  action?: { label: string; onClick: () => void };
}

interface UIStore {
  density: DisplayDensity;
  groupMode: GroupMode;
  isDarkMode: boolean;
  isImportModalOpen: boolean;
  isExportModalOpen: boolean;
  selectedIds: Set<string>;
  toasts: Toast[];

  setDensity: (d: DisplayDensity) => void;
  setGroupMode: (m: GroupMode) => void;
  toggleDarkMode: () => void;
  setImportModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  toggleSelectId: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    immer((set) => ({
      density: 'comfortable',
      groupMode: 'kana',
      isDarkMode: false,
      isImportModalOpen: false,
      isExportModalOpen: false,
      selectedIds: new Set(),
      toasts: [],

      setDensity: (d) => set(s => { s.density = d; }),
      setGroupMode: (m) => set(s => { s.groupMode = m; }),
      toggleDarkMode: () => set(s => { s.isDarkMode = !s.isDarkMode; }),
      setImportModalOpen: (open) => set(s => { s.isImportModalOpen = open; }),
      setExportModalOpen: (open) => set(s => { s.isExportModalOpen = open; }),

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
    })),
    {
      name: 'numvcf-ui',
      partialize: (s) => ({ density: s.density, groupMode: s.groupMode, isDarkMode: s.isDarkMode }),
    },
  ),
);
