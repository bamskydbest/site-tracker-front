import api from './api.js';
import type { Comment } from '../types/index.js';

export const addComment = async (visitId: string, text: string, step?: string): Promise<Comment> => {
  const { data } = await api.post(`/comments/${visitId}`, { text, step });
  return data;
};

export const getComments = async (visitId: string): Promise<Comment[]> => {
  const { data } = await api.get(`/comments/${visitId}`);
  return data;
};
