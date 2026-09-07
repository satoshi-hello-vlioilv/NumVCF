import type { VCFFormatProfile } from '../../types/vcfFormat';

export interface DetectionResult {
  profile: VCFFormatProfile;
  score: number;
  matchedPatterns: string[];
}

export function detectFormat(text: string, profiles: VCFFormatProfile[]): DetectionResult | null {
  const enabled = profiles.filter(p => p.enabled);
  if (enabled.length === 0) return null;

  const results: DetectionResult[] = [];

  for (const profile of enabled) {
    let totalScore = 0;
    const matched: string[] = [];

    for (const { pattern, score, description } of profile.autoDetectPatterns) {
      try {
        if (new RegExp(pattern, 'im').test(text)) {
          totalScore += score;
          matched.push(description);
        }
      } catch {
        // Invalid regex in profile - skip
      }
    }

    if (totalScore > 0) {
      results.push({ profile, score: totalScore, matchedPatterns: matched });
    }
  }

  if (results.length === 0) return null;

  results.sort((a, b) => b.score - a.score);
  return results[0];
}

const CHARSET_ALIASES: Record<string, string> = {
  'SHIFT_JIS': 'Shift_JIS', 'SHIFT-JIS': 'Shift_JIS', 'SJIS': 'Shift_JIS', 'MS932': 'Shift_JIS',
  'UTF-8': 'UTF-8', 'UTF8': 'UTF-8',
  'ISO-8859-1': 'ISO-8859-1', 'LATIN1': 'ISO-8859-1', 'WINDOWS-1252': 'windows-1252', 'CP1252': 'windows-1252',
  'EUC-JP': 'EUC-JP',
};

// vCard property names/params are always pure ASCII, so a byte-level scan
// for a CHARSET= parameter works before any full-buffer decode is chosen —
// this is the most reliable signal when the file declares its own charset
// (common in older Docomo/au/SoftBank exports).
function scanDeclaredCharset(bytes: Uint8Array): string | null {
  const ascii = String.fromCharCode(...bytes.subarray(0, Math.min(bytes.length, 4000)));
  const match = ascii.match(/CHARSET=([A-Za-z0-9_-]+)/i);
  if (!match) return null;
  return CHARSET_ALIASES[match[1].toUpperCase()] || null;
}

export function detectEncoding(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  // BOM check
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) return 'UTF-8';
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) return 'UTF-16LE';
  if (bytes[0] === 0xFE && bytes[1] === 0xFF) return 'UTF-16BE';

  // Explicit CHARSET= declaration inside the file wins over any heuristic.
  const declared = scanDeclaredCharset(bytes);
  if (declared) return declared;

  // A strict (fatal) UTF-8 decode is a strong positive signal: real UTF-8
  // byte sequences are self-validating, so if this succeeds we trust it
  // over the Shift_JIS heuristic below (which can false-positive on some
  // multi-byte UTF-8 sequences).
  try {
    new TextDecoder('UTF-8', { fatal: true }).decode(buffer);
    return 'UTF-8';
  } catch {
    // Not valid UTF-8 - fall through to other heuristics.
  }

  // Heuristic: check for Shift_JIS lead/trail byte patterns
  let shiftJisScore = 0;
  for (let i = 0; i < Math.min(bytes.length - 1, 2000); i++) {
    const b = bytes[i];
    if ((b >= 0x81 && b <= 0x9F) || (b >= 0xE0 && b <= 0xFC)) {
      const next = bytes[i + 1];
      if ((next >= 0x40 && next <= 0x7E) || (next >= 0x80 && next <= 0xFC)) {
        shiftJisScore++;
        i++;
      }
    }
  }
  if (shiftJisScore > 3) return 'Shift_JIS';

  // Last resort: the buffer failed strict UTF-8 validation and didn't look
  // like Shift_JIS, so treat it as a single-byte Latin-1 style charset
  // rather than silently mangling it through a lenient UTF-8 decode.
  return 'ISO-8859-1';
}

export function decodeBuffer(buffer: ArrayBuffer, encoding: string): string {
  try {
    return new TextDecoder(encoding).decode(buffer);
  } catch {
    return new TextDecoder('UTF-8').decode(buffer);
  }
}
