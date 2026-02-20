import { useEffect, useState } from 'react';
import { http } from '../api/http';

type UserRow = { _id: string; username: string; role: 'ADMIN' | 'EMPLOYEE'; isActive: boolean };

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', role: 'EMPLOYEE' as 'ADMIN' | 'EMPLOYEE' });

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await http.get('/admin/users');
      setUsers(response.data.data ?? []);
    } catch {
      setError('Unable to load users. Admin role required.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <div className="joap-page-head"><h4>Users Administration</h4></div>

      <div className="feature-card mb-3">
        <h5>Create User</h5>
        <div className="row g-2">
          <div className="col-md-5"><input className="form-control joap-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" /></div>
          <div className="col-md-4"><select className="form-select joap-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'ADMIN' | 'EMPLOYEE' })}><option value="EMPLOYEE">EMPLOYEE</option><option value="ADMIN">ADMIN</option></select></div>
          <div className="col-md-3"><button className="pill-btn solid w-100" onClick={async () => { const response = await http.post('/admin/users', form); alert(`Temporary password: ${response.data.data.tempPassword}`); setForm({ username: '', role: 'EMPLOYEE' }); await load(); }}>Create</button></div>
        </div>
      </div>

      <div className="feature-card">
        <h5>User Directory</h5>
        {loading ? <div className="state-msg">Loading users...</div> : null}
        {error ? <div className="state-msg error">{error}</div> : null}
        {!loading && !error && (
          <table className="table joap-table">
            <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td><span className="status-chip healthy">{user.role}</span></td>
                  <td><span className={`status-chip ${user.isActive ? 'healthy' : 'critical'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="d-flex gap-2">
                    <button className="pill-btn" onClick={async () => { await http.patch(`/admin/users/${user._id}/status`, { isActive: !user.isActive }); await load(); }}>Toggle Active</button>
                    <button className="pill-btn" onClick={async () => { await http.patch(`/admin/users/${user._id}/role`, { role: user.role === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN' }); await load(); }}>Switch Role</button>
                    <button className="pill-btn" onClick={async () => { const response = await http.post(`/admin/users/${user._id}/reset-password`); alert(`Temporary password: ${response.data.data.tempPassword}`); }}>Reset Password</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
