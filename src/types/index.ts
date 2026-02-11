export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  token: string;
}

export interface StepStatus {
  status: 'pending' | 'in-progress' | 'awaiting-approval' | 'approved' | 'declined' | 'completed';
  completedAt?: string;
  declineReason?: string;
}

export interface GpsLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Photo {
  _id: string;
  visit: string;
  url: string;
  publicId: string;
  type: 'arrival' | 'departure';
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
  gpsLocation: GpsLocation;
  currentStep: 'checkIn' | 'arrivalPhotos' | 'departurePhotos' | 'complete';
  steps: {
    checkIn: StepStatus;
    arrivalPhotos: StepStatus;
    departurePhotos: StepStatus;
    complete: StepStatus;
  };
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
