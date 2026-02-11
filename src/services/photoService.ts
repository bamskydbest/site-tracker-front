import api from './api.js';
import type { Photo } from '../types/index.js';

export const uploadPhotos = async (visitId: string, files: File[]): Promise<Photo[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));

  const { data } = await api.post(`/photos/${visitId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deletePhoto = async (photoId: string): Promise<void> => {
  await api.delete(`/photos/${photoId}`);
};
