
import React, { useState, useRef, useEffect } from 'react';
import { PesaDB } from '../rdbms/database';
import { QueryResult } from '../types';

const SQLRepl: React.FC = () => {
  const [history, setHistory] = useState<{ query: string; result: QueryResult }[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuery.trim()) return;

    const result = PesaDB.query(currentQuery);
    setHistory([...history, { query: currentQuery, result }]);
    setCurrentQuery('');
  };

  const examples = [
    "SELECT * FROM users",
    "SELECT users.name, transactions.amount FROM users JOIN transactions ON users.id = transactions.user_id",
    "CREATE TABLE products (id INTEGER PRIMARY KEY, name STRING, price DECIMAL)",
    "INSERT INTO products (id, name, price) VALUES (1, 'Voucher', 500.00)",
    "SELECT * FROM users WHERE id = 1",
    "SHOW TABLES"
  ];

  return (
    <div className="flex flex-col h-[70vh] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-slate-400 font-mono">pesadb-cli --v1.0</span>
      </div>

      {/* History Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 mono text-sm scroll-smooth">
        <div className="text-blue-400 mb-2">Welcome to PesaDB REPL. Type SQL commands below.</div>
        
        {history.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex gap-2 text-slate-100">
              <span className="text-green-500 font-bold">pesadb&gt;</span>
              <span>{item.query}</span>
            </div>
            
            <div className={`p-3 rounded border ${item.result.success ? 'bg-slate-800/50 border-slate-700' : 'bg-red-950/20 border-red-900/50 text-red-400'}`}>
              {!item.result.success ? (
                <p>{item.result.message}</p>
              ) : (
                <>
                  {item.result.data && item.result.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-700">
                            {item.result.columns?.map(c => (
                              <th key={c} className="px-2 py-1 text-blue-300 uppercase text-[10px]">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {item.result.data.map((row, ridx) => (
                            <tr key={ridx} className="border-b border-slate-800/50">
                              {item.result.columns?.map(c => (
                                <td key={c} className="px-2 py-1 text-slate-300">{String(row[c])}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">{item.result.message}</p>
                  )}
                  <p className="mt-2 text-[10px] text-slate-500">
                    Execution time: {item.result.executionTime?.toFixed(3)}ms
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleExecute} className="p-4 border-t border-slate-800 bg-slate-900 flex gap-2">
        <span className="text-green-500 font-bold mono">pesadb&gt;</span>
        <input
          type="text"
          value={currentQuery}
          onChange={(e) => setCurrentQuery(e.target.value)}
          placeholder="Enter SQL command..."
          className="flex-1 bg-transparent border-none outline-none mono text-sm text-slate-100 placeholder:text-slate-700"
          autoFocus
        />
        <div className="flex gap-2">
           <button 
            type="button" 
            onClick={() => setHistory([])}
            className="text-xs px-2 py-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear History
          </button>
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded transition-all font-bold"
          >
            EXECUTE
          </button>
        </div>
      </form>

      {/* Quick Examples */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex gap-4 overflow-x-auto">
        <span className="text-[10px] text-slate-500 font-bold uppercase whitespace-nowrap pt-1">Shortcuts:</span>
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuery(ex)}
            className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded hover:bg-slate-700 hover:text-slate-100 transition-colors whitespace-nowrap"
          >
            {ex.substring(0, 30)}...
          </button>
        ))}
      </div>
    </div>
  );
};

export default SQLRepl;
