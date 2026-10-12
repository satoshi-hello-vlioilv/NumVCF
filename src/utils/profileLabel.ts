import type { VCFFormatProfile } from '../types/vcfFormat';

const SHORT: Record<string, string> = {
  'vcf-standard-21': 'vCard 2.1', 'vcf-standard-30': 'vCard 3.0', 'vcf-standard-40': 'vCard 4.0',
  'vcf-docomo-21': 'docomo', 'vcf-softbank-21': 'SoftBank', 'vcf-au-21': 'au',
  'vcf-google-30': 'Google', 'vcf-apple-30': 'Apple', 'vcf-outlook-30': 'Outlook', 'vcf-android-30': 'Android',
};

export const MANUAL_SOURCE = 'manual';

export function profileShortLabel(id: string | undefined, profiles: VCFFormatProfile[]): string {
  if (!id || id === MANUAL_SOURCE) return '手動登録';
  return SHORT[id] ?? profiles.find(p => p.id === id)?.name ?? id;
}
