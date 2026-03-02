import { CheckCircle, MapPin, Clock, Radio, Network, Wifi } from 'lucide-react';
import Card from '../ui/Card.js';
import PhotoGrid from '../ui/PhotoGrid.js';
import Button from '../ui/Button.js';
import type { Visit, InstallationType, Photo } from '../../types/index.js';
import type { ReactNode } from 'react';

interface StepCompleteProps {
  visit: Visit;
  onNewVisit: () => void;
}

interface PhotoSection {
  key: string;
  title: string;
  icon: ReactNode;
  photos: Photo[];
}

// Map installation types to display info and photo type keys
const INSTALLATION_DISPLAY: Record<
  InstallationType,
  { label: string; icon: ReactNode; arrivalType: InstallationType; depType: string }
> = {
  'radio-installation': {
    label: 'Radio Installation',
    icon: <Radio className="w-4 h-4" />,
    arrivalType: 'radio-installation',
    depType: 'radio-installation-dep',
  },
  'poe-installation': {
    label: 'POE Installation',
    icon: <Network className="w-4 h-4" />,
    arrivalType: 'poe-installation',
    depType: 'poe-installation-dep',
  },
  'poe-uplink': {
    label: 'POE Uplink',
    icon: <Wifi className="w-4 h-4" />,
    arrivalType: 'poe-uplink',
    depType: 'poe-uplink-dep',
  },
};

export default function StepComplete({ visit, onNewVisit }: StepCompleteProps) {
  const installationTypes = visit.installationTypes ?? [];
  const installationPhotos = visit.installationPhotos ?? [];

  // Build ordered list of photo sections to display
  const photoSections: PhotoSection[] = [];

  // 1. Arrival site photos
  if (visit.arrivalPhotos.length > 0) {
    photoSections.push({
      key: 'arrival',
      title: 'Arrival Photos',
      icon: <MapPin className="w-4 h-4" />,
      photos: visit.arrivalPhotos,
    });
  }

  // 2. Arrival installation photos (one section per selected type)
  installationTypes.forEach((type) => {
    const display = INSTALLATION_DISPLAY[type];
    if (!display) return;
    const photos = installationPhotos.filter((p) => p.type === display.arrivalType);
    if (photos.length > 0) {
      photoSections.push({
        key: `${type}-arrival`,
        title: `${display.label} — Arrival`,
        icon: display.icon,
        photos,
      });
    }
  });

  // 3. Departure site photos
  if (visit.departurePhotos.length > 0) {
    photoSections.push({
      key: 'departure',
      title: 'Departure Photos',
      icon: <MapPin className="w-4 h-4" />,
      photos: visit.departurePhotos,
    });
  }

  // 4. Departure installation photos
  installationTypes.forEach((type) => {
    const display = INSTALLATION_DISPLAY[type];
    if (!display) return;
    const photos = installationPhotos.filter((p) => p.type === display.depType);
    if (photos.length > 0) {
      photoSections.push({
        key: `${type}-departure`,
        title: `${display.label} — Departure`,
        icon: display.icon,
        photos,
      });
    }
  });

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-900">Visit Complete!</h2>
        <p className="text-gray-500">All steps have been completed successfully.</p>
      </div>

      <div className="space-y-4">
        {/* Visit summary */}
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
            <div className="text-sm">
              {visit.gpsLocation.address ||
                `${visit.gpsLocation.lat}, ${visit.gpsLocation.lng}`}
            </div>
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

        {/* All photo sections in order */}
        {photoSections.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            {photoSections.map((section) => (
              <div key={section.key}>
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                  {section.icon}
                  {section.title}
                  <span className="ml-auto text-xs font-normal text-gray-400">
                    {section.photos.length} photo{section.photos.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <PhotoGrid photos={section.photos} />
              </div>
            ))}
          </div>
        )}

        <Button onClick={onNewVisit} className="w-full" size="lg" variant="accent">
          Start New Visit
        </Button>
      </div>
    </Card>
  );
}
