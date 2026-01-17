
import { QueryType, ParsedQuery, DataType } from '../../types';

/**
 * PesaDB SQL Parser
 * A lightweight parser that supports a subset of SQL.
 */
export class SQLParser {
  static parse(sql: string): ParsedQuery {
    sql = sql.trim().replace(/;$/, '');
    const upperSql = sql.toUpperCase();

    if (upperSql.startsWith('SELECT')) return this.parseSelect(sql);
    if (upperSql.startsWith('INSERT INTO')) return this.parseInsert(sql);
    if (upperSql.startsWith('CREATE TABLE')) return this.parseCreate(sql);
    if (upperSql.startsWith('UPDATE')) return this.parseUpdate(sql);
    if (upperSql.startsWith('DELETE FROM')) return this.parseDelete(sql);
    if (upperSql.startsWith('DROP TABLE')) return this.parseDrop(sql);
    if (upperSql.startsWith('SHOW TABLES')) return { type: QueryType.SHOW_TABLES, tableName: '' };
    if (upperSql.startsWith('DESCRIBE')) return this.parseDescribe(sql);

    throw new Error(`Unsupported query: ${sql.substring(0, 20)}...`);
  }

  private static parseSelect(sql: string): ParsedQuery {
    const selectRegex = /SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+JOIN\s+([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+))?(?:\s+WHERE\s+(.+?))?(?:\s+ORDER BY\s+([a-zA-Z0-9_]+)\s*(ASC|DESC)?)?$/i;
    const match = sql.match(selectRegex);

    if (!match) throw new Error('Invalid SELECT syntax');

    const [_, cols, table, joinTable, joinLeft, joinRight, whereStr, orderCol, orderDir] = match;

    const query: ParsedQuery = {
      type: QueryType.SELECT,
      tableName: table,
      columns: cols === '*' ? undefined : cols.split(',').map(c => c.trim()),
    };

    if (joinTable) {
      query.joins = [{
        type: 'INNER',
        table: joinTable,
        on: { left: joinLeft, right: joinRight }
      }];
    }

    if (whereStr) {
      // Basic support for "col = val" or "col > val"
      const whereMatch = whereStr.match(/([a-zA-Z0-9_.]+)\s*(=|>|<|!=)\s*(.+)/i);
      if (whereMatch) {
        query.where = {
          column: whereMatch[1],
          operator: whereMatch[2],
          value: this.cleanValue(whereMatch[3])
        };
      }
    }

    if (orderCol) {
      query.orderBy = {
        column: orderCol,
        direction: (orderDir?.toUpperCase() as 'ASC' | 'DESC') || 'ASC'
      };
    }

    return query;
  }

  private static parseInsert(sql: string): ParsedQuery {
    const insertRegex = /INSERT INTO\s+([a-zA-Z0-9_]+)\s*\((.+?)\)\s*VALUES\s*\((.+?)\)/i;
    const match = sql.match(insertRegex);
    if (!match) throw new Error('Invalid INSERT syntax');

    return {
      type: QueryType.INSERT,
      tableName: match[1],
      columns: match[2].split(',').map(c => c.trim()),
      values: match[3].split(',').map(v => this.cleanValue(v.trim()))
    };
  }

  private static parseCreate(sql: string): ParsedQuery {
    const createRegex = /CREATE TABLE\s+([a-zA-Z0-9_]+)\s*\((.+?)\)/i;
    const match = sql.match(createRegex);
    if (!match) throw new Error('Invalid CREATE TABLE syntax');

    const colStrings = match[2].split(',').map(s => s.trim());
    const cols = colStrings.map(str => {
      const parts = str.split(/\s+/);
      return {
        name: parts[0],
        type: parts[1].toUpperCase() as DataType,
        primaryKey: str.toUpperCase().includes('PRIMARY KEY'),
        unique: str.toUpperCase().includes('UNIQUE')
      };
    });

    return {
      type: QueryType.CREATE_TABLE,
      tableName: match[1],
      columns: cols
    };
  }

  private static parseUpdate(sql: string): ParsedQuery {
    const updateRegex = /UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i;
    const match = sql.match(updateRegex);
    if (!match) throw new Error('Invalid UPDATE syntax');

    const setParts = match[2].split(',').map(s => s.trim());
    const updates: Record<string, any> = {};
    setParts.forEach(part => {
      const [col, val] = part.split('=').map(s => s.trim());
      updates[col] = this.cleanValue(val);
    });

    const query: ParsedQuery = {
      type: QueryType.UPDATE,
      tableName: match[1],
      updates
    };

    if (match[3]) {
      const whereMatch = match[3].match(/([a-zA-Z0-9_.]+)\s*(=)\s*(.+)/i);
      if (whereMatch) {
        query.where = { column: whereMatch[1], operator: whereMatch[2], value: this.cleanValue(whereMatch[3]) };
      }
    }

    return query;
  }

  private static parseDelete(sql: string): ParsedQuery {
    const deleteRegex = /DELETE FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?$/i;
    const match = sql.match(deleteRegex);
    if (!match) throw new Error('Invalid DELETE syntax');

    const query: ParsedQuery = {
      type: QueryType.DELETE,
      tableName: match[1]
    };

    if (match[2]) {
      const whereMatch = match[2].match(/([a-zA-Z0-9_.]+)\s*(=)\s*(.+)/i);
      if (whereMatch) {
        query.where = { column: whereMatch[1], operator: whereMatch[2], value: this.cleanValue(whereMatch[3]) };
      }
    }

    return query;
  }

  private static parseDrop(sql: string): ParsedQuery {
    const match = sql.match(/DROP TABLE\s+([a-zA-Z0-9_]+)/i);
    if (!match) throw new Error('Invalid DROP TABLE syntax');
    return { type: QueryType.DROP_TABLE, tableName: match[1] };
  }

  private static parseDescribe(sql: string): ParsedQuery {
    const match = sql.match(/DESCRIBE\s+([a-zA-Z0-9_]+)/i);
    if (!match) throw new Error('Invalid DESCRIBE syntax');
    return { type: QueryType.DESCRIBE, tableName: match[1] };
  }

  private static cleanValue(val: string): any {
    if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1);
    if (val.toUpperCase() === 'TRUE') return true;
    if (val.toUpperCase() === 'FALSE') return false;
    if (val.toUpperCase() === 'NULL') return null;
    if (!isNaN(Number(val))) return Number(val);
    return val;
  }
}
