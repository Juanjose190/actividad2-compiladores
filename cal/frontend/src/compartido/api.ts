import axios from 'axios';

export const clienteApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

clienteApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token_acceso');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
