
import { SQLParser } from './core/parser';
import { QueryExecutor } from './core/executor';
import { QueryResult } from '../types';
import { StorageEngine } from './core/storage';

export class PesaDB {
  /**
   * Main query entry point.
   * We use a small delay to simulate backend processing time,
   * making the UI feel more realistic during demos.
   */
  static async queryAsync(sql: string): Promise<QueryResult> {
    console.log(`%c[PesaDB Engine] Executing: ${sql}`, "color: #3b82f6; font-weight: bold");
    
    // Simulate "Network/Disk" latency (50-150ms)
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    
    return this.query(sql);
  }

  static query(sql: string): QueryResult {
    try {
      const parsed = SQLParser.parse(sql);
      const result = QueryExecutor.execute(parsed);
      console.log(`%c[PesaDB Engine] Success: ${result.message}`, "color: #10b981");
      return result;
    } catch (err: any) {
      console.error(`[PesaDB Engine] SQL Error: ${err.message}`);
      return { success: false, message: `SQL Error: ${err.message}` };
    }
  }

  static initializeDemo() {
    const catalog = StorageEngine.getCatalog();
    if (catalog.length === 0) {
      console.log("%c[PesaDB Engine] Initializing Fresh Demo State...", "color: #f59e0b");
      this.query("CREATE TABLE users (id INTEGER PRIMARY KEY, name STRING, email STRING UNIQUE)");
      this.query("CREATE TABLE transactions (id INTEGER PRIMARY KEY, user_id INTEGER, amount DECIMAL, type STRING)");
      
      this.query("INSERT INTO users (id, name, email) VALUES (1, 'Alice Maina', 'alice@pesapal.com')");
      this.query("INSERT INTO users (id, name, email) VALUES (2, 'John Doe', 'john@pesapal.com')");
      
      this.query("INSERT INTO transactions (id, user_id, amount, type) VALUES (101, 1, 2500.50, 'DEPOSIT')");
      this.query("INSERT INTO transactions (id, user_id, amount, type) VALUES (102, 1, 50.00, 'PAYMENT')");
      this.query("INSERT INTO transactions (id, user_id, amount, type) VALUES (103, 2, 1000.00, 'DEPOSIT')");
    }
  }
}
