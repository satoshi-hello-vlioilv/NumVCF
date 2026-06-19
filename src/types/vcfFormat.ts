import type { VCFVersion, Encoding, FieldDataType } from './contact';

export type TransformRule =
  | 'none'
  | 'quoted-printable'
  | 'base64'
  | 'phone-normalize-jp'
  | 'fullwidth-to-halfwidth'
  | 'date-normalize';

export type VCFQuirk =
  | 'quoted-printable-names'
  | 'fullwidth-phone-numbers'
  | 'semicolon-in-fullname'
  | 'base64-photo-no-header'
  | 'x-irmc-luid'
  | 'sound-kana'
  | 'multiple-vcards-in-file'
  | 'windows-line-endings'
  | 'no-uid'
  | 'charset-in-property'
  | 'encoding-in-property';

export interface VCFFieldMapping {
  id: string;
  vcfProperty: string;
  vcfParams?: Record<string, string[]>;
  internalField: string;
  label: string;
  labelEn: string;
  dataType: FieldDataType;
  transform?: TransformRule;
  priority: number;
  group?: string;
  isMultiValue: boolean;
  isCustom?: boolean;
}

export interface VCFExportTemplate {
  headerComment?: string;
  lineEnding: 'LF' | 'CRLF';
  foldingLength: number;
  requiredFields: string[];
  encoding: Encoding;
  includePhoto: boolean;
}

export interface VCFAutoDetectPattern {
  pattern: string;
  score: number;
  description: string;
}

export interface VCFFormatProfile {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  version: VCFVersion;
  defaultEncoding: Encoding;
  autoDetectPatterns: VCFAutoDetectPattern[];
  fieldMappings: VCFFieldMapping[];
  quirks: VCFQuirk[];
  exportTemplate: VCFExportTemplate;
  isBuiltin: boolean;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParsedVCFProperty {
  name: string;
  params: Record<string, string[]>;
  value: string;
  group?: string;
}

export interface ParsedVCard {
  properties: ParsedVCFProperty[];
  rawText: string;
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  merged: number;
  errors: ImportError[];
  contacts: string[];
}

export interface ImportError {
  line?: number;
  property?: string;
  message: string;
}

export type MergeStrategy = 'overwrite' | 'merge' | 'skip' | 'ask';
