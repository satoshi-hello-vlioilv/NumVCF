import type { ParsedVCFProperty, ParsedVCard } from '../../types/vcfFormat';
import { decodeQuotedPrintable } from './quirks/quotedPrintable';

function unfoldLines(text: string): string {
  return text.replace(/\r?\n[ \t]/g, '');
}

function parsePropertyLine(line: string): ParsedVCFProperty | null {
  // Handle grouped properties like "item1.TEL"
  const groupMatch = line.match(/^([a-zA-Z0-9-]+)\.(.+)$/);
  let group: string | undefined;
  let rest = line;
  if (groupMatch) {
    group = groupMatch[1];
    rest = groupMatch[2];
  }

  const colonIdx = rest.indexOf(':');
  if (colonIdx === -1) return null;

  const nameAndParams = rest.slice(0, colonIdx);
  let value = rest.slice(colonIdx + 1);

  const parts = nameAndParams.split(';');
  const name = parts[0].toUpperCase().trim();
  const params: Record<string, string[]> = {};

  for (let i = 1; i < parts.length; i++) {
    const eqIdx = parts[i].indexOf('=');
    if (eqIdx === -1) {
      // Bare parameter (vCard 2.1 style like TYPE=VOICE without equals in some cases)
      const key = parts[i].toUpperCase().trim();
      if (!params['TYPE']) params['TYPE'] = [];
      params['TYPE'].push(key);
    } else {
      const key = parts[i].slice(0, eqIdx).toUpperCase().trim();
      const vals = parts[i].slice(eqIdx + 1).split(',').map(v => v.trim());
      params[key] = vals;
    }
  }

  // Handle Quoted-Printable decoding
  const encoding = params['ENCODING']?.[0]?.toUpperCase();
  const charset = params['CHARSET']?.[0] || 'UTF-8';

  if (encoding === 'QUOTED-PRINTABLE') {
    value = decodeQuotedPrintable(value, charset);
  } else if (encoding === 'BASE64' || encoding === 'B') {
    // Keep as-is for binary fields
  }

  return { name, params, value, group };
}

export function tokenizeVCF(text: string): ParsedVCard[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const unfolded = unfoldLines(normalized);
  const lines = unfolded.split('\n');

  const vcards: ParsedVCard[] = [];
  let current: ParsedVCFProperty[] | null = null;
  let rawLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.toUpperCase() === 'BEGIN:VCARD') {
      current = [];
      rawLines = [line];
    } else if (trimmed.toUpperCase() === 'END:VCARD') {
      if (current !== null) {
        rawLines.push(line);
        vcards.push({ properties: current, rawText: rawLines.join('\n') });
        current = null;
        rawLines = [];
      }
    } else if (current !== null) {
      rawLines.push(line);
      const prop = parsePropertyLine(trimmed);
      if (prop) current.push(prop);
    }
  }

  return vcards;
}
