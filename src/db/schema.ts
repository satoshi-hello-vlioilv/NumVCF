import Dexie, { type Table } from 'dexie';
import type { Contact } from '../types/contact';
import type { VCFFormatProfile } from '../types/vcfFormat';

export interface GroupRecord {
  id: string;
  name: string;
  color?: string;
  isSmartGroup: boolean;
  smartGroupConditions?: SmartGroupCondition[];
  createdAt: string;
  updatedAt: string;
}

export interface SmartGroupCondition {
  field: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'isEmpty' | 'isNotEmpty';
  value?: string;
}

export interface ImportLogRecord {
  id: string;
  filename: string;
  formatProfileId: string;
  importedAt: string;
  total: number;
  imported: number;
  skipped: number;
  merged: number;
  errors: string[];
}

export class NumVCFDatabase extends Dexie {
  contacts!: Table<Contact, string>;
  formatProfiles!: Table<VCFFormatProfile, string>;
  groups!: Table<GroupRecord, string>;
  importLogs!: Table<ImportLogRecord, string>;

  constructor() {
    super('NumVCF');

    this.version(1).stores({
      contacts: 'id, uid, [name.formatted], [name.family], organization, &uid, *meta.groups, *meta.tags, meta.isFavorite, meta.isPinned, meta.createdAt, meta.updatedAt',
      formatProfiles: 'id, version, isBuiltin, enabled',
      groups: 'id, name, isSmartGroup',
      importLogs: 'id, importedAt, formatProfileId',
    });
  }
}

export const db = new NumVCFDatabase();
