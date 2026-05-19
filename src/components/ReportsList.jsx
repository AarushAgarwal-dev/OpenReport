import { useState, useMemo } from 'react';
import { Plus, Search, Star, Clock, Edit2, Copy, Trash2, ChevronRight } from 'lucide-react';
import { useReportContext } from '../context/ReportContext';
import { dataSources } from '../data/mockData';

export default function ReportsList({ onNavigate }) {
  const { state, dispatch } = useReportContext();
  const { savedReports } = state;
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filtered = useMemo(() => {
    let reports = savedReports;
    if (activeTab === 'favorites') reports = reports.filter(r => r.isFavorite);
    if (activeTab === 'scheduled') reports = reports.filter(r => r.schedule);
    if (search) {
      const q = search.toLowerCase();
      reports = reports.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.dataSource?.toLowerCase().includes(q)
      );
    }
    return reports;
  }, [savedReports, search, activeTab]);

  const openReport = (report) => {
    dispatch({ type: 'SET_ACTIVE_REPORT', payload: report });
    onNavigate('viewer');
  };

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>My Reports</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{savedReports.length} saved report configurations</p>
        </div>
        <button className="btn btn-primary" onClick={() => dispatch({ type: 'OPEN_BUILDER' })}>
          <Plus size={16} /> New Report
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div className="tabs">
          {['all', 'favorites', 'scheduled'].map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Search size={48} /></div>
          <h3>No reports found</h3>
          <p>{search ? 'Try adjusting your search terms' : 'Create your first report to get started'}</p>
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'OPEN_BUILDER' })}>
            <Plus size={16} /> Create Report
          </button>
        </div>
      ) : (
        <div className="reports-grid">
          {filtered.map(report => {
            const source = dataSources[report.dataSource];
            return (
              <div key={report.id} className="report-card" onClick={() => openReport(report)}>
                <div className="report-card-actions">
                  <button className={`favorite-btn ${report.isFavorite ? 'active' : ''}`}
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FAVORITE', payload: report.id }); }}>
                    <Star size={14} fill={report.isFavorite ? '#f59e0b' : 'none'} />
                  </button>
                  <button className="btn btn-icon btn-ghost btn-sm"
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'OPEN_BUILDER', payload: report }); }}>
                    <Edit2 size={13} />
                  </button>
                  <button className="btn btn-icon btn-ghost btn-sm"
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'DUPLICATE_REPORT', payload: report.id }); dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Report duplicated' } }); }}>
                    <Copy size={13} />
                  </button>
                  <button className="btn btn-icon btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_REPORT', payload: report.id }); dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: 'Report deleted' } }); }}>
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="report-card-header">
                  <h4>{report.name}</h4>
                  <span className="report-card-source" style={{ background: `${source?.color}20`, color: source?.color }}>
                    {source?.name || report.dataSource}
                  </span>
                </div>
                <p>{report.description || 'No description'}</p>
                <div className="report-card-meta">
                  <span>{report.columns?.length || 0} cols</span>
                  <span>•</span>
                  <span>{report.filters?.length || 0} filters</span>
                  {report.groupBy && <><span>•</span><span>Grouped by {report.groupBy}</span></>}
                  {report.schedule && <><span>•</span><span className="schedule-badge"><Clock size={10} /> {report.schedule.frequency}</span></>}
                </div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Updated {new Date(report.updatedAt).toLocaleDateString()}
                  </span>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
