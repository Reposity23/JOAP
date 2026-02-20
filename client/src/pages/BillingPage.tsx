import { useEffect, useState } from 'react';
import { http } from '../api/http';

type BillingData = {
  kpis: Record<string, number>;
  orders: Array<{ _id: string; trackingNo: string; status: string; total: number }>;
};

export default function BillingPage() {
  const [data, setData] = useState<BillingData>({ kpis: {}, orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [payment, setPayment] = useState({ orderId: '', amount: 0, gcashRef: '' });

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await http.get('/billing');
      setData(response.data.data ?? { kpis: {}, orders: [] });
    } catch {
      setError('Unable to load billing data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <div className="joap-page-head"><h4>Billing & Payment</h4></div>

      <div className="row g-3 mb-3">
        <div className="col-md-3"><div className="metric-glass"><p>Pending Payment</p><h3>{data.kpis.pendingPayment ?? 0}</h3></div></div>
        <div className="col-md-3"><div className="metric-glass"><p>Paid Today</p><h3>₱{Number(data.kpis.paidToday ?? 0).toLocaleString()}</h3></div></div>
        <div className="col-md-3"><div className="metric-glass"><p>Ready To Release</p><h3>{data.kpis.readyToRelease ?? 0}</h3></div></div>
        <div className="col-md-3"><div className="metric-glass"><p>Total Revenue</p><h3>₱{Number(data.kpis.totalRevenue ?? 0).toLocaleString()}</h3></div></div>
      </div>

      <div className="feature-card mb-3">
        <h5>Log Payment</h5>
        <div className="row g-2">
          <div className="col-md-4">
            <select className="form-select joap-input" value={payment.orderId} onChange={(e) => setPayment({ ...payment, orderId: e.target.value })}>
              <option value="">Select order</option>
              {data.orders.map((order) => <option key={order._id} value={order._id}>{order.trackingNo} - ₱{order.total}</option>)}
            </select>
          </div>
          <div className="col-md-3"><input className="form-control joap-input" type="number" placeholder="Amount" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: Number(e.target.value) })} /></div>
          <div className="col-md-3"><input className="form-control joap-input" placeholder="GCash Ref" value={payment.gcashRef} onChange={(e) => setPayment({ ...payment, gcashRef: e.target.value })} /></div>
          <div className="col-md-2"><button className="pill-btn solid w-100" onClick={async () => { try { await http.post('/billing/payments', payment); setMessage('Payment logged successfully.'); setPayment({ orderId: '', amount: 0, gcashRef: '' }); await load(); } catch { setMessage('Payment failed. Check amount/reference.'); } }}>Submit</button></div>
        </div>
        {message ? <div className="state-msg">{message}</div> : null}
      </div>

      <div className="feature-card">
        <h5>Order Payment Queue</h5>
        {loading ? <div className="state-msg">Loading billing records...</div> : null}
        {error ? <div className="state-msg error">{error}</div> : null}
        {!loading && !error && (
          <table className="table joap-table">
            <thead><tr><th>Tracking No</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>{data.orders.map((order) => <tr key={order._id}><td>{order.trackingNo}</td><td><span className="status-chip healthy">{order.status}</span></td><td>₱{Number(order.total).toLocaleString()}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
