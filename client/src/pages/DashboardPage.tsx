import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { http } from '../api/http';

type DashboardData = {
  kpis: Record<string, number>;
  sales: { date: string; amount: number }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({ kpis: {}, sales: [] });

  useEffect(() => {
    http.get('/dashboard').then((response) => setData(response.data.data));
  }, []);

  const salesPreview = useMemo(
    () => data.sales.slice(-5).map((x) => ({ day: x.date, value: x.amount })),
    [data.sales]
  );

  return (
    <div className="joap-dashboard">
      <div className="row g-3">
        <div className="col-xl-3 col-md-6">
          <div className="joap-kpi-card">
            <div>
              <p>TOTAL REVENUE</p>
              <h4>₱{Number(data.kpis.totalRevenue ?? 0).toLocaleString()}</h4>
            </div>
            <div className="kpi-icon"><i className="ri-money-dollar-circle-line" /></div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="joap-kpi-card">
            <div>
              <p>TOTAL ORDERS</p>
              <h4>{data.kpis.totalOrders ?? 0}</h4>
            </div>
            <div className="kpi-icon"><i className="ri-shopping-bag-3-line" /></div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="joap-kpi-card">
            <div>
              <p>TOTAL ITEMS</p>
              <h4>{data.kpis.totalItems ?? 0}</h4>
            </div>
            <div className="kpi-icon"><i className="ri-archive-drawer-line" /></div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="joap-kpi-card">
            <div>
              <p>PENDING PAYMENTS</p>
              <h4>{data.kpis.pendingPayments ?? 0}</h4>
            </div>
            <div className="kpi-icon"><i className="ri-time-line" /></div>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-xl-8">
          <div className="joap-panel">
            <div className="panel-head">
              <h5>REVENUE SUMMARY</h5>
              <span>Monthly</span>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={290}>
                <LineChart data={data.sales}>
                  <XAxis dataKey="date" hide={false} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#635bff" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="joap-panel slim">
            <div className="panel-head"><h5>LATEST SALES SNAPSHOT</h5></div>
            {salesPreview.length === 0 ? (
              <div className="muted">No payments yet.</div>
            ) : (
              <ul className="mini-list">
                {salesPreview.map((entry) => (
                  <li key={entry.day}>
                    <span>{entry.day}</span>
                    <strong>₱{entry.value.toLocaleString()}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
