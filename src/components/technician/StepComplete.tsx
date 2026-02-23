import { CheckCircle, MapPin, Clock, Camera } from 'lucide-react';
import Card from '../ui/Card.js';
import PhotoGrid from '../ui/PhotoGrid.js';
import Button from '../ui/Button.js';
import type { Visit } from '../../types/index.js';

interface StepCompleteProps {
  visit: Visit;
  onNewVisit: () => void;
}

export default function StepComplete({ visit, onNewVisit }: StepCompleteProps) {
  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-900">Visit Complete!</h2>
        <p className="text-gray-500">All steps have been completed successfully.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Technician</div>
            <div className="font-medium">{visit.technicianName}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Site</div>
            <div className="font-medium">{visit.siteName}</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Reason for Visit</div>
          <div className="font-medium">{visit.reason}</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <div className="text-xs text-gray-500">Location</div>
            <div className="text-sm">{visit.gpsLocation.address || `${visit.gpsLocation.lat}, ${visit.gpsLocation.lng}`}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-2">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500">Check-in</div>
              <div className="text-sm">{new Date(visit.checkInTime).toLocaleString()}</div>
            </div>
          </div>
          {visit.checkOutTime && (
            <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500">Check-out</div>
                <div className="text-sm">{new Date(visit.checkOutTime).toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>

        {visit.arrivalPhotos.length > 0 && (
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
              <Camera className="w-4 h-4" /> Arrival Photos
            </div>
            <PhotoGrid photos={visit.arrivalPhotos} />
          </div>
        )}

        {visit.departurePhotos.length > 0 && (
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
              <Camera className="w-4 h-4" /> Departure Photos
            </div>
            <PhotoGrid photos={visit.departurePhotos} />
          </div>
        )}

        <Button onClick={onNewVisit} className="w-full" size="lg" variant="accent">
          Start New Visit
        </Button>
      </div>
    </Card>
  );
}
