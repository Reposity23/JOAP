import axios from 'axios';

export const http = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: false
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
