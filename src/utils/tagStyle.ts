const TAG_STYLES = [
  'bg-primary-100 text-primary-700',
  'bg-teal-400/15 text-teal-600',
  'bg-sage-400/20 text-sage-600',
  'bg-[#ece6f3] text-[#5b4a78]',
  'bg-[#f3e9dc] text-[#7a5530]',
  'bg-[#e3eef0] text-[#2f5a62]',
];

export function tagStyle(tag: string) {
  let h = 0;
  for (const ch of tag) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TAG_STYLES[h % TAG_STYLES.length];
}
