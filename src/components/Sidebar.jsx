import { LayoutDashboard, FileBarChart, PlusCircle, Settings, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';
import { useReportContext } from '../context/ReportContext';

export default function Sidebar({ currentView, onNavigate }) {
  const { state, dispatch } = useReportContext();
  const { savedReports, sidebarCollapsed } = state;
  const collapsed = sidebarCollapsed;

  const favorites = savedReports.filter(r => r.isFavorite);
  const scheduled = savedReports.filter(r => r.schedule);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle" onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}>
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </div>

      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/logo.svg" alt="OpenReport Logo" />
        </div>
        <div className="sidebar-header-text">
          <h1>OpenReport</h1>
          <span>Backoffice Reporting</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">
            <span className="sidebar-label">Navigation</span>
          </div>
          <div
            className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            <LayoutDashboard size={18} className="icon" />
            <span className="sidebar-label">Dashboard</span>
          </div>
          <div
            className={`sidebar-item ${currentView === 'reports' ? 'active' : ''}`}
            onClick={() => onNavigate('reports')}
          >
            <FileBarChart size={18} className="icon" />
            <span className="sidebar-label">My Reports</span>
          </div>
          <div
            className="sidebar-item"
            onClick={() => dispatch({ type: 'OPEN_BUILDER' })}
          >
            <PlusCircle size={18} className="icon" />
            <span className="sidebar-label">New Report</span>
          </div>
          <div
            className={`sidebar-item ${currentView === 'info' ? 'active' : ''}`}
            onClick={() => onNavigate('info')}
          >
            <Settings size={18} className="icon" />
            <span className="sidebar-label">About MVP</span>
          </div>
        </div>

        {!collapsed && favorites.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Favorites</div>
            {favorites.map(r => (
              <div
                key={r.id}
                className={`sidebar-item ${state.activeReport?.id === r.id ? 'active' : ''}`}
                onClick={() => {
                  dispatch({ type: 'SET_ACTIVE_REPORT', payload: r });
                  onNavigate('viewer');
                }}
              >
                <Star size={14} className="icon" style={{ color: '#f59e0b' }} />
                <span className="sidebar-label" style={{ fontSize: 12 }}>{r.name}</span>
              </div>
            ))}
          </div>
        )}

        {!collapsed && scheduled.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Scheduled</div>
            {scheduled.map(r => (
              <div
                key={r.id}
                className={`sidebar-item ${state.activeReport?.id === r.id ? 'active' : ''}`}
                onClick={() => {
                  dispatch({ type: 'SET_ACTIVE_REPORT', payload: r });
                  onNavigate('viewer');
                }}
              >
                <Clock size={14} className="icon" />
                <span className="sidebar-label" style={{ fontSize: 12 }}>{r.name}</span>
              </div>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-item" onClick={() => onNavigate('settings')}>
          <Settings size={18} className="icon" />
          <span className="sidebar-label sidebar-footer-text">Settings</span>
        </div>
      </div>
    </aside>
  );
}
