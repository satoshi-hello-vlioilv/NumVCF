export function relativeDate(iso?: string, now = Date.now()): string {
  if (!iso) return '';
  const days = Math.floor((now - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return '今日';
  if (days < 7) return `${days}日前`;
  if (days < 31) return `${Math.floor(days / 7)}週間前`;
  return new Date(iso).toLocaleDateString('ja-JP');
}

export function isWithinDays(iso: string | undefined, days: number, now = Date.now()): boolean {
  return !!iso && now - new Date(iso).getTime() < days * 86_400_000;
}
