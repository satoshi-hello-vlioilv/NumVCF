import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db } from '../db/schema';
import type { Contact, SortField, SortOrder } from '../types/contact';
import { sortContacts } from '../utils/grouping';
import { MANUAL_SOURCE } from '../utils/profileLabel';

// 'all' | 'fav' | 'pin' | `tag:${name}` | `fmt:${profileId}`
export type ContactFilter = string;

interface ContactStore {
  contacts: Contact[];
  selectedId: string | null;
  searchQuery: string;
  filter: ContactFilter;
  sortField: SortField;
  sortOrder: SortOrder;
  isLoading: boolean;
  isLoaded: boolean;

  loadContacts: () => Promise<void>;
  addContact: (contact: Contact) => Promise<void>;
  importContacts: (incoming: Contact[], onProgress?: (done: number, total: number) => void) => Promise<{ added: number; skippedDuplicateUid: number }>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  deleteContacts: (ids: string[]) => Promise<void>;
  setSelectedId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setFilter: (filter: ContactFilter) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleFavorite: (id: string) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;

  filteredContacts: () => Contact[];
}

export function filterContacts(
  contacts: Contact[], searchQuery: string, filter: ContactFilter, sortField: SortField, sortOrder: SortOrder,
): Contact[] {
  let result = contacts;

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    // Only compare phone digits when the query contains digits; an empty
    // digit string would otherwise match every contact that has a phone.
    const qDigits = q.replace(/\D/g, '');
    result = result.filter(c =>
      c.name.formatted.toLowerCase().includes(q) ||
      c.nameKana?.formatted?.toLowerCase().includes(q) ||
      c.organization?.toLowerCase().includes(q) ||
      c.department?.toLowerCase().includes(q) ||
      c.emails.some(e => e.value.toLowerCase().includes(q)) ||
      c.meta.tags.some(t => t.toLowerCase().includes(q)) ||
      (qDigits.length > 0 && c.phones.some(p => p.value.replace(/\D/g, '').includes(qDigits)))
    );
  }

  if (filter === 'fav') result = result.filter(c => c.meta.isFavorite);
  else if (filter === 'pin') result = result.filter(c => c.meta.isPinned);
  else if (filter.startsWith('tag:')) result = result.filter(c => c.meta.tags.includes(filter.slice(4)));
  else if (filter.startsWith('fmt:')) {
    const id = filter.slice(4);
    result = result.filter(c => (c.meta.formatProfileId ?? MANUAL_SOURCE) === id);
  }

  return sortContacts(result, sortField, sortOrder);
}

export const useContactStore = create<ContactStore>()(
  immer((set, get) => ({
    contacts: [],
    selectedId: null,
    searchQuery: '',
    filter: 'all',
    sortField: 'name',
    sortOrder: 'asc',
    isLoading: false,
    isLoaded: false,

    loadContacts: async () => {
      set(s => { s.isLoading = true; });
      const contacts = await db.contacts.toArray();
      set(s => {
        s.contacts = contacts;
        s.isLoading = false;
        s.isLoaded = true;
      });
    },

    addContact: async (contact) => {
      await db.contacts.add(contact);
      set(s => { s.contacts.push(contact); });
    },

    // Writes in chunks with one bulkAdd each and updates the store once at the
    // end; adding one row at a time re-rendered the whole list per contact.
    importContacts: async (incoming, onProgress) => {
      const knownUids = new Set(get().contacts.map(c => c.uid).filter((u): u is string => !!u));
      const toAdd: Contact[] = [];
      let skippedDuplicateUid = 0;
      for (const c of incoming) {
        if (c.uid && knownUids.has(c.uid)) { skippedDuplicateUid++; continue; }
        if (c.uid) knownUids.add(c.uid);
        toAdd.push(c);
      }
      const CHUNK = 500;
      onProgress?.(0, toAdd.length);
      for (let i = 0; i < toAdd.length; i += CHUNK) {
        await db.contacts.bulkAdd(toAdd.slice(i, i + CHUNK));
        onProgress?.(Math.min(i + CHUNK, toAdd.length), toAdd.length);
      }
      set(s => { s.contacts.push(...toAdd); });
      return { added: toAdd.length, skippedDuplicateUid };
    },

    updateContact: async (id, updates) => {
      const now = new Date().toISOString();
      await db.contacts.update(id, { ...updates, 'meta.updatedAt': now });
      set(s => {
        const idx = s.contacts.findIndex(c => c.id === id);
        if (idx !== -1) {
          Object.assign(s.contacts[idx], updates);
          s.contacts[idx].meta.updatedAt = now;
        }
      });
    },

    deleteContact: async (id) => {
      await db.contacts.delete(id);
      set(s => {
        s.contacts = s.contacts.filter(c => c.id !== id);
        if (s.selectedId === id) s.selectedId = null;
      });
    },

    deleteContacts: async (ids) => {
      await db.contacts.bulkDelete(ids);
      set(s => {
        s.contacts = s.contacts.filter(c => !ids.includes(c.id));
        if (ids.includes(s.selectedId ?? '')) s.selectedId = null;
      });
    },

    setSelectedId: (id) => set(s => { s.selectedId = id; }),
    setSearchQuery: (q) => set(s => { s.searchQuery = q; }),
    setFilter: (filter) => set(s => { s.filter = filter; }),
    setSortField: (field) => set(s => { s.sortField = field; }),
    setSortOrder: (order) => set(s => { s.sortOrder = order; }),

    toggleFavorite: async (id) => {
      const contact = get().contacts.find(c => c.id === id);
      if (!contact) return;
      const val = !contact.meta.isFavorite;
      await db.contacts.update(id, { 'meta.isFavorite': val } as Partial<Contact>);
      set(s => {
        const c = s.contacts.find(c => c.id === id);
        if (c) c.meta.isFavorite = val;
      });
    },

    togglePinned: async (id) => {
      const contact = get().contacts.find(c => c.id === id);
      if (!contact) return;
      const val = !contact.meta.isPinned;
      await db.contacts.update(id, { 'meta.isPinned': val } as Partial<Contact>);
      set(s => {
        const c = s.contacts.find(c => c.id === id);
        if (c) c.meta.isPinned = val;
      });
    },

    filteredContacts: () => {
      const { contacts, searchQuery, filter, sortField, sortOrder } = get();
      return filterContacts(contacts, searchQuery, filter, sortField, sortOrder);
    },
  }))
);
