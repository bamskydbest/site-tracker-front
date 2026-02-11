import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('admin');
  if (stored) {
    const admin = JSON.parse(stored);
    if (admin.token) {
      config.headers.Authorization = `Bearer ${admin.token}`;
    }
  }
  return config;
});

export default api;
