// vCard 3.0/4.0 text escaping (RFC 2426 §5, RFC 6350 §3.4):
// "\n" / "\N" is a newline, and "\\", "\,", "\;" are the literal characters.
export function unescapeText(value: string): string {
  return value.replace(/\\([nN,;\\])/g, (_, c: string) => (c === 'n' || c === 'N' ? '\n' : c));
}

export function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

// Splits a structured value (N, ADR, ORG, CATEGORIES...) on separators that
// are not escaped, then unescapes each component.
export function splitStructured(value: string, separator: ';' | ','): string[] {
  const parts: string[] = [];
  let current = '';
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === '\\' && i + 1 < value.length) {
      current += ch + value[i + 1];
      i++;
    } else if (ch === separator) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.map(unescapeText);
}
