export function decodeQuotedPrintable(input: string, charset = 'UTF-8'): string {
  // Handle soft line breaks (=\r\n or =\n)
  const joined = input.replace(/=\r?\n/g, '');
  // Decode =XX hex sequences
  const bytes: number[] = [];
  let i = 0;
  while (i < joined.length) {
    if (joined[i] === '=' && i + 2 < joined.length) {
      const hex = joined.slice(i + 1, i + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        bytes.push(parseInt(hex, 16));
        i += 3;
        continue;
      }
    }
    bytes.push(joined.charCodeAt(i));
    i++;
  }
  const uint8 = new Uint8Array(bytes);
  try {
    return new TextDecoder(charset).decode(uint8);
  } catch {
    return new TextDecoder('UTF-8').decode(uint8);
  }
}

export function encodeQuotedPrintable(input: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  let result = '';
  let lineLen = 0;
  for (const byte of bytes) {
    const char = String.fromCharCode(byte);
    if (byte === 0x09 || byte === 0x20 || (byte >= 0x21 && byte <= 0x7e && byte !== 0x3d)) {
      if (lineLen + 1 > 75) {
        result += '=\r\n';
        lineLen = 0;
      }
      result += char;
      lineLen++;
    } else {
      const encoded = `=${byte.toString(16).toUpperCase().padStart(2, '0')}`;
      if (lineLen + encoded.length > 75) {
        result += '=\r\n';
        lineLen = 0;
      }
      result += encoded;
      lineLen += encoded.length;
    }
  }
  return result;
}
