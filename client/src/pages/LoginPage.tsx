import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage(){
  const {login}=useAuth(); const nav=useNavigate(); const [username,setU]=useState('admin'); const [password,setP]=useState('Admin123!'); const [e,setE]=useState('');
  const submit=async(ev:FormEvent)=>{ev.preventDefault(); try{await login(username,password); nav('/dashboard');}catch{setE('Invalid credentials');}};
  return <div className="container py-5"><form onSubmit={submit} className="card p-4 mx-auto" style={{maxWidth:420}}><h3>Login</h3>{e&&<div className="alert alert-danger">{e}</div>}<input className="form-control mb-2" value={username} onChange={x=>setU(x.target.value)} /><input className="form-control mb-2" type="password" value={password} onChange={x=>setP(x.target.value)} /><button className="btn btn-primary">Sign in</button><Link to="/forgot-password" className="mt-2">Forgot Password</Link></form></div>
}
