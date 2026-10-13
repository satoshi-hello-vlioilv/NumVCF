import type { ContactAddress } from '../types/contact';

const JP_COUNTRY = /^(日本|日本国|japan|jp|jpn)$/i;
const JP_TEXT = /[぀-ヿ㐀-鿿]/;

export function isJapaneseAddress(a: ContactAddress): boolean {
  const country = a.country?.trim();
  if (country) return JP_COUNTRY.test(country);
  return [a.region, a.city, a.street, a.extended].some(v => !!v && JP_TEXT.test(v));
}

// Japanese addresses read from large to small with no separators
// ("〒150-0080 東京都渋谷区本町9-24-4"); others keep the Western order
// ("1 Main St, Springfield, IL 62701, USA"). The components always win over a
// stored `formatted` text so an edited address never shows stale text.
export function formatAddress(a: ContactAddress): string {
  const t = (v?: string) => v?.trim() || '';
  const hasParts = [a.poBox, a.extended, a.street, a.city, a.region, a.postalCode, a.country].some(v => t(v));
  if (!hasParts) return t(a.formatted);

  if (isJapaneseAddress(a)) {
    const zip = t(a.postalCode).replace(/^(\d{3})(\d{4})$/, '$1-$2');
    return [
      zip && `〒${zip}`,
      t(a.region) + t(a.city) + t(a.street),
      t(a.extended),
      t(a.poBox) && `私書箱 ${t(a.poBox)}`,
    ].filter(Boolean).join(' ');
  }
  const regionLine = [t(a.region), t(a.postalCode)].filter(Boolean).join(' ');
  return [
    t(a.poBox) && `PO Box ${t(a.poBox)}`,
    t(a.street),
    t(a.extended),
    t(a.city),
    regionLine,
    t(a.country),
  ].filter(Boolean).join(', ');
}
