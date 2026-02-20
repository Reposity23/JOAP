import { useEffect, useState } from 'react';
import { http } from '../api/http';

type AccountingData = {
  accounts: Array<{ _id: string; code: string; name: string; type: string }>;
  entries: Array<{ _id: string; memo: string; debit: number; credit: number }>;
  summary: { debit?: number; credit?: number };
};

export default function AccountingPage() {
  const [data, setData] = useState<AccountingData>({ accounts: [], entries: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await http.get('/accounting');
      setData(response.data.data ?? { accounts: [], entries: [], summary: {} });
    } catch {
      setError('Unable to load accounting module.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <div className="joap-page-head"><h4>Accounting</h4></div>

      <div className="row g-3 mb-3">
        <div className="col-md-4"><div className="metric-glass"><p>Total Debit</p><h3>₱{Number(data.summary.debit ?? 0).toLocaleString()}</h3></div></div>
        <div className="col-md-4"><div className="metric-glass"><p>Total Credit</p><h3>₱{Number(data.summary.credit ?? 0).toLocaleString()}</h3></div></div>
        <div className="col-md-4"><div className="metric-glass"><p>Chart Accounts</p><h3>{data.accounts.length}</h3></div></div>
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="feature-card h-100">
            <h5>Chart of Accounts</h5>
            {loading ? <div className="state-msg">Loading chart of accounts...</div> : null}
            {error ? <div className="state-msg error">{error}</div> : null}
            <div className="account-list">
              {data.accounts.map((account) => (
                <div className="account-item" key={account._id}>
                  <strong>{account.code}</strong>
                  <span>{account.name}</span>
                  <small>{account.type}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="feature-card h-100">
            <h5>General Ledger (Append-Only)</h5>
            {loading ? <div className="state-msg">Loading ledger entries...</div> : null}
            {error ? <div className="state-msg error">{error}</div> : null}
            {!loading && !error && (
              <table className="table joap-table">
                <thead><tr><th>Memo</th><th>Debit</th><th>Credit</th><th>Action</th></tr></thead>
                <tbody>
                  {data.entries.map((entry) => (
                    <tr key={entry._id}>
                      <td>{entry.memo}</td>
                      <td>₱{Number(entry.debit).toLocaleString()}</td>
                      <td>₱{Number(entry.credit).toLocaleString()}</td>
                      <td><button className="pill-btn" onClick={async () => { await http.post(`/accounting/reverse/${entry._id}`); await load(); }}>Reverse</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
