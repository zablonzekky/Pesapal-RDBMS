
import React from 'react';

const ArchitectureDocs: React.FC = () => {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="bg-blue-600/5 border border-blue-600/20 p-8 rounded-2xl mb-12">
        <h1 className="text-4xl font-black text-slate-100 mb-4 tracking-tighter">PesaDB Core Architecture</h1>
        <p className="text-xl text-slate-400 leading-relaxed">
          A custom-built, <strong>Browser-Native</strong> Relational Database Management System. This project demonstrates how to build complex backend logic directly within a TypeScript environment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section>
          <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-sm">1</span>
            Browser-as-a-Server
          </h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            Instead of a traditional Node.js/Python backend, PesaDB runs its entire logic on the client's machine. This "Local-First" architecture reduces latency to near-zero and allows for a fully functional RDBMS without an internet connection.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-sm">2</span>
            SQL Query Parser
          </h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            A state-machine based regex parser that transforms raw SQL strings into <strong>Query Execution Plans (QEPs)</strong>.
          </p>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono text-xs text-green-400">
            {`// Parsed Plan Example
{
  type: 'SELECT',
  tableName: 'users',
  joins: [{ table: 'transactions', on: {...} }],
  where: { col: 'amount', op: '>', val: 100 }
}`}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-sm">3</span>
            Join Engine
          </h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            Supports <code>INNER JOIN</code> logic. The current implementation uses a 
            <strong> Nested-Loop Join</strong> algorithm to combine data sets from different table structures.
          </p>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
             <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Complexity</div>
             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[70%]"></div>
             </div>
             <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                <span>O(N * M)</span>
                <span>Optimized via Schema Column Selection</span>
             </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-sm">4</span>
            Storage & Persistence
          </h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            Data is persisted using the <strong>Web Storage API</strong>. Tables are abstracted as individual files within a global Catalog, allowing for efficient schema lookups and data retrieval.
          </p>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>• <strong>Primary Key Uniqueness:</strong> No duplicate identifiers.</li>
            <li>• <strong>Type Safety:</strong> Enforces INTEGER vs STRING at runtime.</li>
            <li>• <strong>Nullable Checks:</strong> Blocks invalid empty fields.</li>
          </ul>
        </section>
      </div>

      <div className="mt-16 pt-16 border-t border-slate-800 flex flex-col items-center">
         <p className="text-slate-500 text-sm mb-4">Built with dedication for Pesapal JDEV Challenge '26</p>
         <div className="flex gap-4">
            <div className="px-3 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400">REACT 18</div>
            <div className="px-3 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400">TYPESCRIPT</div>
            <div className="px-3 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400">CUSTOM RDBMS</div>
         </div>
      </div>
    </div>
  );
};

export default ArchitectureDocs;
