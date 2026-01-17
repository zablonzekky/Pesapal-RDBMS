import React, { useState, useEffect } from 'react';
import { PesaDB } from '../rdbms/database';
import { QueryResult } from '../types';

const DemoApp: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  
  // Amount inputs for each user
  const [userAmounts, setUserAmounts] = useState<{[key: number]: string}>({});

  const refreshData = () => {
    setLoading(true);
    const usersResult = PesaDB.query("SELECT * FROM users");
    const transResult = PesaDB.query("SELECT transactions.id, users.name as user_name, transactions.amount, transactions.type FROM transactions JOIN users ON transactions.user_id = users.id ORDER BY transactions.id DESC");
    
    if (usersResult.success) setUsers(usersResult.data || []);
    if (transResult.success) setRecentTransactions(transResult.data || []);
    setLoading(false);
  };

  useEffect(() => {
    PesaDB.initializeDemo();
    refreshData();
  }, []);

  const handleCreateUser = () => {
    if (!newUserName || !newUserEmail) return;
    const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const res = PesaDB.query(`INSERT INTO users (id, name, email) VALUES (${nextId}, '${newUserName}', '${newUserEmail}')`);
    if (res.success) {
      setNewUserName('');
      setNewUserEmail('');
      refreshData();
    } else {
      alert(res.message);
    }
  };

  const handleAddTransaction = (userId: number, amount: number, type: string) => {
    const nextId = Math.floor(Math.random() * 1000) + 200;
    const res = PesaDB.query(`INSERT INTO transactions (id, user_id, amount, type) VALUES (${nextId}, ${userId}, ${amount}, '${type}')`);
    if (res.success) {
      // Clear the amount input for this user
      setUserAmounts(prev => ({...prev, [userId]: ''}));
      refreshData();
    } else {
      alert(res.message);
    }
  };

  const handleCustomDeposit = (userId: number) => {
    const amountStr = userAmounts[userId] || '';
    const amount = parseFloat(amountStr);
    
    if (!amountStr || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    handleAddTransaction(userId, amount, 'DEPOSIT');
  };

  const handleCustomPayment = (userId: number) => {
    const amountStr = userAmounts[userId] || '';
    const amount = parseFloat(amountStr);
    
    if (!amountStr || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    handleAddTransaction(userId, amount, 'PAYMENT');
  };

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-xl shadow-blue-900/20">
          <p className="text-blue-100/70 text-sm font-medium">Total Registered Users</p>
          <h4 className="text-4xl font-bold text-white mt-1">{users.length}</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-500 text-sm font-medium">Volume Processed (Last 7 Days)</p>
          <h4 className="text-3xl font-bold text-slate-100 mt-1">KES 142,500.25</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-500 text-sm font-medium">Active Engine Status</p>
          <div className="flex items-center gap-2 mt-2">
             <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
             <h4 className="text-xl font-bold text-slate-100 uppercase tracking-tighter">Operational</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-100">Merchant Userbase</h3>
            <button onClick={refreshData} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Refresh Engine</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/50">
            <input 
              className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500 transition-colors"
              placeholder="Full Name"
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleCreateUser()}
            />
             <input 
              className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500 transition-colors"
              placeholder="Email"
              value={newUserEmail}
              onChange={e => setNewUserEmail(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleCreateUser()}
            />
            <button 
              onClick={handleCreateUser}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs py-2 transition-all"
            >
              ADD MERCHANT
            </button>
          </div>

          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-200">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                
                {/* Amount Input and Actions */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount (KES)"
                    value={userAmounts[user.id] || ''}
                    onChange={(e) => setUserAmounts(prev => ({...prev, [user.id]: e.target.value}))}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomDeposit(user.id)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-green-500 transition-colors"
                    min="0"
                    step="0.01"
                  />
                  <button 
                    onClick={() => handleCustomDeposit(user.id)}
                    className="text-[10px] bg-green-900/30 text-green-400 border border-green-800/50 px-3 py-1.5 rounded hover:bg-green-900/50 transition-colors font-bold"
                    title="Add Deposit"
                  >
                    + DEPOSIT
                  </button>
                  <button 
                    onClick={() => handleCustomPayment(user.id)}
                    className="text-[10px] bg-red-900/30 text-red-400 border border-red-800/50 px-3 py-1.5 rounded hover:bg-red-900/50 transition-colors font-bold"
                    title="Make Payment"
                  >
                    - PAYMENT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Ledger (JOIN Demonstration) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-bold text-slate-100">Live Transaction Ledger</h3>
            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-800/50 uppercase tracking-widest font-black">Join Query Active</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {recentTransactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <p>No transactions found in database.</p>
              </div>
            ) : (
              recentTransactions.map((tx, idx) => (
                <div key={tx.id || idx} className="flex items-center gap-4 p-4 bg-slate-950 border-l-4 border-l-blue-600 border border-slate-800 rounded-r-xl">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${tx.type === 'DEPOSIT' ? 'bg-green-950/30 text-green-500' : 'bg-red-950/30 text-red-500'}`}>
                    {tx.type === 'DEPOSIT' ? '↓' : '↑'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-100">{tx.user_name || 'System User'}</p>
                    <p className="text-[10px] text-slate-500 font-mono">TX_ID: {tx.id} • TYPE: {tx.type}</p>
                  </div>
                  <div className={`text-right font-mono font-bold ${tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-slate-100'}`}>
                    {tx.type === 'DEPOSIT' ? '+' : '-'} {tx.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-800">
             <p className="text-[10px] text-slate-600 font-mono italic">
               Query: SELECT transactions.id, users.name, transactions.amount, transactions.type FROM transactions JOIN users ON transactions.user_id = users.id
             </p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(15 23 42);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(51 65 85);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(71 85 105);
        }
      `}</style>
    </div>
  );
};

export default DemoApp;