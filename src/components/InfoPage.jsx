import { Shield, Zap, LayoutDashboard, Layers, Code2 } from 'lucide-react';

export default function InfoPage() {
  return (
    <div className="content-area">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <img src="/logo.svg" alt="OpenReport" style={{ width: 64, height: 64 }} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            OpenReport Framework MVP
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
            Empowering non-technical stakeholders with flexible financial data.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3>Project Overview</h3>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 16 }}>
              This Minimum Viable Product (MVP) provides an open-source, highly scalable, in-house reporting solution. Historically, generating flexible statements required custom engineering support.
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>
              The goal of this web-based interface is to reduce the burden of ad hoc report generation on development teams, providing operational stakeholders with meaningful ownership over their data flows.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={18} color="var(--accent)" />
                <h3>Core Capabilities</h3>
              </div>
            </div>
            <div className="card-body">
              <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <li>Pull data from trades, positions, pricing, and fees</li>
                <li>Dynamic filtering, sorting, and multi-level grouping</li>
                <li>Save, duplicate, and favorite report configurations</li>
                <li>Schedule reports for automated delivery</li>
                <li>Data visualization engine (Bar, Line, Pie charts)</li>
                <li>CSV export for downstream processing</li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Code2 size={18} color="var(--success)" />
                <h3>Tech Stack</h3>
              </div>
            </div>
            <div className="card-body">
              <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <li><strong>Frontend:</strong> React 18, Vite</li>
                <li><strong>State:</strong> React Context API (Reducer Pattern)</li>
                <li><strong>Visuals:</strong> Recharts, Lucide Icons</li>
                <li><strong>Styling:</strong> Custom CSS (Enterprise Dark Theme)</li>
                <li><strong>Mock Engine:</strong> In-memory dataset generator</li>
                <li><strong>Deployment:</strong> Vercel Serverless Edge</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} color="var(--info)" />
              <h3>Business Value & Next Steps</h3>
            </div>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12 }}>
              By centralizing these functions, the business gains a controlled, customizable environment. Strong habits around stakeholder collaboration, iterative development, and documentation have been embedded into this MVP.
            </p>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, marginTop: 16 }}>Future Roadmap:</h4>
            <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>Integration with live backend APIs and WebSocket streams</li>
              <li>Advanced permissioning (Role-Based Access Control)</li>
              <li>PDF export generation and email distribution</li>
              <li>Complex cross-dataset joins (e.g. Trades + Fees reconciliation)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
