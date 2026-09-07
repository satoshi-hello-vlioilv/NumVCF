import { describe, it, expect } from 'vitest';
import { detectEncoding } from './detector';

function toBuffer(bytes: number[]): ArrayBuffer {
  return new Uint8Array(bytes).buffer;
}

describe('detectEncoding', () => {
  it('detects UTF-8 BOM', () => {
    const buf = toBuffer([0xEF, 0xBB, 0xBF, 0x42, 0x45, 0x47, 0x49, 0x4E]);
    expect(detectEncoding(buf)).toBe('UTF-8');
  });

  it('honors an explicit CHARSET=SHIFT_JIS declaration in the file', () => {
    const text = 'BEGIN:VCARD\nFN;CHARSET=SHIFT_JIS;ENCODING=QUOTED-PRINTABLE:test\nEND:VCARD';
    const buf = new TextEncoder().encode(text).buffer;
    expect(detectEncoding(buf)).toBe('Shift_JIS');
  });

  it('trusts strict UTF-8 validation for plain ASCII/UTF-8 content', () => {
    const text = 'BEGIN:VCARD\nVERSION:3.0\nFN:山田太郎\nEND:VCARD';
    const buf = new TextEncoder().encode(text).buffer;
    expect(detectEncoding(buf)).toBe('UTF-8');
  });

  it('falls back to Shift_JIS heuristic for raw Shift_JIS bytes without a CHARSET declaration', () => {
    // "山田" in Shift_JIS: 0x8E 0xB4 0x93 0x44 (approx multi-byte lead/trail ranges)
    const buf = toBuffer([0x42, 0x45, 0x47, 0x49, 0x4E, 0x8E, 0xB4, 0x93, 0x44, 0x8E, 0xB4, 0x93, 0x44]);
    expect(detectEncoding(buf)).toBe('Shift_JIS');
  });
});
