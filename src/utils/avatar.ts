const AVATAR_COLORS = [
  { bg: '#dce8f2', text: '#2f4f63' }, // Primary pastel blue
  { bg: '#d5ecec', text: '#2c4e4a' }, // Teal
  { bg: '#deeae4', text: '#33584b' }, // Sage
  { bg: '#e8e4f2', text: '#4a3d6b' }, // Lavender slate
  { bg: '#f2e8d5', text: '#6b4c2a' }, // Warm terracotta
  { bg: '#e8f2e8', text: '#2d5c2d' }, // Mint
  { bg: '#f2dce0', text: '#6b2f3a' }, // Rose (subtle)
  { bg: '#dce8e8', text: '#2f5a5a' }, // Slate teal
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getAvatarColor(name: string): { bg: string; text: string } {
  const idx = hashString(name) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function getInitials(name: string, family?: string, given?: string): string {
  if (family && given) {
    // Japanese: use first chars of family and given
    if (/[぀-ヿ一-鿿]/.test(family)) {
      return family.charAt(0);
    }
    return `${family.charAt(0)}${given.charAt(0)}`.toUpperCase();
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return name.charAt(0).toUpperCase() || '?';
}
