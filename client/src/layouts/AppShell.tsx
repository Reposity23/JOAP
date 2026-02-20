import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { http } from '../api/http';

const nav = [
  ['Dashboard','/dashboard'],['Inventory','/inventory'],['Inventory Logs','/inventory/logs'],['Orders','/orders'],['Create Order','/orders/create'],
  ['Billing & Payment','/billing'],['Accounting','/accounting'],['Reports','/reports'],['Help','/help'],['About','/about']
];

export const AppShell = () => {
  const { user, logout } = useAuth();
  const [q,setQ] = useState('');
  const [results,setResults] = useState<{type:string;name:string}[]>([]);
  const onSearch = async (v:string) => { setQ(v); if (!v) return setResults([]); const r = await http.get('/search',{params:{q:v}}); setResults(r.data.data.results); };
  return (
    <div id="wrapper">
      <aside className="main-nav"><div className="logo-box p-3"><Link to="/dashboard" className="logo-dark text-white">JOAP</Link></div><ul className="navbar-nav p-2">{nav.map(([l,p])=><li key={p}><NavLink to={p} className="nav-link">{l}</NavLink></li>)}{user?.role==='ADMIN'&&<><li><NavLink to="/admin/users" className="nav-link">Users</NavLink></li><li><NavLink to="/maintenance" className="nav-link">Maintenance</NavLink></li><li><NavLink to="/settings" className="nav-link">Settings</NavLink></li><li><NavLink to="/logs" className="nav-link">System Logs</NavLink></li></>}</ul></aside>
      <main className="page-content">
        <header className="topbar p-3 bg-primary text-white d-flex justify-content-between"><div>JOAP Hardware Supplier Management</div><div className="d-flex gap-2"><input value={q} onChange={e=>onSearch(e.target.value)} placeholder="Global search" className="form-control" /><button onClick={logout} className="btn btn-light">Logout</button></div></header>
        {results.length>0&&<div className="card m-3 p-2">{results.map((r,i)=><div key={i}>{r.type}: {r.name}</div>)}</div>}
        <div className="container-fluid p-3"><Outlet /></div>
        <footer className="p-3 text-center">© JOAP HARDWARE</footer>
      </main>
    </div>
  );
};
