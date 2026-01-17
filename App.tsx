
import React, { useState } from 'react';
import Layout from './components/Layout';
import SQLRepl from './components/SQLRepl';
import TableExplorer from './components/TableExplorer';
import DemoApp from './components/DemoApp';
import ArchitectureDocs from './components/ArchitectureDocs';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('app');

  const renderContent = () => {
    switch (activeTab) {
      case 'app':
        return <DemoApp />;
      case 'repl':
        return <SQLRepl />;
      case 'explorer':
        return <TableExplorer />;
      case 'docs':
        return <ArchitectureDocs />;
      default:
        return <DemoApp />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in duration-500">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
