import { useCallback, useEffect, useMemo, type RefObject } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Contact } from '../types/contact';
import type { ContactGroup } from '../utils/grouping';

export type VirtualRow =
  | { kind: 'group'; group: ContactGroup; groupIndex: number }
  | { kind: 'contact'; contact: Contact; groupIndex: number };

// Only the rows near the viewport are rendered, so thousands of contacts stay
// responsive. Rows are laid out in normal flow between two spacers (instead
// of absolute positioning) so the same model works for <table> rows too.
export function useVirtualRows(
  groups: ContactGroup[],
  scrollRef: RefObject<HTMLElement | null>,
  { rowHeight, headerHeight, scrollPaddingStart = 0 }: { rowHeight: number; headerHeight: number; scrollPaddingStart?: number },
) {
  const rows = useMemo(() => {
    const out: VirtualRow[] = [];
    groups.forEach((group, groupIndex) => {
      if (group.label) out.push({ kind: 'group', group, groupIndex });
      for (const contact of group.contacts) out.push({ kind: 'contact', contact, groupIndex });
    });
    return out;
  }, [groups]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: i => (rows[i].kind === 'group' ? headerHeight : rowHeight),
    overscan: 12,
    scrollPaddingStart,
    getItemKey: i => {
      const r = rows[i];
      return r.kind === 'group' ? `g:${r.group.key}` : r.contact.id;
    },
  });

  // Sizes cached for one presentation (table vs. two-line rows, density) are
  // wrong for another, so drop the cache when the layout changes.
  useEffect(() => {
    virtualizer.measure();
  }, [virtualizer, rowHeight, headerHeight]);

  const items = virtualizer.getVirtualItems();
  const paddingTop = items.length ? items[0].start : 0;
  const paddingBottom = items.length ? virtualizer.getTotalSize() - items[items.length - 1].end : 0;

  const scrollToGroup = useCallback((key: string) => {
    const index = rows.findIndex(r => r.kind === 'group' && r.group.key === key);
    if (index >= 0) virtualizer.scrollToIndex(index, { align: 'start' });
  }, [rows, virtualizer]);

  const scrollToContact = useCallback((id: string) => {
    const index = rows.findIndex(r => r.kind === 'contact' && r.contact.id === id);
    if (index >= 0) virtualizer.scrollToIndex(index, { align: 'auto' });
  }, [rows, virtualizer]);

  const firstVisible = items.find(i => i.end > (virtualizer.scrollOffset ?? 0) + scrollPaddingStart);
  const currentGroup = firstVisible ? groups[rows[firstVisible.index].groupIndex] : undefined;

  return { rows, items, paddingTop, paddingBottom, measure: virtualizer.measureElement, scrollToGroup, scrollToContact, currentGroup };
}

export type VirtualRowsModel = ReturnType<typeof useVirtualRows>;
