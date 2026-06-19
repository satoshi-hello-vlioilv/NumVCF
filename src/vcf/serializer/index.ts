import type { Contact } from '../../types/contact';
import type { VCFFormatProfile } from '../../types/vcfFormat';

function foldLine(line: string, maxLen = 75): string {
  if (line.length <= maxLen) return line;
  let result = '';
  let pos = 0;
  while (pos < line.length) {
    if (pos === 0) {
      result += line.slice(0, maxLen);
      pos = maxLen;
    } else {
      result += '\r\n ' + line.slice(pos, pos + maxLen - 1);
      pos += maxLen - 1;
    }
  }
  return result;
}

function prop(name: string, value: string | undefined, profile: VCFFormatProfile, params?: Record<string, string>): string {
  if (!value?.trim()) return '';
  const paramStr = params ? Object.entries(params).map(([k, v]) => `;${k}=${v}`).join('') : '';
  const line = `${name}${paramStr}:${value}`;
  const lineEnding = profile.exportTemplate.lineEnding === 'CRLF' ? '\r\n' : '\n';
  return foldLine(line, profile.exportTemplate.foldingLength) + lineEnding;
}

function addressToVCF(addr: NonNullable<Contact['addresses'][0]>['value']): string {
  return [
    addr.poBox || '',
    addr.extended || '',
    addr.street || '',
    addr.city || '',
    addr.region || '',
    addr.postalCode || '',
    addr.country || '',
  ].join(';');
}

export function serializeContacts(contacts: Contact[], profile: VCFFormatProfile): string {
  const LE = profile.exportTemplate.lineEnding === 'CRLF' ? '\r\n' : '\n';
  const lines: string[] = [];

  for (const contact of contacts) {
    const parts: string[] = [];
    parts.push(`BEGIN:VCARD${LE}`);
    parts.push(`VERSION:${profile.version}${LE}`);

    if (contact.uid) parts.push(prop('UID', contact.uid, profile));
    if (contact.rev) parts.push(prop('REV', contact.rev, profile));

    const n = contact.name;
    parts.push(prop('FN', n.formatted, profile));
    parts.push(prop('N', `${n.family || ''};${n.given || ''};${n.additional || ''};${n.prefix || ''};${n.suffix || ''}`, profile));

    if (contact.nameKana?.formatted) {
      if (profile.version === '2.1') {
        parts.push(prop('SOUND', contact.nameKana.formatted, profile));
      } else {
        parts.push(prop('X-PHONETIC-LAST-NAME', contact.nameKana.family || '', profile));
        parts.push(prop('X-PHONETIC-FIRST-NAME', contact.nameKana.given || '', profile));
      }
    }

    if (contact.organization) {
      parts.push(prop('ORG', contact.department ? `${contact.organization};${contact.department}` : contact.organization, profile));
    }
    if (contact.title) parts.push(prop('TITLE', contact.title, profile));
    if (contact.role) parts.push(prop('ROLE', contact.role, profile));
    if (contact.nickname) parts.push(prop('NICKNAME', contact.nickname, profile));
    if (contact.birthday) parts.push(prop('BDAY', contact.birthday, profile));
    if (contact.anniversary) parts.push(prop('ANNIVERSARY', contact.anniversary, profile));
    if (contact.gender) parts.push(prop('GENDER', contact.gender, profile));

    for (const phone of contact.phones) {
      const typeParam = labelToPhoneType(phone.label);
      parts.push(prop('TEL', phone.value, profile, typeParam ? { TYPE: typeParam } : undefined));
    }

    for (const email of contact.emails) {
      const typeParam = labelToEmailType(email.label);
      parts.push(prop('EMAIL', email.value, profile, typeParam ? { TYPE: typeParam } : undefined));
    }

    for (const url of contact.urls) {
      const typeParam = labelToUrlType(url.label);
      parts.push(prop('URL', url.value, profile, typeParam ? { TYPE: typeParam } : undefined));
    }

    for (const addr of contact.addresses) {
      const typeParam = labelToAddressType(addr.label);
      parts.push(prop('ADR', addressToVCF(addr.value), profile, typeParam ? { TYPE: typeParam } : undefined));
    }

    for (const im of contact.instantMessages) {
      parts.push(prop('IMPP', im.value, profile));
    }

    if (contact.meta.tags.length > 0) {
      parts.push(prop('CATEGORIES', contact.meta.tags.join(','), profile));
    }

    if (contact.meta.notes) parts.push(prop('NOTE', contact.meta.notes, profile));

    parts.push(`END:VCARD${LE}`);
    lines.push(parts.filter(Boolean).join(''));
  }

  return lines.join(LE);
}

function labelToPhoneType(label: string): string | null {
  const map: Record<string, string> = {
    mobile: 'CELL',
    work: 'WORK,VOICE',
    home: 'HOME,VOICE',
    'work-fax': 'WORK,FAX',
    'home-fax': 'HOME,FAX',
    pager: 'PAGER',
    fax: 'FAX',
  };
  return map[label] || null;
}

function labelToEmailType(label: string): string | null {
  if (label === 'work') return 'WORK';
  if (label === 'home') return 'HOME';
  return null;
}

function labelToUrlType(label: string): string | null {
  if (label === 'work') return 'WORK';
  if (label === 'home') return 'HOME';
  return null;
}

function labelToAddressType(label: string): string | null {
  if (label === 'work') return 'WORK';
  if (label === 'home') return 'HOME';
  return null;
}
