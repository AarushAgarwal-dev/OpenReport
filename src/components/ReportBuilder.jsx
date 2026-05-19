import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowLeftRight, Briefcase, TrendingUp, Receipt } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useReportContext } from '../context/ReportContext';
import { dataSources } from '../data/mockData';
import { getOperatorsForType } from '../engine/reportEngine';

const ICONS = { ArrowLeftRight, Briefcase, TrendingUp, Receipt };

export default function ReportBuilder() {
  const { state, dispatch } = useReportContext();
  const { editingReport } = state;

  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    id: '',
    name: '',
    description: '',
    dataSource: '',
    columns: [],
    filters: [],
    sortBy: { key: '', direction: 'asc' },
    groupBy: '',
    schedule: null,
    isFavorite: false,
  });

  useEffect(() => {
    if (editingReport) {
      setConfig({ ...editingReport });
      setStep(2);
    }
  }, [editingReport]);

  const source = dataSources[config.dataSource];

  const updateConfig = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const toggleColumn = (colKey) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.includes(colKey)
        ? prev.columns.filter(c => c !== colKey)
        : [...prev.columns, colKey],
    }));
  };

  const addFilter = () => {
    if (!source) return;
    setConfig(prev => ({
      ...prev,
      filters: [...prev.filters, { id: uuidv4(), column: source.columns[0].key, operator: 'contains', value: '', valueTo: '' }],
    }));
  };

  const updateFilter = (id, field, value) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.map(f => f.id === id ? { ...f, [field]: value } : f),
    }));
  };

  const removeFilter = (id) => {
    setConfig(prev => ({ ...prev, filters: prev.filters.filter(f => f.id !== id) }));
  };

  const handleSave = () => {
    if (!config.name || !config.dataSource || config.columns.length === 0) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Please fill in name, data source, and select columns' } });
      return;
    }
    const report = { ...config, id: config.id || uuidv4() };
    dispatch({ type: 'SAVE_REPORT', payload: report });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: `Report "${report.name}" saved successfully` } });
    dispatch({ type: 'CLOSE_BUILDER' });
  };

  const [scheduleEnabled, setScheduleEnabled] = useState(!!config.schedule);
  const [scheduleConfig, setScheduleConfig] = useState(config.schedule || { frequency: 'daily', time: '08:00', day: 'Monday' });

  useEffect(() => {
    updateConfig('schedule', scheduleEnabled ? scheduleConfig : null);
  }, [scheduleEnabled, scheduleConfig]);

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'CLOSE_BUILDER' })}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingReport ? 'Edit Report' : 'Create New Report'}</h2>
          <button className="btn btn-icon btn-ghost" onClick={() => dispatch({ type: 'CLOSE_BUILDER' })}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[1, 2, 3].map(s => (
              <div key={s} onClick={() => (config.dataSource || s === 1) && setStep(s)}
                style={{
                  flex: 1, height: 4, borderRadius: 2, cursor: 'pointer',
                  background: s <= step ? 'var(--accent)' : 'var(--border)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          {step === 1 && (
            <>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>Select Data Source</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Choose the primary data source for your report</p>
              <div className="source-grid">
                {Object.entries(dataSources).map(([key, src]) => {
                  const Icon = ICONS[src.icon] || ArrowLeftRight;
                  return (
                    <div key={key} className={`source-card ${config.dataSource === key ? 'selected' : ''}`}
                      onClick={() => {
                        updateConfig('dataSource', key);
                        if (!config.columns.length) updateConfig('columns', src.columns.slice(0, 6).map(c => c.key));
                      }}>
                      <div className="source-icon" style={{ background: `${src.color}20` }}>
                        <Icon size={20} style={{ color: src.color }} />
                      </div>
                      <div>
                        <h4>{src.name}</h4>
                        <p>{src.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {config.dataSource && (
                <div style={{ marginTop: 20 }}>
                  <button className="btn btn-primary" onClick={() => setStep(2)}>Continue →</button>
                </div>
              )}
            </>
          )}

          {step === 2 && source && (
            <>
              <div className="form-row" style={{ marginBottom: 18 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Report Name</label>
                  <input className="form-input" placeholder="e.g. Daily Trade Blotter" value={config.name} onChange={e => updateConfig('name', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description</label>
                  <input className="form-input" placeholder="Brief description" value={config.description} onChange={e => updateConfig('description', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Columns ({config.columns.length} selected)</label>
                <div className="column-picker">
                  {source.columns.map(col => (
                    <div key={col.key} className={`column-chip ${config.columns.includes(col.key) ? 'selected' : ''}`} onClick={() => toggleColumn(col.key)}>
                      {col.label}
                      {config.columns.includes(col.key) && <span className="chip-remove">✕</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Filters ({config.filters.length})</label>
                {config.filters.map(filter => {
                  const colMeta = source.columns.find(c => c.key === filter.column);
                  const operators = getOperatorsForType(colMeta?.type);
                  return (
                    <div key={filter.id} className="filter-row">
                      <select className="form-select" value={filter.column} onChange={e => updateFilter(filter.id, 'column', e.target.value)}>
                        {source.columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                      <select className="form-select" value={filter.operator} onChange={e => updateFilter(filter.id, 'operator', e.target.value)}>
                        {operators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                      </select>
                      <input className="form-input" placeholder="Value" value={filter.value} onChange={e => updateFilter(filter.id, 'value', e.target.value)} />
                      <button className="btn btn-icon btn-ghost" onClick={() => removeFilter(filter.id)}><Trash2 size={14} /></button>
                    </div>
                  );
                })}
                <button className="btn btn-ghost btn-sm" onClick={addFilter}><Plus size={14} /> Add Filter</button>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Sort By</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select className="form-select" value={config.sortBy?.key || ''} onChange={e => updateConfig('sortBy', { ...config.sortBy, key: e.target.value })}>
                      <option value="">None</option>
                      {source.columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                    <select className="form-select" style={{ width: 100, flex: 'none' }} value={config.sortBy?.direction || 'asc'} onChange={e => updateConfig('sortBy', { ...config.sortBy, direction: e.target.value })}>
                      <option value="asc">Asc ↑</option>
                      <option value="desc">Desc ↓</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Group By</label>
                  <select className="form-select" value={config.groupBy || ''} onChange={e => updateConfig('groupBy', e.target.value || null)}>
                    <option value="">None</option>
                    {source.columns.filter(c => c.type === 'string').map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{ marginRight: 8 }}>← Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Continue →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Schedule & Finalize</h3>

              <div className="schedule-section">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  <input type="checkbox" checked={scheduleEnabled} onChange={e => setScheduleEnabled(e.target.checked)} />
                  Enable Scheduled Execution
                </label>
                {scheduleEnabled && (
                  <div className="schedule-row">
                    <select className="form-select" style={{ width: 130 }} value={scheduleConfig.frequency}
                      onChange={e => setScheduleConfig({ ...scheduleConfig, frequency: e.target.value })}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    {scheduleConfig.frequency === 'weekly' && (
                      <select className="form-select" style={{ width: 130 }} value={scheduleConfig.day}
                        onChange={e => setScheduleConfig({ ...scheduleConfig, day: e.target.value })}>
                        {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    )}
                    <input type="time" className="form-input" style={{ width: 130 }} value={scheduleConfig.time}
                      onChange={e => setScheduleConfig({ ...scheduleConfig, time: e.target.value })} />
                  </div>
                )}
              </div>

              <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: 14, marginBottom: 12 }}>Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> {config.name || '—'}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Source:</span> {source?.name || '—'}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Columns:</span> {config.columns.length}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Filters:</span> {config.filters.length}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Sort:</span> {config.sortBy?.key || 'None'}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Group:</span> {config.groupBy || 'None'}</div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)} style={{ marginRight: 8 }}>← Back</button>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => dispatch({ type: 'CLOSE_BUILDER' })}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {editingReport ? 'Update Report' : 'Save Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
