import { useMemo } from 'react';
import type { Contact } from '../../types/contact';
import type { VCFFormatProfile } from '../../types/vcfFormat';
import { MANUAL_SOURCE, profileShortLabel } from '../../utils/profileLabel';

export interface Facet { id: string; label: string; count: number }

export function useFacets(contacts: Contact[], profiles: VCFFormatProfile[]) {
  return useMemo(() => {
    const tagCounts = new Map<string, number>();
    const sourceCounts = new Map<string, number>();
    for (const c of contacts) {
      for (const t of c.meta.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
      const src = c.meta.formatProfileId ?? MANUAL_SOURCE;
      sourceCounts.set(src, (sourceCounts.get(src) ?? 0) + 1);
    }
    const tags = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'))
      .map(([name, count]) => ({ name, count }));
    const sources: Facet[] = [...sourceCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, label: profileShortLabel(id, profiles), count }));
    return { tags, sources };
  }, [contacts, profiles]);
}

export function filterLabel(filter: string, profiles: VCFFormatProfile[]): string {
  if (filter === 'fav') return 'お気に入り';
  if (filter === 'pin') return 'ピン留め';
  if (filter.startsWith('tag:')) return `タグ: ${filter.slice(4)}`;
  if (filter.startsWith('fmt:')) return `取り込み元: ${profileShortLabel(filter.slice(4), profiles)}`;
  return 'すべての連絡先';
}
