import { MapPin, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
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
    const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const coordsLabel = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;

    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors group"
      >
        <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-green-800 font-medium truncate">
            {location.address || coordsLabel}
          </p>
          {location.address && (
            <p className="text-xs text-green-600 mt-0.5">{coordsLabel}</p>
          )}
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-green-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }

  return null;
}
