
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'app', label: 'Payment App', icon: '💳' },
    { id: 'repl', label: 'SQL Console', icon: '💻' },
    { id: 'explorer', label: 'Table Explorer', icon: '📊' },
    { id: 'docs', label: 'Architecture', icon: '📜' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-blue-600 px-2 py-1 rounded text-white text-xs">PesaDB</span>
            <span className="tracking-tight">RDBMS v1.0</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Junior Dev Challenge '26</p>
            <p className="text-xs text-slate-300">wekecarriers21@mail.com</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950 flex flex-col">
        <header className="h-16 border-b border-slate-800 flex items-center px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-200">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            
            <span className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              RDBMS Engine Online
            </span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
