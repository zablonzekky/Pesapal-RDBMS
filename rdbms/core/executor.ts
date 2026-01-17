
import { ParsedQuery, QueryType, QueryResult, TableData, DatabaseRecord, TableSchema } from '../../types';
import { StorageEngine } from './storage';

/**
 * PesaDB Query Executor
 * Processes parsed query plans against the storage engine.
 */
export class QueryExecutor {
  static execute(query: ParsedQuery): QueryResult {
    const start = performance.now();
    try {
      let result: any;
      switch (query.type) {
        case QueryType.SHOW_TABLES:
          result = this.handleShowTables();
          break;
        case QueryType.CREATE_TABLE:
          result = this.handleCreate(query);
          break;
        case QueryType.INSERT:
          result = this.handleInsert(query);
          break;
        case QueryType.SELECT:
          result = this.handleSelect(query);
          break;
        case QueryType.UPDATE:
          result = this.handleUpdate(query);
          break;
        case QueryType.DELETE:
          result = this.handleDelete(query);
          break;
        case QueryType.DROP_TABLE:
          result = this.handleDrop(query);
          break;
        case QueryType.DESCRIBE:
          result = this.handleDescribe(query);
          break;
        default:
          throw new Error(`Execution for ${query.type} not implemented.`);
      }
      const end = performance.now();
      return { ...result, executionTime: end - start };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  private static handleShowTables(): QueryResult {
    const tables = StorageEngine.getCatalog();
    return {
      success: true,
      message: `Found ${tables.length} tables`,
      data: tables.map(name => ({ table_name: name })),
      columns: ['table_name']
    };
  }

  private static handleCreate(query: ParsedQuery): QueryResult {
    if (StorageEngine.loadTable(query.tableName)) {
      throw new Error(`Table ${query.tableName} already exists.`);
    }

    const schema: TableSchema = {
      name: query.tableName,
      columns: query.columns || [],
      indices: {}
    };

    StorageEngine.saveTable(query.tableName, schema, []);
    return { success: true, message: `Table ${query.tableName} created successfully.` };
  }

  private static handleInsert(query: ParsedQuery): QueryResult {
    const table = StorageEngine.loadTable(query.tableName);
    if (!table) throw new Error(`Table ${query.tableName} not found.`);

    const record: DatabaseRecord = {};
    table.schema.columns.forEach(col => {
      const idx = query.columns?.indexOf(col.name);
      if (idx !== undefined && idx !== -1) {
        let val = query.values![idx];
        
        // Type Validation
        if (col.type === 'INTEGER' && typeof val !== 'number') throw new Error(`Column ${col.name} expects INTEGER.`);
        if (col.type === 'STRING' && typeof val !== 'string') throw new Error(`Column ${col.name} expects STRING.`);

        // Constraint: Primary Key / Unique
        if (col.primaryKey || col.unique) {
          if (table.records.some(r => r[col.name] === val)) {
            throw new Error(`Unique constraint violation on ${col.name}. Value ${val} already exists.`);
          }
        }
        record[col.name] = val;
      } else {
        if (!col.nullable && !col.primaryKey) throw new Error(`Column ${col.name} cannot be null.`);
        record[col.name] = null;
      }
    });

    table.records.push(record);
    StorageEngine.saveTable(query.tableName, table.schema, table.records);

    return { success: true, message: `1 row inserted into ${query.tableName}.` };
  }

  private static handleSelect(query: ParsedQuery): QueryResult {
    const mainTable = StorageEngine.loadTable(query.tableName);
    if (!mainTable) throw new Error(`Table ${query.tableName} not found.`);

    let results = [...mainTable.records];

    // Handle Joins (Simple Hash Join approximation)
    if (query.joins && query.joins.length > 0) {
      query.joins.forEach(join => {
        const joinTable = StorageEngine.loadTable(join.table);
        if (!joinTable) throw new Error(`Join table ${join.table} not found.`);

        const [leftTable, leftCol] = join.on.left.split('.');
        const [rightTable, rightCol] = join.on.right.split('.');

        // Simple Nested Loop Join
        const joinedResults: any[] = [];
        results.forEach(leftRecord => {
          joinTable.records.forEach(rightRecord => {
            const leftVal = leftTable === query.tableName ? leftRecord[leftCol] : leftRecord[rightCol];
            const rightVal = rightTable === join.table ? rightRecord[rightCol] : rightRecord[leftCol];

            if (leftVal === rightVal) {
              const combined = { ...leftRecord };
              // Prefix joined columns to avoid collisions
              Object.keys(rightRecord).forEach(k => {
                combined[`${join.table}.${k}`] = rightRecord[k];
              });
              joinedResults.push(combined);
            }
          });
        });
        results = joinedResults;
      });
    }

    // Handle Where
    if (query.where) {
      results = results.filter(row => {
        const val = row[query.where.column];
        switch (query.where.operator) {
          case '=': return val === query.where.value;
          case '>': return val > query.where.value;
          case '<': return val < query.where.value;
          case '!=': return val !== query.where.value;
          default: return true;
        }
      });
    }

    // Handle Ordering
    if (query.orderBy) {
      const { column, direction } = query.orderBy;
      results.sort((a, b) => {
        if (a[column] < b[column]) return direction === 'ASC' ? -1 : 1;
        if (a[column] > b[column]) return direction === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    // Filter Columns
    if (query.columns && query.columns.length > 0) {
      results = results.map(row => {
        const newRow: any = {};
        query.columns!.forEach(c => {
          newRow[c] = row[c];
        });
        return newRow;
      });
    }

    const outputCols = results.length > 0 ? Object.keys(results[0]) : (query.columns || mainTable.schema.columns.map(c => c.name));

    return {
      success: true,
      message: `Selected ${results.length} rows.`,
      data: results,
      columns: outputCols
    };
  }

  private static handleUpdate(query: ParsedQuery): QueryResult {
    const table = StorageEngine.loadTable(query.tableName);
    if (!table) throw new Error(`Table ${query.tableName} not found.`);

    let count = 0;
    table.records = table.records.map(row => {
      let match = true;
      if (query.where) {
        match = row[query.where.column] === query.where.value;
      }

      if (match) {
        count++;
        return { ...row, ...query.updates };
      }
      return row;
    });

    StorageEngine.saveTable(query.tableName, table.schema, table.records);
    return { success: true, message: `${count} rows updated.` };
  }

  private static handleDelete(query: ParsedQuery): QueryResult {
    const table = StorageEngine.loadTable(query.tableName);
    if (!table) throw new Error(`Table ${query.tableName} not found.`);

    const initialCount = table.records.length;
    if (query.where) {
      table.records = table.records.filter(row => row[query.where.column] !== query.where.value);
    } else {
      table.records = [];
    }

    const deleted = initialCount - table.records.length;
    StorageEngine.saveTable(query.tableName, table.schema, table.records);
    return { success: true, message: `${deleted} rows deleted.` };
  }

  private static handleDrop(query: ParsedQuery): QueryResult {
    StorageEngine.deleteTable(query.tableName);
    return { success: true, message: `Table ${query.tableName} dropped.` };
  }

  private static handleDescribe(query: ParsedQuery): QueryResult {
    const table = StorageEngine.loadTable(query.tableName);
    if (!table) throw new Error(`Table ${query.tableName} not found.`);
    
    return {
      success: true,
      message: `Schema for ${query.tableName}`,
      data: table.schema.columns,
      columns: ['name', 'type', 'primaryKey', 'unique', 'nullable']
    };
  }
}
