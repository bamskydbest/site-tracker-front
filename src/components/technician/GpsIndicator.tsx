import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import type { GpsLocation } from '../../types/index.js';

interface GpsIndicatorProps {
  location: GpsLocation | null;
  loading: boolean;
  error: string | null;
}

export default function GpsIndicator({ location, loading, error }: GpsIndicatorProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
        Detecting GPS location...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 p-3 bg-red-50 rounded-lg">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );
  }

  if (location) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 p-3 bg-green-50 rounded-lg">
        <MapPin className="w-4 h-4" />
        <span className="truncate">{location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}</span>
      </div>
    );
  }

  return null;
}
