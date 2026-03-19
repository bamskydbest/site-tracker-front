export const DEPARTMENTS = [
  'RF & Fibre (Transmission)',
  'Satellite & Teleport',
  'IP Core & Network',
  'Broadcast Services (DTT / DTH)',
  '4G',
  'Jubilee Project',
  'Power & Solar',
  'Systems',
  'NOC',
] as const;

export type Department = typeof DEPARTMENTS[number];

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  department?: string;
  status?: 'pending' | 'active';
  token: string;
}

export interface PendingAdmin {
  _id: string;
  name: string;
  email: string;
  department?: string;
  status: 'pending' | 'active';
  role: 'admin' | 'superadmin';
  createdAt: string;
  lastLoginAt?: string;
}

export interface StepStatus {
  status: 'pending' | 'in-progress' | 'awaiting-approval' | 'approved' | 'declined' | 'completed';
  completedAt?: string;
  declineReason?: string;
  approvedBy?: string;
}

export interface GpsLocation {
  lat: number;
  lng: number;
  address?: string;
}

export type PhotoType =
  | 'outdoor-arrival'
  | 'power-arrival'
  | 'rack-arrival'
  | 'outdoor-departure'
  | 'power-departure'
  | 'rack-departure'
  // Legacy
  | 'arrival'
  | 'departure'
  | 'radio-installation'
  | 'poe-installation'
  | 'poe-uplink'
  | 'radio-installation-dep'
  | 'poe-installation-dep'
  | 'poe-uplink-dep';

export interface Photo {
  _id: string;
  visit: string;
  url: string;
  publicId: string;
  type: PhotoType;
  caption?: string;
  uploadedAt: string;
}

export interface Comment {
  _id: string;
  visit: string;
  admin: { _id: string; name: string };
  text: string;
  step: string;
  createdAt: string;
}

export interface Visit {
  _id: string;
  technicianName: string;
  siteName: string;
  reason: string;
  department?: string;
  gpsLocation: GpsLocation;
  currentStep: 'checkIn' | 'arrivalPhotos' | 'departurePhotos' | 'complete';
  steps: {
    checkIn: StepStatus;
    arrivalPhotos: StepStatus;
    departurePhotos: StepStatus;
    complete: StepStatus;
  };
  // Legacy fields — optional so old visits still type-check
  installationTypes?: string[];
  installationPhotos?: Photo[];
  arrivalPhotos: Photo[];
  departurePhotos: Photo[];
  comments: Comment[];
  checkInTime: string;
  checkOutTime?: string;
  status: 'active' | 'awaiting-approval' | 'completed' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  total: number;
  active: number;
  awaitingApproval: number;
  completedToday: number;
}

export interface PaginatedResponse<T> {
  visits: T[];
  page: number;
  pages: number;
  total: number;
}
