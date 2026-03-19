import api from './api.js';
import type { Admin, PendingAdmin } from '../types/index.js';

export const loginAdmin = async (email: string, password: string): Promise<Admin> => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const getMe = async (): Promise<Admin> => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const registerAdmin = async (payload: {
  name: string;
  email: string;
  password: string;
  department: string;
}): Promise<{ message: string }> => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const getPendingAdmins = async (): Promise<PendingAdmin[]> => {
  const { data } = await api.get('/auth/pending');
  return data;
};

export const approveAdminById = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.patch(`/auth/approve/${id}`);
  return data;
};

export const rejectAdminById = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/auth/reject/${id}`);
  return data;
};

export const getAllAdmins = async (): Promise<PendingAdmin[]> => {
  const { data } = await api.get('/auth/admins');
  return data;
};

export const deleteAdminById = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/auth/admins/${id}`);
  return data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data;
};
