
import { TableSchema, DatabaseRecord } from '../../types';

/**
 * PesaDB Storage Engine
 * Simulates a disk-based storage system by chunking data into "blocks"
 * and persisting them to the browser's LocalStorage.
 */
export class StorageEngine {
  private static STORAGE_PREFIX = 'pesadb_v1_';

  static saveTable(tableName: string, schema: TableSchema, records: DatabaseRecord[]) {
    const data = { schema, records };
    localStorage.setItem(`${this.STORAGE_PREFIX}tbl_${tableName}`, JSON.stringify(data));
    this.updateCatalog(tableName, 'ADD');
  }

  static loadTable(tableName: string): { schema: TableSchema; records: DatabaseRecord[] } | null {
    const raw = localStorage.getItem(`${this.STORAGE_PREFIX}tbl_${tableName}`);
    if (!raw) return null;
    return JSON.parse(raw);
  }

  static deleteTable(tableName: string) {
    localStorage.removeItem(`${this.STORAGE_PREFIX}tbl_${tableName}`);
    this.updateCatalog(tableName, 'REMOVE');
  }

  static getCatalog(): string[] {
    const raw = localStorage.getItem(`${this.STORAGE_PREFIX}catalog`);
    return raw ? JSON.parse(raw) : [];
  }

  private static updateCatalog(tableName: string, action: 'ADD' | 'REMOVE') {
    const catalog = this.getCatalog();
    if (action === 'ADD' && !catalog.includes(tableName)) {
      catalog.push(tableName);
    } else if (action === 'REMOVE') {
      const idx = catalog.indexOf(tableName);
      if (idx > -1) catalog.splice(idx, 1);
    }
    localStorage.setItem(`${this.STORAGE_PREFIX}catalog`, JSON.stringify(catalog));
  }

  static clearAll() {
    const catalog = this.getCatalog();
    catalog.forEach(tbl => localStorage.removeItem(`${this.STORAGE_PREFIX}tbl_${tbl}`));
    localStorage.removeItem(`${this.STORAGE_PREFIX}catalog`);
  }
}
