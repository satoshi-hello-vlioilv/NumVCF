// Light: pastel fill with dark text. Dark: a translucent tint of the same hue
// with light text, so chips neither glare nor sink into the dark surface.
const TAG_STYLES = [
  'bg-primary-100 text-primary-700 dark:bg-primary-400/20 dark:text-primary-200',
  'bg-teal-400/15 text-teal-600 dark:bg-teal-400/20 dark:text-[#acd9ce]',
  'bg-sage-400/20 text-sage-600 dark:bg-sage-400/20 dark:text-[#c3dccf]',
  'bg-[#ece6f3] text-[#5b4a78] dark:bg-[#8a75ad]/25 dark:text-[#d9cfea]',
  'bg-[#f3e9dc] text-[#7a5530] dark:bg-[#b0855a]/25 dark:text-[#ecd6bb]',
  'bg-[#e3eef0] text-[#2f5a62] dark:bg-[#5f9aa5]/25 dark:text-[#c2e0e5]',
];

export function tagStyle(tag: string) {
  let h = 0;
  for (const ch of tag) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TAG_STYLES[h % TAG_STYLES.length];
}
