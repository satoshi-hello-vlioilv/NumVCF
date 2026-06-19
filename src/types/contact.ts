export type VCFVersion = '2.1' | '3.0' | '4.0';
export type Encoding = 'UTF-8' | 'Shift_JIS' | 'ISO-8859-1';
export type FieldDataType = 'text' | 'phone' | 'email' | 'url' | 'address' | 'date' | 'binary' | 'integer' | 'boolean';

export interface ContactName {
  formatted: string;
  family?: string;
  given?: string;
  additional?: string;
  prefix?: string;
  suffix?: string;
}

export interface LabeledValue<T> {
  id: string;
  label: string;
  labelDisplay?: string;
  value: T;
  isPrimary?: boolean;
}

export interface ContactAddress {
  poBox?: string;
  extended?: string;
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  formatted?: string;
}

export interface SocialProfile {
  service: string;
  username?: string;
  url?: string;
}

export interface CustomField {
  id: string;
  key: string;
  label: string;
  value: string;
  dataType: FieldDataType;
  formatProfileId?: string;
}

export interface ContactMeta {
  createdAt: string;
  updatedAt: string;
  importedAt?: string;
  importedFrom?: string;
  formatProfileId?: string;
  sourceVersion?: VCFVersion;
  groups: string[];
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  lastContacted?: string;
  notes?: string;
}

export interface Contact {
  id: string;
  uid?: string;
  rev?: string;

  name: ContactName;
  nameKana?: ContactName;
  nameRoman?: ContactName;
  nickname?: string;

  phones: LabeledValue<string>[];
  emails: LabeledValue<string>[];
  urls: LabeledValue<string>[];
  addresses: LabeledValue<ContactAddress>[];
  socialProfiles: LabeledValue<SocialProfile>[];
  instantMessages: LabeledValue<string>[];

  organization?: string;
  department?: string;
  title?: string;
  role?: string;

  birthday?: string;
  anniversary?: string;
  photo?: string;
  gender?: 'M' | 'F' | 'O' | 'N' | 'U';

  customFields: CustomField[];
  meta: ContactMeta;
}

export type DisplayDensity = 'compact' | 'comfortable' | 'spacious';
export type SortField = 'name' | 'nameKana' | 'organization' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';
