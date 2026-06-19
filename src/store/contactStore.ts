import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db } from '../db/schema';
import type { Contact, SortField, SortOrder } from '../types/contact';
import { sortContacts } from '../utils/sort';

interface ContactStore {
  contacts: Contact[];
  selectedId: string | null;
  searchQuery: string;
  filterGroups: string[];
  filterTags: string[];
  sortField: SortField;
  sortOrder: SortOrder;
  isLoading: boolean;

  loadContacts: () => Promise<void>;
  addContact: (contact: Contact) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  deleteContacts: (ids: string[]) => Promise<void>;
  setSelectedId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setFilterGroups: (groups: string[]) => void;
  setFilterTags: (tags: string[]) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleFavorite: (id: string) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;

  filteredContacts: () => Contact[];
  groupedContacts: () => GroupedContacts;
}

export interface GroupedContacts {
  [key: string]: Contact[];
}

export const useContactStore = create<ContactStore>()(
  immer((set, get) => ({
    contacts: [],
    selectedId: null,
    searchQuery: '',
    filterGroups: [],
    filterTags: [],
    sortField: 'name',
    sortOrder: 'asc',
    isLoading: false,

    loadContacts: async () => {
      set(s => { s.isLoading = true; });
      const contacts = await db.contacts.toArray();
      set(s => {
        s.contacts = contacts;
        s.isLoading = false;
      });
    },

    addContact: async (contact) => {
      await db.contacts.add(contact);
      set(s => { s.contacts.push(contact); });
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
    setFilterGroups: (groups) => set(s => { s.filterGroups = groups; }),
    setFilterTags: (tags) => set(s => { s.filterTags = tags; }),
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
      const { contacts, searchQuery, filterGroups, filterTags, sortField, sortOrder } = get();
      let result = contacts;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(c =>
          c.name.formatted.toLowerCase().includes(q) ||
          c.name.family?.toLowerCase().includes(q) ||
          c.name.given?.toLowerCase().includes(q) ||
          c.organization?.toLowerCase().includes(q) ||
          c.nameKana?.formatted?.toLowerCase().includes(q) ||
          c.phones.some(p => p.value.replace(/[^\d]/g, '').includes(q.replace(/[^\d]/g, ''))) ||
          c.emails.some(e => e.value.toLowerCase().includes(q))
        );
      }

      if (filterGroups.length > 0) {
        result = result.filter(c => filterGroups.some(g => c.meta.groups.includes(g)));
      }
      if (filterTags.length > 0) {
        result = result.filter(c => filterTags.some(t => c.meta.tags.includes(t)));
      }

      return sortContacts(result, sortField, sortOrder);
    },

    groupedContacts: () => {
      const filtered = get().filteredContacts();
      const groups: GroupedContacts = {};

      for (const contact of filtered) {
        const key = getGroupKey(contact);
        if (!groups[key]) groups[key] = [];
        groups[key].push(contact);
      }

      return groups;
    },
  }))
);

function getGroupKey(contact: Contact): string {
  const kana = contact.nameKana?.family || contact.nameKana?.formatted;
  if (kana) {
    const ch = kana.charAt(0);
    if (/[あ-お]/.test(ch)) return 'あ';
    if (/[か-こが-ご]/.test(ch)) return 'か';
    if (/[さ-そざ-ぞ]/.test(ch)) return 'さ';
    if (/[た-とだ-ど]/.test(ch)) return 'た';
    if (/[な-の]/.test(ch)) return 'な';
    if (/[は-ほば-ぼぱ-ぽ]/.test(ch)) return 'は';
    if (/[ま-も]/.test(ch)) return 'ま';
    if (/[や-よ]/.test(ch)) return 'や';
    if (/[ら-ろ]/.test(ch)) return 'ら';
    if (/[わ-ん]/.test(ch)) return 'わ';
  }

  const name = contact.name.family || contact.name.formatted;
  const first = name.charAt(0).toUpperCase();
  if (/[A-Z]/.test(first)) return first;
  if (/[一-龯]/.test(first)) return '#';
  return '#';
}
