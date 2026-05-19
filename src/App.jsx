import { useState } from 'react';
import { ReportProvider, useReportContext } from './context/ReportContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ReportsList from './components/ReportsList';
import ReportViewer from './components/ReportViewer';
import ReportBuilder from './components/ReportBuilder';
import InfoPage from './components/InfoPage';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { state, dispatch } = useReportContext();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'reports':
        return <ReportsList onNavigate={setCurrentView} />;
      case 'viewer':
        return <ReportViewer onNavigate={setCurrentView} />;
      case 'info':
        return <InfoPage />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="main-content">
        {renderView()}
      </main>

      {state.isBuilderOpen && <ReportBuilder />}

      {/* Notifications */}
      <div className="notification-stack">
        {state.notifications.map(n => (
          <div key={n.id} className={`notification ${n.type}`}>
            {n.type === 'success' && <CheckCircle size={16} />}
            {n.type === 'error' && <AlertCircle size={16} />}
            {n.type === 'info' && <Info size={16} />}
            <span style={{ flex: 1 }}>{n.message}</span>
            <button onClick={() => dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 2 }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReportProvider>
      <AppContent />
    </ReportProvider>
  );
}
