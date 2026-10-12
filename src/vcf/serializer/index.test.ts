import { describe, it, expect } from 'vitest';
import { serializeContacts } from './index';
import { parseVCFText } from '../parser';
import { BUILTIN_PROFILES } from '../../data/formatProfiles';
import type { Contact } from '../../types/contact';

const contact: Contact = {
  id: 'c1',
  name: { formatted: '山田 太郎', family: '山田', given: '太郎' },
  organization: '株式会社A;B', department: '営業部',
  phones: [{ id: 'p', label: 'mobile', value: '090-1234-5678' }],
  emails: [], urls: [], socialProfiles: [], instantMessages: [],
  addresses: [{ id: 'a', label: 'work', value: { street: '本町9-24-4', city: '渋谷区', region: '東京都', postalCode: '150-0080' } }],
  customFields: [],
  meta: { createdAt: '', updatedAt: '', groups: [], tags: ['取引先', '東京,大阪'], isFavorite: false, isPinned: false, notes: '1行目\n2行目, カンマ; セミコロン' },
};

describe.each(['vcf-standard-30', 'vcf-standard-40', 'vcf-standard-21'])('round trip via %s', profileId => {
  const profile = BUILTIN_PROFILES.find(p => p.id === profileId)!;
  const text = serializeContacts([contact], profile);
  const parsed = parseVCFText(text, { profiles: BUILTIN_PROFILES }).contacts[0];

  it('keeps multi-line notes and separators intact', () => {
    expect(parsed.meta.notes?.replace(/\r\n/g, '\n')).toBe(contact.meta.notes);
  });
  it('keeps structured fields intact', () => {
    expect(parsed.organization).toBe('株式会社A;B');
    expect(parsed.department).toBe('営業部');
    expect(parsed.addresses[0].value.street).toBe('本町9-24-4');
  });
  it('never writes a raw line break inside a property value', () => {
    const bodyLines = text.split(/\r?\n/).filter(l => l && !/^[ \t]/.test(l));
    for (const line of bodyLines) {
      expect(line.includes(':') || line.startsWith('=') || /^[A-F0-9=]+$/i.test(line)).toBe(true);
    }
  });
});
