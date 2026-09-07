import { describe, it, expect } from 'vitest';
import { parseVCFText } from './index';
import { BUILTIN_PROFILES } from '../../data/formatProfiles';

const profiles = BUILTIN_PROFILES;

describe('parseVCFText robustness', () => {
  it('parses a minimal standard vCard 3.0', () => {
    const vcf = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Taro Yamada',
      'N:Yamada;Taro;;;',
      'TEL;TYPE=CELL:090-1234-5678',
      'EMAIL;TYPE=WORK:taro@example.com',
      'END:VCARD',
    ].join('\r\n');
    const { contacts, result } = parseVCFText(vcf, { profiles, filename: 'a.vcf' });
    expect(result.errors).toHaveLength(0);
    expect(contacts).toHaveLength(1);
    expect(contacts[0].name.formatted).toBe('Taro Yamada');
    expect(contacts[0].phones[0].value).toBe('090-1234-5678');
  });

  it('handles vCard 4.0 tel: URI form', () => {
    const vcf = [
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jiro Suzuki',
      'TEL;VALUE=uri;TYPE=cell:tel:+81-90-9999-8888;ext=12',
      'END:VCARD',
    ].join('\n');
    const { contacts } = parseVCFText(vcf, { profiles });
    expect(contacts[0].phones[0].value).toBe('+81-90-9999-8888');
  });

  it('normalizes YYYYMMDD birthday to ISO format', () => {
    const vcf = ['BEGIN:VCARD', 'VERSION:2.1', 'FN:Test', 'BDAY:19850615', 'END:VCARD'].join('\n');
    const { contacts } = parseVCFText(vcf, { profiles });
    expect(contacts[0].birthday).toBe('1985-06-15');
  });

  it('converts base64 PHOTO into a data URI', () => {
    const vcf = [
      'BEGIN:VCARD', 'VERSION:3.0', 'FN:Photo Test',
      'PHOTO;ENCODING=b;TYPE=JPEG:/9j/4AAQ',
      'END:VCARD',
    ].join('\n');
    const { contacts } = parseVCFText(vcf, { profiles });
    expect(contacts[0].photo).toBe('data:image/jpeg;base64,/9j/4AAQ');
  });

  it('keeps PHOTO URI references as-is', () => {
    const vcf = [
      'BEGIN:VCARD', 'VERSION:4.0', 'FN:Photo URI',
      'PHOTO;VALUE=uri:https://example.com/p.jpg',
      'END:VCARD',
    ].join('\n');
    const { contacts } = parseVCFText(vcf, { profiles });
    expect(contacts[0].photo).toBe('https://example.com/p.jpg');
  });

  it('skips fully-empty ADR entries', () => {
    const vcf = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:Empty Addr', 'ADR:;;;;;;', 'END:VCARD'].join('\n');
    const { contacts } = parseVCFText(vcf, { profiles });
    expect(contacts[0].addresses).toHaveLength(0);
  });

  it('captures unknown/vendor-specific properties as custom fields instead of dropping them', () => {
    const vcf = [
      'BEGIN:VCARD', 'VERSION:3.0', 'FN:Custom Field Test',
      'X-SOME-VENDOR-FIELD:hello world',
      'X-ABLabel:Personal',
      'END:VCARD',
    ].join('\n');
    const { contacts } = parseVCFText(vcf, { profiles });
    const keys = contacts[0].customFields.map(f => f.key);
    expect(keys).toContain('X-SOME-VENDOR-FIELD');
    expect(keys).toContain('X-ABLABEL');
  });

  it('does not corrupt outer card fields when a nested BEGIN:VCARD (AGENT) is present', () => {
    const vcf = [
      'BEGIN:VCARD',
      'VERSION:2.1',
      'FN:Outer Person',
      'BEGIN:VCARD',
      'FN:Inner Agent',
      'END:VCARD',
      'TEL:03-1111-2222',
      'END:VCARD',
    ].join('\n');
    const { contacts, result } = parseVCFText(vcf, { profiles });
    expect(result.total).toBe(1);
    expect(contacts).toHaveLength(1);
    expect(contacts[0].name.formatted).toBe('Outer Person');
    expect(contacts[0].phones[0]?.value).toBe('03-1111-2222');
  });

  it('handles multiple vCards in a single file', () => {
    const vcf = [
      'BEGIN:VCARD', 'VERSION:3.0', 'FN:Person One', 'END:VCARD',
      'BEGIN:VCARD', 'VERSION:3.0', 'FN:Person Two', 'END:VCARD',
    ].join('\n');
    const { contacts } = parseVCFText(vcf, { profiles });
    expect(contacts).toHaveLength(2);
    expect(contacts.map(c => c.name.formatted)).toEqual(['Person One', 'Person Two']);
  });

  it('tolerates malformed lines without crashing', () => {
    const vcf = [
      'BEGIN:VCARD', 'VERSION:3.0', 'FN:Survivor',
      'THIS LINE HAS NO COLON AT ALL',
      'TEL:080-0000-0000',
      'END:VCARD',
    ].join('\n');
    const { contacts, result } = parseVCFText(vcf, { profiles });
    expect(result.errors).toHaveLength(0);
    expect(contacts[0].name.formatted).toBe('Survivor');
    expect(contacts[0].phones[0].value).toBe('080-0000-0000');
  });

  it('falls back to a default profile when no VERSION/markers are present', () => {
    const vcf = ['BEGIN:VCARD', 'FN:No Version', 'END:VCARD'].join('\n');
    const { contacts, detectedProfileId } = parseVCFText(vcf, { profiles });
    expect(contacts).toHaveLength(1);
    expect(detectedProfileId === null || typeof detectedProfileId === 'string').toBe(true);
  });

  it('parses folded (line-wrapped) property values per RFC 2425/6350', () => {
    const vcf = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Folded',
      'NOTE:This is a long note that wraps across\r\n  multiple physical lines per RFC folding.',
      'END:VCARD',
    ].join('\r\n');
    const { contacts } = parseVCFText(vcf, { profiles });
    expect(contacts[0].meta.notes).toBe('This is a long note that wraps across multiple physical lines per RFC folding.');
  });
});
