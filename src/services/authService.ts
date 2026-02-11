import api from './api.js';
import type { Admin } from '../types/index.js';

export const loginAdmin = async (email: string, password: string): Promise<Admin> => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const getMe = async (): Promise<Admin> => {
  const { data } = await api.get('/auth/me');
  return data;
};
