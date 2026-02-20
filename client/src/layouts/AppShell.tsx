import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { http } from '../api/http';

const nav = [
  ['◈', 'Dashboard', '/dashboard'],
  ['▣', 'Inventory', '/inventory'],
  ['▤', 'Inventory Logs', '/inventory/logs'],
  ['◉', 'Orders', '/orders'],
  ['＋', 'Create Order', '/orders/create'],
  ['◍', 'Billing & Payment', '/billing'],
  ['◎', 'Accounting', '/accounting'],
  ['◐', 'Reports', '/reports'],
  ['?', 'Help', '/help'],
  ['ⓘ', 'About', '/about']
] as const;

export const AppShell = () => {
  const { user, logout } = useAuth();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ type: string; name: string }[]>([]);

  const onSearch = async (value: string) => {
    setQ(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    const response = await http.get('/search', { params: { q: value } });
    setResults(response.data.data.results ?? []);
  };

  return (
    <div className="joap-shell">
      <aside className="joap-sidebar">
        <div className="joap-brand">
          <span className="brand-dot">◆</span>
          <Link to="/dashboard" className="brand-text">JOAP HARDWARE</Link>
        </div>
        <nav>
          <ul className="joap-nav">
            {nav.map(([icon, label, path]) => (
              <li key={path}>
                <NavLink to={path} className={({ isActive }) => `joap-nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">{icon}</span>
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
            {user?.role === 'ADMIN' && (
              <>
                <li><NavLink to="/admin/users" className="joap-nav-link"><span className="nav-icon">◍</span><span>Users</span></NavLink></li>
                <li><NavLink to="/maintenance" className="joap-nav-link"><span className="nav-icon">⚙</span><span>Maintenance</span></NavLink></li>
                <li><NavLink to="/settings" className="joap-nav-link"><span className="nav-icon">◔</span><span>Settings</span></NavLink></li>
                <li><NavLink to="/logs" className="joap-nav-link"><span className="nav-icon">▦</span><span>System Logs</span></NavLink></li>
              </>
            )}
          </ul>
        </nav>
      </aside>

      <main className="joap-main">
        <header className="joap-topbar">
          <div className="joap-topbar-title">Web-Based Supplier Management System</div>
          <div className="joap-topbar-right">
            <div className="joap-search-wrap">
              <span>⌕</span>
              <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Start typing..." />
            </div>
            <button onClick={logout} className="joap-logout">Logout</button>
          </div>
        </header>

        {results.length > 0 && (
          <div className="joap-search-results card">
            {results.map((item, index) => (
              <div key={`${item.type}-${index}`} className="result-row">
                <strong>{item.type}</strong>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="joap-content"><Outlet /></div>
        <footer className="joap-footer">© JOAP HARDWARE</footer>
      </main>
    </div>
  );
};
