import { createContext, useContext, useEffect, useState } from 'react';
import { http } from '../api/http';
import type { User } from '../types';

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get('/auth/me').then((r) => setUser(r.data.data.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await http.post('/auth/login', { username, password });
    localStorage.setItem('token', res.data.data.token);
    setUser(res.data.data.user);
  };
  const logout = async () => {
    await http.post('/auth/logout');
    localStorage.removeItem('token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('missing auth provider');
  return ctx;
};
