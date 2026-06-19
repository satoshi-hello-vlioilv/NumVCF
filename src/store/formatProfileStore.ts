import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db } from '../db/schema';
import type { VCFFormatProfile } from '../types/vcfFormat';
import { BUILTIN_PROFILES } from '../data/formatProfiles';

interface FormatProfileStore {
  profiles: VCFFormatProfile[];
  isLoaded: boolean;

  loadProfiles: () => Promise<void>;
  addProfile: (profile: VCFFormatProfile) => Promise<void>;
  updateProfile: (id: string, updates: Partial<VCFFormatProfile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  toggleEnabled: (id: string) => Promise<void>;
  getProfile: (id: string) => VCFFormatProfile | undefined;
  enabledProfiles: () => VCFFormatProfile[];
}

export const useFormatProfileStore = create<FormatProfileStore>()(
  immer((set, get) => ({
    profiles: [],
    isLoaded: false,

    loadProfiles: async () => {
      const stored = await db.formatProfiles.toArray();
      if (stored.length === 0) {
        await db.formatProfiles.bulkAdd(BUILTIN_PROFILES);
        set(s => { s.profiles = BUILTIN_PROFILES; s.isLoaded = true; });
      } else {
        const builtinIds = new Set(BUILTIN_PROFILES.map(p => p.id));
        const hasAll = BUILTIN_PROFILES.every(bp => stored.some(sp => sp.id === bp.id));
        if (!hasAll) {
          const missingProfiles = BUILTIN_PROFILES.filter(bp => !stored.some(sp => sp.id === bp.id));
          await db.formatProfiles.bulkAdd(missingProfiles);
          const all = await db.formatProfiles.toArray();
          set(s => { s.profiles = all; s.isLoaded = true; });
        } else {
          const userProfiles = stored.filter(p => !builtinIds.has(p.id));
          set(s => { s.profiles = [...BUILTIN_PROFILES, ...userProfiles]; s.isLoaded = true; });
        }
      }
    },

    addProfile: async (profile) => {
      await db.formatProfiles.add(profile);
      set(s => { s.profiles.push(profile); });
    },

    updateProfile: async (id, updates) => {
      const now = new Date().toISOString();
      await db.formatProfiles.update(id, { ...updates, updatedAt: now });
      set(s => {
        const idx = s.profiles.findIndex(p => p.id === id);
        if (idx !== -1) {
          Object.assign(s.profiles[idx], updates);
          s.profiles[idx].updatedAt = now;
        }
      });
    },

    deleteProfile: async (id) => {
      const profile = get().profiles.find(p => p.id === id);
      if (profile?.isBuiltin) throw new Error('組み込みプロファイルは削除できません');
      await db.formatProfiles.delete(id);
      set(s => { s.profiles = s.profiles.filter(p => p.id !== id); });
    },

    toggleEnabled: async (id) => {
      const profile = get().profiles.find(p => p.id === id);
      if (!profile) return;
      const val = !profile.enabled;
      await db.formatProfiles.update(id, { enabled: val });
      set(s => {
        const p = s.profiles.find(p => p.id === id);
        if (p) p.enabled = val;
      });
    },

    getProfile: (id) => get().profiles.find(p => p.id === id),
    enabledProfiles: () => get().profiles.filter(p => p.enabled),
  }))
);
