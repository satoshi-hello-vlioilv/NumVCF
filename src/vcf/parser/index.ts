import type { Contact, ContactAddress, ContactName } from '../../types/contact';
import type { VCFFormatProfile, ParsedVCard, ImportResult, ImportError } from '../../types/vcfFormat';
import { tokenizeVCF } from './tokenizer';
import { detectFormat, detectEncoding } from './detector';
import { fullwidthToHalfwidth, normalizePhoneNumber } from '../../utils/phone';

function generateId(): string {
  return crypto.randomUUID();
}

function parseNameField(value: string): ContactName {
  const parts = value.split(';');
  const family = parts[0]?.trim() || '';
  const given = parts[1]?.trim() || '';
  const additional = parts[2]?.trim();
  const prefix = parts[3]?.trim();
  const suffix = parts[4]?.trim();
  const formatted = [family, given].filter(Boolean).join(' ') || value;
  return { formatted, family, given, additional, prefix, suffix };
}

function parseAddressField(value: string): ContactAddress {
  const parts = value.split(';');
  return {
    poBox: parts[0]?.trim(),
    extended: parts[1]?.trim(),
    street: parts[2]?.trim(),
    city: parts[3]?.trim(),
    region: parts[4]?.trim(),
    postalCode: parts[5]?.trim(),
    country: parts[6]?.trim(),
    formatted: parts.filter(Boolean).join(', '),
  };
}

function resolvePhoneLabel(params: Record<string, string[]>): { label: string; labelDisplay: string } {
  const types = (params['TYPE'] || []).map(t => t.toUpperCase());
  if (types.includes('CELL') || types.includes('MOBILE')) return { label: 'mobile', labelDisplay: '携帯' };
  if (types.includes('WORK') && types.includes('FAX')) return { label: 'work-fax', labelDisplay: 'FAX(会社)' };
  if (types.includes('HOME') && types.includes('FAX')) return { label: 'home-fax', labelDisplay: 'FAX(自宅)' };
  if (types.includes('WORK')) return { label: 'work', labelDisplay: '会社' };
  if (types.includes('HOME')) return { label: 'home', labelDisplay: '自宅' };
  if (types.includes('PAGER')) return { label: 'pager', labelDisplay: 'ページャー' };
  if (types.includes('FAX')) return { label: 'fax', labelDisplay: 'FAX' };
  return { label: 'other', labelDisplay: 'その他' };
}

function resolveEmailLabel(params: Record<string, string[]>): { label: string; labelDisplay: string } {
  const types = (params['TYPE'] || []).map(t => t.toUpperCase());
  if (types.includes('WORK')) return { label: 'work', labelDisplay: '会社' };
  if (types.includes('HOME')) return { label: 'home', labelDisplay: '自宅' };
  return { label: 'other', labelDisplay: 'その他' };
}

function resolveAddressLabel(params: Record<string, string[]>): { label: string; labelDisplay: string } {
  const types = (params['TYPE'] || []).map(t => t.toUpperCase());
  if (types.includes('WORK')) return { label: 'work', labelDisplay: '会社' };
  if (types.includes('HOME')) return { label: 'home', labelDisplay: '自宅' };
  return { label: 'other', labelDisplay: 'その他' };
}

function resolveUrlLabel(params: Record<string, string[]>): { label: string; labelDisplay: string } {
  const types = (params['TYPE'] || []).map(t => t.toUpperCase());
  if (types.includes('WORK')) return { label: 'work', labelDisplay: '会社' };
  if (types.includes('HOME')) return { label: 'home', labelDisplay: '自宅' };
  return { label: 'other', labelDisplay: 'その他' };
}

function vcardToContact(vcard: ParsedVCard, profileId: string, filename: string): Contact {
  const now = new Date().toISOString();
  const contact: Contact = {
    id: generateId(),
    name: { formatted: '(名前なし)' },
    phones: [],
    emails: [],
    urls: [],
    addresses: [],
    socialProfiles: [],
    instantMessages: [],
    customFields: [],
    meta: {
      createdAt: now,
      updatedAt: now,
      importedAt: now,
      importedFrom: filename,
      formatProfileId: profileId,
      groups: [],
      tags: [],
      isFavorite: false,
      isPinned: false,
    },
  };

  const knownProps = new Set([
    'VERSION', 'BEGIN', 'END', 'FN', 'N', 'ORG', 'TITLE', 'ROLE', 'NICKNAME',
    'TEL', 'EMAIL', 'URL', 'ADR', 'BDAY', 'ANNIVERSARY', 'NOTE', 'UID', 'REV',
    'PHOTO', 'GENDER', 'SOUND', 'CATEGORIES', 'IMPP',
    'X-PHONETIC-LAST-NAME', 'X-PHONETIC-FIRST-NAME',
    'X-KANA', 'PRODID', 'KIND', 'MEMBER',
  ]);

  for (const prop of vcard.properties) {
    switch (prop.name) {
      case 'FN':
        contact.name.formatted = prop.value;
        break;
      case 'N': {
        const parsed = parseNameField(prop.value);
        contact.name = { ...contact.name, ...parsed };
        if (!contact.name.formatted || contact.name.formatted === '(名前なし)') {
          contact.name.formatted = parsed.formatted;
        }
        break;
      }
      case 'ORG': {
        const orgParts = prop.value.split(';');
        contact.organization = orgParts[0]?.trim();
        if (orgParts[1]) contact.department = orgParts[1].trim();
        break;
      }
      case 'TITLE':
        contact.title = prop.value;
        break;
      case 'ROLE':
        contact.role = prop.value;
        break;
      case 'NICKNAME':
        contact.nickname = prop.value;
        break;
      case 'BDAY':
        contact.birthday = prop.value;
        break;
      case 'ANNIVERSARY':
        contact.anniversary = prop.value;
        break;
      case 'NOTE':
        contact.meta.notes = prop.value;
        break;
      case 'UID':
        contact.uid = prop.value;
        break;
      case 'REV':
        contact.rev = prop.value;
        break;
      case 'PHOTO':
        contact.photo = prop.value;
        break;
      case 'GENDER':
        contact.gender = prop.value.charAt(0).toUpperCase() as Contact['gender'];
        break;
      case 'SOUND':
        if (!contact.nameKana) contact.nameKana = { formatted: '' };
        contact.nameKana.formatted = prop.value.replace(/^CHARSET=.*?:/, '');
        break;
      case 'X-PHONETIC-LAST-NAME':
        if (!contact.nameKana) contact.nameKana = { formatted: '' };
        contact.nameKana.family = prop.value;
        if (!contact.nameKana.formatted) {
          contact.nameKana.formatted = [prop.value, contact.nameKana.given].filter(Boolean).join(' ');
        }
        break;
      case 'X-PHONETIC-FIRST-NAME':
        if (!contact.nameKana) contact.nameKana = { formatted: '' };
        contact.nameKana.given = prop.value;
        contact.nameKana.formatted = [contact.nameKana.family, prop.value].filter(Boolean).join(' ');
        break;
      case 'TEL': {
        const { label, labelDisplay } = resolvePhoneLabel(prop.params);
        let phone = prop.value.trim();
        phone = fullwidthToHalfwidth(phone);
        phone = normalizePhoneNumber(phone);
        if (phone) {
          contact.phones.push({ id: generateId(), label, labelDisplay, value: phone });
        }
        break;
      }
      case 'EMAIL': {
        const { label, labelDisplay } = resolveEmailLabel(prop.params);
        if (prop.value.trim()) {
          contact.emails.push({ id: generateId(), label, labelDisplay, value: prop.value.trim() });
        }
        break;
      }
      case 'URL': {
        const { label, labelDisplay } = resolveUrlLabel(prop.params);
        if (prop.value.trim()) {
          contact.urls.push({ id: generateId(), label, labelDisplay, value: prop.value.trim() });
        }
        break;
      }
      case 'ADR': {
        const { label, labelDisplay } = resolveAddressLabel(prop.params);
        const addr = parseAddressField(prop.value);
        contact.addresses.push({ id: generateId(), label, labelDisplay, value: addr });
        break;
      }
      case 'CATEGORIES':
        contact.meta.tags = prop.value.split(',').map(t => t.trim()).filter(Boolean);
        break;
      case 'IMPP':
        if (prop.value.trim()) {
          contact.instantMessages.push({ id: generateId(), label: 'other', value: prop.value.trim() });
        }
        break;
      default:
        if (!knownProps.has(prop.name)) {
          contact.customFields.push({
            id: generateId(),
            key: prop.name,
            label: prop.name,
            value: prop.value,
            dataType: 'text',
            formatProfileId: profileId,
          });
        }
    }
  }

  // Fix nameKana.formatted if parts were set individually
  if (contact.nameKana && !contact.nameKana.formatted) {
    contact.nameKana.formatted = [contact.nameKana.family, contact.nameKana.given].filter(Boolean).join(' ');
  }

  return contact;
}

export interface ParseOptions {
  filename?: string;
  profileOverrideId?: string;
  profiles: VCFFormatProfile[];
}

export interface ParseOutput {
  contacts: Contact[];
  detectedProfileId: string | null;
  result: ImportResult;
}

export async function parseVCFBuffer(buffer: ArrayBuffer, options: ParseOptions): Promise<ParseOutput> {
  const encoding = detectEncoding(buffer);
  let text: string;
  try {
    text = new TextDecoder(encoding).decode(buffer);
  } catch {
    text = new TextDecoder('UTF-8').decode(buffer);
  }
  return parseVCFText(text, options);
}

export function parseVCFText(text: string, options: ParseOptions): ParseOutput {
  const filename = options.filename || 'unknown.vcf';
  const detection = detectFormat(text, options.profiles);
  const profileId = options.profileOverrideId || detection?.profile.id || 'vcf-standard-30';

  const errors: ImportError[] = [];
  const vcards = tokenizeVCF(text);
  const contacts: Contact[] = [];

  for (const vcard of vcards) {
    try {
      const contact = vcardToContact(vcard, profileId, filename);
      contacts.push(contact);
    } catch (e) {
      errors.push({ message: String(e) });
    }
  }

  return {
    contacts,
    detectedProfileId: detection?.profile.id || null,
    result: {
      total: vcards.length,
      imported: contacts.length,
      skipped: 0,
      merged: 0,
      errors,
      contacts: contacts.map(c => c.id),
    },
  };
}
