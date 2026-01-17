import { SQLParser } from './core/parser';
import { QueryExecutor } from './core/executor';
import { QueryResult } from '../types';
import { StorageEngine } from './core/storage';

export class PesaDB {
  private static autoIncrementCounters: { [tableName: string]: number } = {};

  static async queryAsync(sql: string): Promise<QueryResult> {
    console.log(`%c[PesaDB Engine] Executing: ${sql}`, "color: #3b82f6; font-weight: bold");
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    return this.query(sql);
  }

  static query(sql: string): QueryResult {
    try {
      const parsed = SQLParser.parse(sql);
      
      // ===== AUTO-INCREMENT LOGIC START =====
      if (parsed.type === 'INSERT' && parsed.tableName) {
        const tableData = StorageEngine.loadTable(parsed.tableName);
        if (tableData) {
          const pkColumn = tableData.schema.columns.find((c: any) => c.primaryKey);
          
          if (pkColumn && parsed.values) {
            const columnIndex = parsed.columns?.indexOf(pkColumn.name);
            
            // If ID column not provided, auto-generate it
            if (columnIndex === -1 || columnIndex === undefined) {
              const nextId = this.getNextId(parsed.tableName, tableData);
              
              if (!parsed.columns) {
                parsed.columns = tableData.schema.columns.map((c: any) => c.name);
              }
              
              const pkIndex = parsed.columns.indexOf(pkColumn.name);
              if (pkIndex === -1) {
                parsed.columns.unshift(pkColumn.name);
                parsed.values.unshift(nextId);
              } else {
                parsed.values[pkIndex] = nextId;
              }
            }
          }
        }
      }
      // ===== AUTO-INCREMENT LOGIC END =====
      
      const result = QueryExecutor.execute(parsed);
      console.log(`%c[PesaDB Engine] Success: ${result.message}`, "color: #10b981");
      return result;
    } catch (err: any) {
      console.error(`[PesaDB Engine] SQL Error: ${err.message}`);
      return { success: false, message: `SQL Error: ${err.message}` };
    }
  }

  private static getNextId(tableName: string, tableData: any): number {
    let maxId = 0;
    
    const pkColumn = tableData.schema.columns.find((c: any) => c.primaryKey);
    if (pkColumn && tableData.records.length > 0) {
      maxId = Math.max(...tableData.records.map((r: any) => r[pkColumn.name] || 0));
    }
    
    const counterValue = this.autoIncrementCounters[tableName] || 0;
    const nextId = Math.max(maxId, counterValue) + 1;
    this.autoIncrementCounters[tableName] = nextId;
    
    return nextId;
  }

  static initializeDemo() {
    const catalog = StorageEngine.getCatalog();
    if (catalog.length === 0) {
      console.log("%c[PesaDB Engine] Initializing Fresh Demo State...", "color: #f59e0b");
      this.query("CREATE TABLE users (id INTEGER PRIMARY KEY, name STRING, email STRING UNIQUE)");
      this.query("CREATE TABLE transactions (id INTEGER PRIMARY KEY, user_id INTEGER, amount DECIMAL, type STRING)");
      
      // Notice: No IDs provided - they will be auto-generated
      this.query("INSERT INTO users (name, email) VALUES ('Alice Maina', 'alice@pesapal.com')");
      this.query("INSERT INTO users (name, email) VALUES ('John Doe', 'john@pesapal.com')");
      
      this.query("INSERT INTO transactions (user_id, amount, type) VALUES (1, 2500.50, 'DEPOSIT')");
      this.query("INSERT INTO transactions (user_id, amount, type) VALUES (1, 50.00, 'PAYMENT')");
      this.query("INSERT INTO transactions (user_id, amount, type) VALUES (2, 1000.00, 'DEPOSIT')");
    }
  }
}