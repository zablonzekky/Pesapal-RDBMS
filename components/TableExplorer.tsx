import React, { useState, useEffect } from 'react';
import { StorageEngine } from '../rdbms/core/storage';
import { PesaDB } from '../rdbms/database';
import { TableData } from '../types';

const TableExplorer: React.FC = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [data, setData] = useState<TableData | null>(null);
  
  // CRUD states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [formData, setFormData] = useState<{[key: string]: any}>({});

  const loadCatalog = () => {
    const catalog = StorageEngine.getCatalog();
    setTables(catalog);
    
    if (catalog.length > 0 && selectedTable === null) {
      setSelectedTable(catalog[0]);
    }
    
    if (selectedTable && !catalog.includes(selectedTable)) {
      setSelectedTable(catalog.length > 0 ? catalog[0] : null);
    }
  };

  useEffect(() => {
    loadCatalog();
    const interval = setInterval(loadCatalog, 2000);
    return () => clearInterval(interval);
  }, [selectedTable]);

  useEffect(() => {
    if (selectedTable) {
      const tableInfo = StorageEngine.loadTable(selectedTable);
      setData(tableInfo);
    } else {
      setData(null);
    }
  }, [selectedTable, tables]);

  const refreshTable = () => {
    if (selectedTable) {
      const tableInfo = StorageEngine.loadTable(selectedTable);
      setData(tableInfo);
    }
  };

  const handleAddRecord = () => {
    if (!data || !selectedTable) return;
    
    // Build INSERT query
    const columns = data.schema.columns.map(c => c.name).join(', ');
    const values = data.schema.columns.map(col => {
      const value = formData[col.name];
      if (value === undefined || value === '') return 'NULL';
      if (col.type === 'INTEGER' || col.type === 'REAL') return value;
      return `'${value}'`;
    }).join(', ');
    
    const query = `INSERT INTO ${selectedTable} (${columns}) VALUES (${values})`;
    const result = PesaDB.query(query);
    
    if (result.success) {
      setShowAddModal(false);
      setFormData({});
      refreshTable();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleUpdateRecord = () => {
    if (!data || !selectedTable || !editingRow) return;
    
    // Find primary key
    const pkColumn = data.schema.columns.find(c => c.primaryKey);
    if (!pkColumn) {
      alert('Cannot update: No primary key defined');
      return;
    }
    
    // Build SET clause
    const setClauses = data.schema.columns
      .filter(c => !c.primaryKey)
      .map(col => {
        const value = formData[col.name];
        if (value === undefined || value === '') return `${col.name} = NULL`;
        if (col.type === 'INTEGER' || col.type === 'REAL') return `${col.name} = ${value}`;
        return `${col.name} = '${value}'`;
      })
      .join(', ');
    
    const query = `UPDATE ${selectedTable} SET ${setClauses} WHERE ${pkColumn.name} = ${editingRow[pkColumn.name]}`;
    const result = PesaDB.query(query);
    
    if (result.success) {
      setShowEditModal(false);
      setEditingRow(null);
      setFormData({});
      refreshTable();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleDeleteRecord = (row: any) => {
    if (!data || !selectedTable) return;
    
    const pkColumn = data.schema.columns.find(c => c.primaryKey);
    if (!pkColumn) {
      alert('Cannot delete: No primary key defined');
      return;
    }
    
    if (!confirm(`Delete this record? This action cannot be undone.`)) return;
    
    const query = `DELETE FROM ${selectedTable} WHERE ${pkColumn.name} = ${row[pkColumn.name]}`;
    const result = PesaDB.query(query);
    
    if (result.success) {
      refreshTable();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const openAddModal = () => {
    if (!data) return;
    const initialData: {[key: string]: any} = {};
    data.schema.columns.forEach(col => {
      initialData[col.name] = '';
    });
    setFormData(initialData);
    setShowAddModal(true);
  };

  const openEditModal = (row: any) => {
    setEditingRow(row);
    setFormData({...row});
    setShowEditModal(true);
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Table List */}
      <div className="col-span-12 md:col-span-3 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/50">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Catalog</h3>
            <p className="text-[10px] text-slate-600 mt-1">{tables.length} table{tables.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="p-2 space-y-1">
            {tables.length === 0 ? (
              <p className="p-4 text-sm text-slate-600 italic">No tables found.</p>
            ) : (
              tables.map(tbl => (
                <button
                  key={tbl}
                  onClick={() => setSelectedTable(tbl)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${
                    selectedTable === tbl ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="opacity-50">📂</span> {tbl}
                  </span>
                  {selectedTable === tbl && <span className="text-xs bg-blue-500 px-2 py-0.5 rounded">Active</span>}
                </button>
              ))
            )}
          </div>
        </div>
        
        <button 
          onClick={() => {
            if (confirm('Are you sure? This will delete all tables and data.')) {
              StorageEngine.clearAll();
              setSelectedTable(null);
              setData(null);
              loadCatalog();
            }
          }}
          className="w-full text-xs text-red-400 hover:text-red-300 px-4 py-2 border border-red-900/30 rounded-lg hover:bg-red-900/10 transition-colors"
        >
          🗑️ Factory Reset Database
        </button>
      </div>

      {/* Table Details */}
      <div className="col-span-12 md:col-span-9">
        {selectedTable && data ? (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{selectedTable}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.records.length} record{data.records.length !== 1 ? 's' : ''} • {data.schema.columns.length} column{data.schema.columns.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={openAddModal}
                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg transition-colors font-bold"
                  >
                    ➕ Add Record
                  </button>
                  <button
                    onClick={refreshTable}
                    className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 border border-blue-800/50 rounded-lg hover:bg-blue-900/20 transition-colors"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950">
                    <tr>
                      {data.schema.columns.map(col => (
                        <th key={col.name} className="px-6 py-4 font-mono">
                          <div className="text-slate-200">{col.name}</div>
                          <div className="text-[10px] text-slate-600 flex gap-1 mt-1">
                            <span className="bg-slate-800 px-1 rounded">{col.type}</span>
                            {col.primaryKey && <span className="bg-yellow-900/30 text-yellow-500 px-1 rounded">PK</span>}
                            {col.unique && <span className="bg-green-900/30 text-green-500 px-1 rounded">UNQ</span>}
                            {col.nullable === false && <span className="bg-red-900/30 text-red-500 px-1 rounded">NOT NULL</span>}
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-4 font-mono text-slate-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data.records.length === 0 ? (
                      <tr>
                        <td colSpan={data.schema.columns.length + 1} className="px-6 py-12 text-center text-slate-600 italic">
                          Table is empty. Click "Add Record" to insert data.
                        </td>
                      </tr>
                    ) : (
                      data.records.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/50 transition-colors group">
                          {data.schema.columns.map(col => (
                            <td key={col.name} className="px-6 py-4 font-mono text-slate-400 group-hover:text-slate-200">
                              {row[col.name] === null ? (
                                <span className="text-red-900 italic opacity-50">NULL</span>
                              ) : (
                                <span className={col.primaryKey ? 'text-yellow-400' : ''}>{String(row[col.name])}</span>
                              )}
                            </td>
                          ))}
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(row)}
                                className="text-[10px] bg-blue-900/30 text-blue-400 border border-blue-800/50 px-2 py-1 rounded hover:bg-blue-900/50 transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(row)}
                                className="text-[10px] bg-red-900/30 text-red-400 border border-red-800/50 px-2 py-1 rounded hover:bg-red-900/50 transition-colors"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Schema View */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">📋 Schema Definition</h4>
              <pre className="text-xs text-blue-400 bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-800">
{`CREATE TABLE ${selectedTable} (
  ${data.schema.columns.map(c => `${c.name} ${c.type}${c.primaryKey ? ' PRIMARY KEY' : ''}${c.unique ? ' UNIQUE' : ''}${c.nullable === false ? ' NOT NULL' : ''}`).join(',\n  ')}
);`}
              </pre>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center bg-slate-900 border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
            <span className="text-4xl mb-2">🔍</span>
            <p className="text-sm">Select a table from the catalog to browse its contents</p>
            {tables.length === 0 && (
              <p className="text-xs text-slate-700 mt-2">No tables available. Create one using SQL queries.</p>
            )}
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {showAddModal && data && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border-2 border-green-600/30 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">➕ Add New Record to {selectedTable}</h3>
            
            <div className="space-y-4">
              {data.schema.columns.map(col => (
                <div key={col.name}>
                  <label className="block text-slate-400 text-sm mb-2">
                    {col.name}
                    <span className="text-slate-600 ml-2 text-xs">
                      ({col.type}
                      {col.primaryKey && ', PRIMARY KEY'}
                      {col.unique && ', UNIQUE'}
                      {col.nullable === false && ', NOT NULL'})
                    </span>
                  </label>
                  <input
                    type={col.type === 'INTEGER' || col.type === 'REAL' ? 'number' : 'text'}
                    step={col.type === 'REAL' ? '0.01' : undefined}
                    value={formData[col.name] || ''}
                    onChange={(e) => setFormData(prev => ({...prev, [col.name]: e.target.value}))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500 transition-colors"
                    placeholder={col.nullable ? 'Optional' : 'Required'}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({});
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-2 font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecord}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-lg py-2 font-bold transition-colors"
              >
                Add Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {showEditModal && data && editingRow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border-2 border-blue-600/30 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">✏️ Edit Record in {selectedTable}</h3>
            
            <div className="space-y-4">
              {data.schema.columns.map(col => (
                <div key={col.name}>
                  <label className="block text-slate-400 text-sm mb-2">
                    {col.name}
                    <span className="text-slate-600 ml-2 text-xs">
                      ({col.type}
                      {col.primaryKey && ', PRIMARY KEY - Cannot Edit'}
                      {col.unique && ', UNIQUE'}
                      {col.nullable === false && ', NOT NULL'})
                    </span>
                  </label>
                  <input
                    type={col.type === 'INTEGER' || col.type === 'REAL' ? 'number' : 'text'}
                    step={col.type === 'REAL' ? '0.01' : undefined}
                    value={formData[col.name] || ''}
                    onChange={(e) => setFormData(prev => ({...prev, [col.name]: e.target.value}))}
                    disabled={col.primaryKey}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRow(null);
                  setFormData({});
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-2 font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRecord}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 font-bold transition-colors"
              >
                Update Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableExplorer;