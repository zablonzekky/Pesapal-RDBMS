
export type DataType = 'INTEGER' | 'STRING' | 'BOOLEAN' | 'DECIMAL';

export interface ColumnDefinition {
  name: string;
  type: DataType;
  primaryKey?: boolean;
  unique?: boolean;
  nullable?: boolean;
}

export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  indices: Record<string, string>; // name -> column
}

export interface DatabaseRecord {
  [key: string]: any;
}

export interface TableData {
  schema: TableSchema;
  records: DatabaseRecord[];
}

export interface QueryResult {
  success: boolean;
  message: string;
  data?: any[];
  columns?: string[];
  executionTime?: number;
}

export enum QueryType {
  CREATE_TABLE = 'CREATE_TABLE',
  INSERT = 'INSERT',
  SELECT = 'SELECT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  DROP_TABLE = 'DROP_TABLE',
  DESCRIBE = 'DESCRIBE',
  SHOW_TABLES = 'SHOW_TABLES'
}

export interface ParsedQuery {
  type: QueryType;
  tableName: string;
  columns?: any[];
  values?: any[];
  where?: any;
  joins?: JoinDefinition[];
  updates?: Record<string, any>;
  orderBy?: { column: string; direction: 'ASC' | 'DESC' };
}

export interface JoinDefinition {
  type: 'INNER' | 'LEFT';
  table: string;
  on: { left: string; right: string };
}
