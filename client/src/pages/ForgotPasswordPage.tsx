import { useState } from 'react';
import { http } from '../api/http';
export default function ForgotPasswordPage(){const [u,su]=useState(''); const [t,st]=useState(''); return <div className="card p-3"><h4>Forgot Password</h4><input className="form-control mb-2" value={u} onChange={e=>su(e.target.value)} placeholder='username'/><button className="btn btn-primary" onClick={async()=>{const r=await http.post('/auth/forgot-password',{username:u}); st(r.data.data.token);}}>Generate Reset Token</button>{t&&<div className='mt-2'>Use token: {t}</div>}</div>}
