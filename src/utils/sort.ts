import type { Contact, SortField, SortOrder } from '../types/contact';

const jaCollator = new Intl.Collator('ja', { sensitivity: 'base', numeric: true });

function getSortKey(contact: Contact, field: SortField): string {
  switch (field) {
    case 'name':
      return contact.name.family
        ? `${contact.name.family} ${contact.name.given || ''}`
        : contact.name.formatted;
    case 'nameKana':
      return contact.nameKana?.formatted || contact.nameKana?.family || getSortKey(contact, 'name');
    case 'organization':
      return contact.organization || getSortKey(contact, 'name');
    case 'createdAt':
      return contact.meta.createdAt;
    case 'updatedAt':
      return contact.meta.updatedAt;
    default:
      return contact.name.formatted;
  }
}

export function sortContacts(contacts: Contact[], field: SortField, order: SortOrder): Contact[] {
  const sorted = [...contacts].sort((a, b) => {
    const keyA = getSortKey(a, field);
    const keyB = getSortKey(b, field);
    return jaCollator.compare(keyA, keyB);
  });
  return order === 'desc' ? sorted.reverse() : sorted;
}

export function getAlphabetGroups(contacts: Contact[]): string[] {
  const keys = new Set<string>();
  for (const c of contacts) {
    const kana = c.nameKana?.family || c.nameKana?.formatted;
    if (kana) {
      const ch = kana.charAt(0);
      keys.add(getKanaGroup(ch));
      continue;
    }
    const name = c.name.family || c.name.formatted;
    const first = name.charAt(0).toUpperCase();
    if (/[A-Z]/.test(first)) keys.add(first);
    else keys.add('#');
  }
  return [...keys].sort(jaCollator.compare.bind(jaCollator));
}

function getKanaGroup(ch: string): string {
  if (/[あ-おアイウエオ]/.test(ch)) return 'あ';
  if (/[か-こが-ごカキクケコガギグゲゴ]/.test(ch)) return 'か';
  if (/[さ-そざ-ぞサシスセソザジズゼゾ]/.test(ch)) return 'さ';
  if (/[た-とだ-どタチツテトダヂヅデド]/.test(ch)) return 'た';
  if (/[な-のナニヌネノ]/.test(ch)) return 'な';
  if (/[は-ほば-ぼぱ-ぽハヒフヘホバビブベボパピプペポ]/.test(ch)) return 'は';
  if (/[ま-もマミムメモ]/.test(ch)) return 'ま';
  if (/[や-よヤユヨ]/.test(ch)) return 'や';
  if (/[ら-ろラリルレロ]/.test(ch)) return 'ら';
  if (/[わ-んワヲン]/.test(ch)) return 'わ';
  return '#';
}
