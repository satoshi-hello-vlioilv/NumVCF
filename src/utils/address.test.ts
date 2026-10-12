import { describe, it, expect } from 'vitest';
import { formatAddress } from './address';

describe('formatAddress (#10)', () => {
  it('writes Japanese addresses from prefecture down, without separators or country', () => {
    expect(formatAddress({ street: '本町9-24-4', city: '渋谷区', region: '東京都', postalCode: '150-0080', country: '日本' }))
      .toBe('〒150-0080 東京都渋谷区本町9-24-4');
  });

  it('treats an address without a country as Japanese when it is written in Japanese', () => {
    expect(formatAddress({ street: 'みなとみらい3-3-1', city: '横浜市西区', region: '神奈川県', postalCode: '2200012', extended: 'ランドマークタワー10F' }))
      .toBe('〒220-0012 神奈川県横浜市西区みなとみらい3-3-1 ランドマークタワー10F');
  });

  it('keeps the Western order for foreign addresses', () => {
    expect(formatAddress({ street: '1 Main St', city: 'Springfield', region: 'IL', postalCode: '62701', country: 'USA' }))
      .toBe('1 Main St, Springfield, IL 62701, USA');
  });

  it('prefers the components over a stale comma-joined text', () => {
    expect(formatAddress({ street: '本町9-24-4', city: '渋谷区', region: '東京都', postalCode: '150-0080', country: '日本', formatted: '9-24-4 本町, 渋谷区, 東京都, 150-0080, 日本' }))
      .toBe('〒150-0080 東京都渋谷区本町9-24-4');
  });

  it('falls back to the formatted text when there are no components', () => {
    expect(formatAddress({ formatted: '東京都千代田区丸の内1-1-1' })).toBe('東京都千代田区丸の内1-1-1');
  });
});
