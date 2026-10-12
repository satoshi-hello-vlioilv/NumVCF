import type { Contact, SortField, SortOrder } from '../types/contact';

export type GroupMode = 'kana' | 'org';

export const NO_ORG_LABEL = '所属なし';

export const groupAnchorId = (key: string) => `group-${key}`;

const KANA_ROWS: [string, RegExp][] = [
  ['あ', /^[ぁ-おァ-オ]/], ['か', /^[か-ごカ-ゴ]/], ['さ', /^[さ-ぞサ-ゾ]/], ['た', /^[た-どタ-ド]/],
  ['な', /^[な-のナ-ノ]/], ['は', /^[は-ぽハ-ポ]/], ['ま', /^[ま-もマ-モ]/], ['や', /^[ゃ-よャ-ヨ]/],
  ['ら', /^[ら-ろラ-ロ]/], ['わ', /^[ゎ-んヮ-ン]/],
];

export const INDEX_KEYS = [...KANA_ROWS.map(([k]) => k), ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'];

const collator = new Intl.Collator('ja', { sensitivity: 'base', numeric: true });

export function readingOf(c: Contact): string {
  return c.nameKana?.formatted
    || [c.nameKana?.family, c.nameKana?.given].filter(Boolean).join(' ')
    || [c.name.family, c.name.given].filter(Boolean).join(' ')
    || c.name.formatted;
}

export function kanaKey(c: Contact): string {
  const reading = readingOf(c);
  for (const [key, re] of KANA_ROWS) if (re.test(reading)) return key;
  const first = reading.charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
}

function compareBy(field: SortField) {
  return (a: Contact, b: Contact) => {
    switch (field) {
      case 'organization':
        return collator.compare(a.organization ?? '￿', b.organization ?? '￿') || collator.compare(readingOf(a), readingOf(b));
      case 'updatedAt':
        return a.meta.updatedAt.localeCompare(b.meta.updatedAt);
      case 'createdAt':
        return a.meta.createdAt.localeCompare(b.meta.createdAt);
      default: {
        const ka = INDEX_KEYS.indexOf(kanaKey(a)), kb = INDEX_KEYS.indexOf(kanaKey(b));
        return ka - kb || collator.compare(readingOf(a), readingOf(b));
      }
    }
  };
}

export function sortContacts(list: Contact[], field: SortField, order: SortOrder): Contact[] {
  const sorted = [...list].sort(compareBy(field));
  return order === 'desc' ? sorted.reverse() : sorted;
}

export interface ContactGroup {
  key: string;
  label: string;
  contacts: Contact[];
}

// Kana headers only make sense while the list is ordered by reading; for any
// other sort the list is returned as a single unlabeled group.
export function groupContacts(sorted: Contact[], mode: GroupMode, field: SortField): ContactGroup[] {
  if (mode === 'kana') {
    if (field !== 'name' && field !== 'nameKana') return [{ key: '', label: '', contacts: sorted }];
    const groups: ContactGroup[] = [];
    for (const c of sorted) {
      const key = kanaKey(c);
      const last = groups[groups.length - 1];
      if (last?.key === key) last.contacts.push(c);
      else groups.push({ key, label: key, contacts: [c] });
    }
    return groups;
  }
  const map = new Map<string, Contact[]>();
  for (const c of sorted) {
    const k = c.organization?.trim() || NO_ORG_LABEL;
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(c);
  }
  return [...map.entries()]
    .sort(([a, ca], [b, cb]) => (a === NO_ORG_LABEL ? 1 : b === NO_ORG_LABEL ? -1 : cb.length - ca.length || collator.compare(a, b)))
    .map(([k, contacts]) => ({ key: k, label: k, contacts }));
}
