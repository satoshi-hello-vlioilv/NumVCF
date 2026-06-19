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

export function detectEncoding(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  // BOM check
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) return 'UTF-8';
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) return 'UTF-16LE';
  if (bytes[0] === 0xFE && bytes[1] === 0xFF) return 'UTF-16BE';

  // Heuristic: check for Shift_JIS patterns
  let shiftJisScore = 0;
  for (let i = 0; i < Math.min(bytes.length - 1, 1000); i++) {
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

  return 'UTF-8';
}

export function decodeBuffer(buffer: ArrayBuffer, encoding: string): string {
  try {
    return new TextDecoder(encoding).decode(buffer);
  } catch {
    return new TextDecoder('UTF-8').decode(buffer);
  }
}
