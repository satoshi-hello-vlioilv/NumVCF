import type { Contact } from '../../types/contact';
import type { VCFFormatProfile } from '../../types/vcfFormat';
import { escapeText } from '../escape';
import { encodeQuotedPrintable } from '../parser/quirks/quotedPrintable';

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

// vCard 2.1 has no "\n" escape: multi-line text must be sent as
// Quoted-Printable. 3.0/4.0 use backslash escaping instead.
function escapeComponent(value: string, profile: VCFFormatProfile): string {
  return profile.version === '2.1' ? value.replace(/;/g, '\\;') : escapeText(value);
}

function textProp(name: string, value: string | undefined, profile: VCFFormatProfile, params?: Record<string, string>): string {
  if (!value?.trim()) return '';
  if (profile.version === '2.1' && /[\r\n]/.test(value)) {
    const paramStr = Object.entries({ ...params, ENCODING: 'QUOTED-PRINTABLE', CHARSET: 'UTF-8' }).map(([k, v]) => `;${k}=${v}`).join('');
    const lineEnding = profile.exportTemplate.lineEnding === 'CRLF' ? '\r\n' : '\n';
    return `${name}${paramStr}:${encodeQuotedPrintable(value.replace(/\r?\n/g, '\r\n'))}${lineEnding}`;
  }
  return prop(name, escapeComponent(value, profile), profile, params);
}

function structured(values: (string | undefined)[], profile: VCFFormatProfile, separator = ';'): string {
  return values.map(v => escapeComponent(v ?? '', profile)).join(separator);
}

function addressToVCF(addr: NonNullable<Contact['addresses'][0]>['value'], profile: VCFFormatProfile): string {
  return structured([addr.poBox, addr.extended, addr.street, addr.city, addr.region, addr.postalCode, addr.country], profile);
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
    parts.push(textProp('FN', n.formatted, profile));
    parts.push(prop('N', structured([n.family, n.given, n.additional, n.prefix, n.suffix], profile), profile));

    if (contact.nameKana?.formatted) {
      if (profile.version === '2.1') {
        parts.push(textProp('SOUND', contact.nameKana.formatted, profile));
      } else {
        parts.push(textProp('X-PHONETIC-LAST-NAME', contact.nameKana.family, profile));
        parts.push(textProp('X-PHONETIC-FIRST-NAME', contact.nameKana.given, profile));
      }
    }

    if (contact.organization) {
      parts.push(prop('ORG', structured(contact.department ? [contact.organization, contact.department] : [contact.organization], profile), profile));
    }
    if (contact.title) parts.push(textProp('TITLE', contact.title, profile));
    if (contact.role) parts.push(textProp('ROLE', contact.role, profile));
    if (contact.nickname) parts.push(textProp('NICKNAME', contact.nickname, profile));
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
      parts.push(prop('ADR', addressToVCF(addr.value, profile), profile, typeParam ? { TYPE: typeParam } : undefined));
    }

    for (const im of contact.instantMessages) {
      parts.push(prop('IMPP', im.value, profile));
    }

    if (contact.meta.tags.length > 0) {
      parts.push(prop('CATEGORIES', structured(contact.meta.tags, profile, ','), profile));
    }

    if (contact.meta.notes) parts.push(textProp('NOTE', contact.meta.notes, profile));

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
