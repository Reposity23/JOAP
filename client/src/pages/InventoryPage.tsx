import { useEffect, useMemo, useState } from 'react';
import { http } from '../api/http';

type Item = { _id: string; name: string; stock: number; price: number; threshold: number };

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', price: 0, threshold: 10 });

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await http.get('/inventory/items');
      setItems(response.data.data ?? []);
    } catch (e) {
      setError('Unable to load inventory. Check API connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const kpis = useMemo(() => {
    const totalItems = items.length;
    const critical = items.filter((x) => x.stock <= 0).length;
    const low = items.filter((x) => x.stock > 0 && x.stock <= x.threshold).length;
    const value = items.reduce((a, b) => a + b.stock * b.price, 0);
    return { totalItems, critical, low, value };
  }, [items]);

  return (
    <div>
      <div className="joap-page-head">
        <h4>Inventory Management</h4>
        <div className="action-pills">
          <a href="/api/inventory/export/csv" className="pill-btn">Export CSV</a>
          <button className="pill-btn solid" onClick={() => void load()}>Refresh</button>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-3"><div className="metric-glass"><p>Total Items</p><h3>{kpis.totalItems}</h3></div></div>
        <div className="col-md-3"><div className="metric-glass"><p>Critical Stock</p><h3>{kpis.critical}</h3></div></div>
        <div className="col-md-3"><div className="metric-glass"><p>Low Stock</p><h3>{kpis.low}</h3></div></div>
        <div className="col-md-3"><div className="metric-glass"><p>Total Value</p><h3>₱{kpis.value.toLocaleString()}</h3></div></div>
      </div>

      <div className="feature-card mb-3">
        <h5>Create Item</h5>
        <div className="row g-2">
          <div className="col-md-4"><input className="form-control joap-input" placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-md-3"><input className="form-control joap-input" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
          <div className="col-md-3"><input className="form-control joap-input" type="number" placeholder="Threshold" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} /></div>
          <div className="col-md-2"><button className="pill-btn solid w-100" onClick={async () => { await http.post('/inventory/items', form); setForm({ name: '', price: 0, threshold: 10 }); await load(); }}>Save Item</button></div>
        </div>
      </div>

      <div className="feature-card">
        <h5>Stock List</h5>
        {loading ? <div className="state-msg">Loading inventory...</div> : null}
        {error ? <div className="state-msg error">{error}</div> : null}
        {!loading && !error && (
          <table className="table joap-table">
            <thead><tr><th>Item</th><th>Price</th><th>Stock</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {items.map((item) => {
                const status = item.stock <= 0 ? 'Critical' : item.stock <= item.threshold ? 'Low' : 'Healthy';
                return (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>₱{Number(item.price).toLocaleString()}</td>
                    <td>{item.stock}</td>
                    <td><span className={`status-chip ${status.toLowerCase()}`}>{status}</span></td>
                    <td><button className="pill-btn" onClick={async () => { await http.post('/inventory/adjust', { itemId: item._id, delta: 1, reason: 'manual' }); await load(); }}>Adjust +1</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
