import { useState } from 'react';
import { http } from '../api/http';

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const response = await http.get('/reports', { params: { from: '2024-01-01', to: '2099-01-01' } });
      setReport(response.data.data);
    } catch {
      setError('Unable to load report data.');
    }
  };

  return (
    <div className="feature-card">
      <h4>Reports</h4>
      <div className="d-flex gap-2 mb-3">
        <button className="pill-btn solid" onClick={() => void load()}>Load</button>
        <a className="pill-btn" href="/api/reports/csv">Export CSV</a>
        <a className="pill-btn" href="/api/reports/pdf">Export PDF</a>
      </div>
      {error ? <div className="state-msg error">{error}</div> : null}
      {report ? <pre>{JSON.stringify(report.forecast, null, 2)}</pre> : <div className="state-msg">Click Load to fetch reports.</div>}
    </div>
  );
}
