import api from './api.js';
import type { Visit, PaginatedResponse, GpsLocation } from '../types/index.js';

interface VisitFilters {
  page?: number;
  limit?: number;
  status?: string;
  step?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const createVisit = async (data: {
  technicianName: string;
  siteName: string;
  gpsLocation: GpsLocation;
}): Promise<Visit> => {
  const { data: visit } = await api.post('/visits', data);
  return visit;
};

export const getVisits = async (filters: VisitFilters = {}): Promise<PaginatedResponse<Visit>> => {
  const { data } = await api.get('/visits', { params: filters });
  return data;
};

export const getVisitById = async (id: string): Promise<Visit> => {
  const { data } = await api.get(`/visits/${id}`);
  return data;
};

export const advanceStep = async (id: string): Promise<Visit> => {
  const { data } = await api.patch(`/visits/${id}/step`);
  return data;
};

export const approveStep = async (id: string): Promise<Visit> => {
  const { data } = await api.patch(`/visits/${id}/approve`);
  return data;
};

export const declineStep = async (id: string, reason: string): Promise<Visit> => {
  const { data } = await api.patch(`/visits/${id}/decline`, { reason });
  return data;
};
