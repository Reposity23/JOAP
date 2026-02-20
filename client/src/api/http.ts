import axios from 'axios';

const apiBase = typeof window === 'undefined' ? 'http://localhost:4000/api' : `${window.location.origin}/api`;

export const http = axios.create({
  baseURL: apiBase,
  withCredentials: false
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
