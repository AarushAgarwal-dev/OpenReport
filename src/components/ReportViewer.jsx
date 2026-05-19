import { useState, useMemo } from 'react';
import { ArrowLeft, Download, Edit2, Star, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Filter, Table, BarChart2, PieChart, LineChart, Share2 } from 'lucide-react';
import { useReportContext } from '../context/ReportContext';
import { dataSources } from '../data/mockData';
import { executeReport, exportToCSV } from '../engine/reportEngine';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const PAGE_SIZE = 25;
const CHART_COLORS = ['#58a6ff', '#3fb950', '#d29922', '#f85149', '#a371f7', '#1f6feb', '#2ea043'];

function formatCell(value, colMeta) {
  if (value === null || value === undefined) return '—';
  if (colMeta?.type === 'number') {
    const num = Number(value);
    if (colMeta.key.includes('Pct') || colMeta.key === 'changePct') return `${num.toFixed(2)}%`;
    if (colMeta.key === 'volume') return num.toLocaleString();
    if (['notional', 'marketValue', 'costBasis', 'unrealizedPnl', 'amount', 'price', 'averageCost', 'marketPrice', 'vwap'].includes(colMeta.key)) {
      return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return num.toLocaleString();
  }
  return String(value);
}

function getCellClass(value, colMeta) {
  if (colMeta?.type === 'number') {
    const num = Number(value);
    if (colMeta.key.includes('Pnl') || colMeta.key === 'change' || colMeta.key === 'changePct') {
      return `cell-number ${num > 0 ? 'cell-positive' : num < 0 ? 'cell-negative' : ''}`;
    }
    return 'cell-number';
  }
  return '';
}

function StatusBadge({ value }) {
  const lower = String(value).toLowerCase();
  const classMap = { settled: 'badge-settled', paid: 'badge-settled', pending: 'badge-pending', accrued: 'badge-pending', failed: 'badge-failed', waived: 'badge-failed', partial: 'badge-partial' };
  return <span className={`cell-badge ${classMap[lower] || 'badge-partial'}`}>{value}</span>;
}

export default function ReportViewer({ onNavigate }) {
  const { state, dispatch } = useReportContext();
  const { activeReport, dataCache } = state;
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [localSort, setLocalSort] = useState(activeReport?.sortBy || { key: '', direction: 'asc' });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
  
  // Chart state
  const [chartConfig, setChartConfig] = useState({
    type: 'bar',
    xAxis: activeReport?.columns?.[0] || '',
    yAxis: activeReport?.columns?.find(c => dataSources[activeReport.dataSource]?.columns.find(meta => meta.key === c)?.type === 'number') || '',
  });

  const source = dataSources[activeReport?.dataSource];

  const result = useMemo(() => {
    if (!activeReport || !dataCache || !source) return null;
    const rawData = dataCache[activeReport.dataSource] || [];
    return executeReport(rawData, { ...activeReport, sortBy: localSort });
  }, [activeReport, dataCache, source, localSort]);

  const displayData = useMemo(() => {
    if (!result) return [];
    let data = result.data;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(q)));
    }
    return data;
  }, [result, searchTerm]);

  const totalPages = Math.ceil(displayData.length / PAGE_SIZE);
  const pagedData = displayData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const columnMeta = activeReport?.columns?.map(key => source?.columns.find(c => c.key === key)).filter(Boolean) || [];
  const numericColumns = columnMeta.filter(c => c.type === 'number');

  const handleSort = (key) => {
    setLocalSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const handleExport = () => {
    const csv = exportToCSV(displayData, activeReport.columns, source?.columns);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Report exported to CSV' } });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Link copied to clipboard!' } });
  };

  if (!activeReport || !source) {
    return (
      <div className="content-area">
        <div className="empty-state">
          <div className="empty-state-icon"><Filter size={48} /></div>
          <h3>No report selected</h3>
          <p>Select a report from the sidebar or create a new one</p>
          <button className="btn btn-primary" onClick={() => onNavigate('reports')}>Browse Reports</button>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    // If grouped, use the aggregated data for the chart, otherwise use the first 50 rows of raw display data to prevent freezing
    const chartData = result?.grouped 
      ? result.grouped.map(g => ({ [chartConfig.xAxis]: g.groupValue, [chartConfig.yAxis]: g.aggregations[`${chartConfig.yAxis}_sum`] || g.aggregations[`${chartConfig.yAxis}_avg`] || g.count }))
      : displayData.slice(0, 50);

    const CustomTooltip = ({ active, payload, label }) => {
      if (!active || !payload?.length) return null;
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px', borderRadius: '4px', fontSize: '13px' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {payload[0].name}: {typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value}
          </div>
        </div>
      );
    };

    return (
      <div>
        <div className="chart-controls">
          <div style={{ flex: 1 }}>
            <label className="form-label">Chart Type</label>
            <div className="segmented-control" style={{ display: 'flex' }}>
              <button className={`segmented-btn ${chartConfig.type === 'bar' ? 'active' : ''}`} onClick={() => setChartConfig(c => ({...c, type: 'bar'}))}><BarChart2 size={16}/> Bar</button>
              <button className={`segmented-btn ${chartConfig.type === 'line' ? 'active' : ''}`} onClick={() => setChartConfig(c => ({...c, type: 'line'}))}><LineChart size={16}/> Line</button>
              <button className={`segmented-btn ${chartConfig.type === 'pie' ? 'active' : ''}`} onClick={() => setChartConfig(c => ({...c, type: 'pie'}))}><PieChart size={16}/> Pie</button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">X-Axis (Label)</label>
            <select className="form-select" value={chartConfig.xAxis} onChange={e => setChartConfig(c => ({...c, xAxis: e.target.value}))}>
              {columnMeta.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              {result?.grouped && <option value={chartConfig.xAxis}>Group Name</option>}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Y-Axis (Value)</label>
            <select className="form-select" value={chartConfig.yAxis} onChange={e => setChartConfig(c => ({...c, yAxis: e.target.value}))}>
              {numericColumns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            {chartConfig.type === 'pie' ? (
              <RechartsPieChart>
                <Pie data={chartData} dataKey={chartConfig.yAxis} nameKey={chartConfig.xAxis} cx="50%" cy="50%" outerRadius={150} label>
                  {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RechartsPieChart>
            ) : chartConfig.type === 'line' ? (
              <RechartsLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey={chartConfig.xAxis} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey={chartConfig.yAxis} stroke="var(--accent)" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </RechartsLineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey={chartConfig.xAxis} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={chartConfig.yAxis} fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        {!result?.grouped && (
          <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-muted)', fontSize: 13 }}>
            Showing first 50 rows for visualization. Group the report to see aggregated metrics.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="content-area">
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-icon btn-ghost" onClick={() => onNavigate('reports')}><ArrowLeft size={18} /></button>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>{activeReport.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {activeReport.description} · <span style={{ color: 'var(--text-muted)' }}>{source.name}</span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-icon btn-ghost"
            onClick={handleShare}
            title="Share Report">
            <Share2 size={14} />
          </button>
          <button className="btn btn-icon btn-ghost"
            onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: activeReport.id })}
            style={{ color: activeReport.isFavorite ? 'var(--warning)' : 'var(--text-muted)' }}>
            <Star size={16} fill={activeReport.isFavorite ? 'var(--warning)' : 'none'} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => dispatch({ type: 'OPEN_BUILDER', payload: activeReport })}>
            <Edit2 size={14} /> Edit
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExport}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <div className="segmented-control">
            <button className={`segmented-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
              <Table size={14} /> Table
            </button>
            <button className={`segmented-btn ${viewMode === 'chart' ? 'active' : ''}`} onClick={() => setViewMode('chart')}>
              <BarChart2 size={14} /> Visualize
            </button>
          </div>
          
          {viewMode === 'table' && (
            <div className="search-box" style={{ marginLeft: 8 }}>
              <Search size={15} className="search-icon" />
              <input placeholder="Search in results..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
            </div>
          )}
        </div>
        <div className="toolbar-group">
          {viewMode === 'table' && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {displayData.length.toLocaleString()} of {result?.totalRows?.toLocaleString() || 0} rows
            </span>
          )}
          {activeReport.groupBy && (
            <span style={{ fontSize: 12, color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 12 }}>
              Grouped by {source.columns.find(c => c.key === activeReport.groupBy)?.label || activeReport.groupBy}
            </span>
          )}
          {activeReport.filters?.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 12 }}>
              <Filter size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
              {activeReport.filters.length} filter{activeReport.filters.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {viewMode === 'chart' ? (
        renderChart()
      ) : (
        /* Grouped view */
        result?.grouped ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {result.grouped.map(group => (
              <GroupTable
                key={group.groupValue}
                group={group}
                columns={activeReport.columns}
                columnMeta={columnMeta}
                localSort={localSort}
                onSort={handleSort}
                source={source}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Data table */}
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {columnMeta.map(col => (
                      <th key={col.key} className={localSort.key === col.key ? 'sorted' : ''} onClick={() => handleSort(col.key)}>
                        {col.label}
                        {localSort.key === col.key && (
                          <span className="sort-indicator">
                            {localSort.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map((row, i) => (
                    <tr key={i}>
                      {columnMeta.map(col => (
                        <td key={col.key} className={getCellClass(row[col.key], col)}>
                          {col.key === 'status' ? <StatusBadge value={row[col.key]} /> : formatCell(row[col.key], col)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <span>Page {page} of {totalPages} · {displayData.length} results</span>
                <div className="pagination-controls">
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}><ChevronLeft size={14} /><ChevronLeft size={14} style={{ marginLeft: -8 }} /></button>
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
                  })}
                  <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
                  <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}><ChevronRight size={14} /><ChevronRight size={14} style={{ marginLeft: -8 }} /></button>
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}

function GroupTable({ group, columns, columnMeta, localSort, onSort, source }) {
  const [expanded, setExpanded] = useState(true);
  const rows = group.rows;
  const displayRows = rows.slice(0, 20);

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="group-header" onClick={() => setExpanded(!expanded)}
        style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{group.groupValue}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.count} records</span>
        </div>
        {Object.entries(group.aggregations || {}).length > 0 && (
          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            {Object.entries(group.aggregations).map(([k, v]) => (
              <span key={k} style={{ color: 'var(--text-secondary)' }}>
                {k.replace(/_/g, ' ')}: <strong style={{ color: 'var(--text-primary)' }}>{typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v}</strong>
              </span>
            ))}
          </div>
        )}
      </div>
      {expanded && (
        <div style={{ overflow: 'auto', borderTop: '1px solid var(--border)' }}>
          <table className="data-table">
            <thead>
              <tr>
                {columnMeta.map(col => (
                  <th key={col.key} className={localSort.key === col.key ? 'sorted' : ''} onClick={() => onSort(col.key)}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, i) => (
                <tr key={i}>
                  {columnMeta.map(col => (
                    <td key={col.key} className={getCellClass(row[col.key], col)}>
                      {col.key === 'status' ? <StatusBadge value={row[col.key]} /> : formatCell(row[col.key], col)}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length > 20 && (
                <tr><td colSpan={columnMeta.length} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: 10 }}>
                  + {rows.length - 20} more rows
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
