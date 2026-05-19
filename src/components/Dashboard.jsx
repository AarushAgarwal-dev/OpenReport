import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, ArrowLeftRight, Briefcase, Receipt, BarChart3, DollarSign, Activity } from 'lucide-react';
import { useReportContext } from '../context/ReportContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Dashboard({ onNavigate }) {
  const { state, dispatch } = useReportContext();
  const { dataCache, savedReports } = state;

  const stats = useMemo(() => {
    if (!dataCache) return null;
    const trades = dataCache.trades || [];
    const positions = dataCache.positions || [];
    const fees = dataCache.fees || [];

    const totalNotional = trades.reduce((s, t) => s + t.notional, 0);
    const totalPnl = positions.reduce((s, p) => s + p.unrealizedPnl, 0);
    const totalFees = fees.reduce((s, f) => s + f.amount, 0);
    const totalMV = positions.reduce((s, p) => s + Math.abs(p.marketValue), 0);

    // Trades by desk
    const tradesByDesk = {};
    trades.forEach(t => { tradesByDesk[t.desk] = (tradesByDesk[t.desk] || 0) + 1; });
    const deskChart = Object.entries(tradesByDesk).map(([name, value]) => ({ name, value }));

    // PnL by asset class
    const pnlByAsset = {};
    positions.forEach(p => { pnlByAsset[p.assetClass] = (pnlByAsset[p.assetClass] || 0) + p.unrealizedPnl; });
    const pnlChart = Object.entries(pnlByAsset).map(([name, value]) => ({ name, value: Number(value.toFixed(0)) }));

    // Fee breakdown
    const feeByType = {};
    fees.forEach(f => { feeByType[f.feeType] = (feeByType[f.feeType] || 0) + f.amount; });
    const feeChart = Object.entries(feeByType).map(([name, value]) => ({ name, value: Number(value.toFixed(0)) }));

    // Recent trades (last 12 days)
    const tradeDates = {};
    trades.forEach(t => { tradeDates[t.tradeDate] = (tradeDates[t.tradeDate] || 0) + 1; });
    const volumeChart = Object.entries(tradeDates)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([date, count]) => ({ date: date.slice(5), count }));

    return { totalNotional, totalPnl, totalFees, totalMV, tradeCount: trades.length, posCount: positions.length, deskChart, pnlChart, feeChart, volumeChart };
  }, [dataCache]);

  if (!stats) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading data...</div>;

  const fmt = (n) => {
    if (Math.abs(n) >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n/1e3).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="content-area">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Dashboard</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Overview of trading activity, positions, and fees</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-accent': 'var(--gradient-1)' }}>
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}><ArrowLeftRight size={20} color="#6366f1" /></div>
          <div className="stat-value">{stats.tradeCount.toLocaleString()}</div>
          <div className="stat-label">Total Trades</div>
          <div className="stat-change positive"><TrendingUp size={12} /> +12.4% vs last month</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': 'var(--gradient-2)' }}>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}><DollarSign size={20} color="#10b981" /></div>
          <div className="stat-value">{fmt(stats.totalNotional)}</div>
          <div className="stat-label">Total Notional</div>
          <div className="stat-change positive"><TrendingUp size={12} /> +8.7% vs last month</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': stats.totalPnl >= 0 ? 'var(--gradient-2)' : 'var(--gradient-3)' }}>
          <div className="stat-icon" style={{ background: stats.totalPnl >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
            <Activity size={20} color={stats.totalPnl >= 0 ? '#10b981' : '#ef4444'} />
          </div>
          <div className="stat-value" style={{ color: stats.totalPnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>{fmt(stats.totalPnl)}</div>
          <div className="stat-label">Unrealized P&L</div>
          <div className={`stat-change ${stats.totalPnl >= 0 ? 'positive' : 'negative'}`}>
            {stats.totalPnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} YTD
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': 'var(--gradient-3)' }}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}><Receipt size={20} color="#ef4444" /></div>
          <div className="stat-value">{fmt(stats.totalFees)}</div>
          <div className="stat-label">Total Fees</div>
          <div className="stat-change negative"><TrendingDown size={12} /> -3.2% vs last month</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Trade Volume (Last 12 Days)</h3></div>
          <div className="card-body" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.volumeChart}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Trades by Desk</h3></div>
          <div className="card-body" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.deskChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                  {stats.deskChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>P&L by Asset Class</h3></div>
          <div className="card-body" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.pnlChart} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {stats.pnlChart.map((entry, i) => (
                    <Cell key={i} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Fee Breakdown</h3></div>
          <div className="card-body" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.feeChart}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {savedReports.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Recent Reports</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('reports')}>View All →</button>
          </div>
          <div className="card-body">
            <div className="reports-grid">
              {savedReports.slice(0, 4).map(report => (
                <div
                  key={report.id}
                  className="report-card"
                  onClick={() => {
                    dispatch({ type: 'SET_ACTIVE_REPORT', payload: report });
                    onNavigate('viewer');
                  }}
                >
                  <div className="report-card-header">
                    <h4>{report.name}</h4>
                    <span className="report-card-source">{report.dataSource}</span>
                  </div>
                  <p>{report.description}</p>
                  <div className="report-card-meta">
                    <span>{report.columns?.length || 0} columns</span>
                    <span>•</span>
                    <span>{report.filters?.length || 0} filters</span>
                    {report.schedule && (
                      <>
                        <span>•</span>
                        <span className="schedule-badge">⏱ {report.schedule.frequency}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
