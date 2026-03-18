import { CheckCircle, MapPin, Clock, TreePine, Zap, Server, User2 } from 'lucide-react';
import type { ReactNode } from 'react';
import Card from '../ui/Card.js';
import PhotoGrid from '../ui/PhotoGrid.js';
import Button from '../ui/Button.js';
import type { Visit, Photo } from '../../types/index.js';

interface StepCompleteProps {
  visit: Visit;
  onNewVisit: () => void;
}

const NEW_SECTIONS = [
  { key: 'outdoor', label: 'Outdoor', icon: <TreePine className="w-4 h-4" /> },
  { key: 'power',   label: 'Power',   icon: <Zap className="w-4 h-4" /> },
  { key: 'rack',    label: 'Rack',    icon: <Server className="w-4 h-4" /> },
] as const;

function SectionPhotos({ label, icon, photos }: { label: string; icon: ReactNode; photos: Photo[] }) {
  if (photos.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
        {icon}
        {label}
        <span className="ml-auto text-xs font-normal text-gray-400">
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </span>
      </div>
      <PhotoGrid photos={photos} />
    </div>
  );
}

export default function StepComplete({ visit, onNewVisit }: StepCompleteProps) {
  // Detect new-style visit (sections: outdoor/power/rack)
  const isNewVisit = visit.arrivalPhotos.some((p) =>
    ['outdoor-arrival', 'power-arrival', 'rack-arrival'].includes(p.type)
  );

  const installationPhotos = visit.installationPhotos ?? [];
  const arrivalApprovedBy = visit.steps.arrivalPhotos.approvedBy;
  const departureApprovedBy = visit.steps.departurePhotos.approvedBy;

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

        {visit.department && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Department</div>
            <div className="font-medium">{visit.department}</div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Reason for Visit</div>
          <div className="font-medium">{visit.reason}</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <div className="text-xs text-gray-500">Location</div>
            <div className="text-sm">
              {visit.gpsLocation.address || `${visit.gpsLocation.lat}, ${visit.gpsLocation.lng}`}
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

        {/* Approved-by row */}
        {(arrivalApprovedBy || departureApprovedBy) && (
          <div className="grid grid-cols-2 gap-4">
            {arrivalApprovedBy && (
              <div className="bg-green-50 rounded-lg p-3 flex items-start gap-2">
                <User2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-green-600">Arrival approved by</div>
                  <div className="text-sm font-medium text-green-800">{arrivalApprovedBy}</div>
                </div>
              </div>
            )}
            {departureApprovedBy && (
              <div className="bg-green-50 rounded-lg p-3 flex items-start gap-2">
                <User2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-green-600">Departure approved by</div>
                  <div className="text-sm font-medium text-green-800">{departureApprovedBy}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Photos */}
        {isNewVisit ? (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Arrival Photos</p>
            {NEW_SECTIONS.map(({ key, label, icon }) => (
              <SectionPhotos
                key={`${key}-arrival`}
                label={label}
                icon={icon}
                photos={visit.arrivalPhotos.filter((p) => p.type === `${key}-arrival`)}
              />
            ))}
            <p className="text-sm font-semibold text-gray-700 pt-2 border-t border-gray-100">Departure Photos</p>
            {NEW_SECTIONS.map(({ key, label, icon }) => (
              <SectionPhotos
                key={`${key}-departure`}
                label={label}
                icon={icon}
                photos={visit.departurePhotos.filter((p) => p.type === `${key}-departure`)}
              />
            ))}
          </div>
        ) : (
          /* Legacy photo layout */
          <div className="space-y-4 pt-2 border-t border-gray-100">
            {visit.arrivalPhotos.length > 0 && (
              <SectionPhotos
                label="Arrival Photos"
                icon={<MapPin className="w-4 h-4" />}
                photos={visit.arrivalPhotos}
              />
            )}
            {installationPhotos.length > 0 && (
              <SectionPhotos
                label="Installation Photos"
                icon={<MapPin className="w-4 h-4" />}
                photos={installationPhotos}
              />
            )}
            {visit.departurePhotos.length > 0 && (
              <SectionPhotos
                label="Departure Photos"
                icon={<MapPin className="w-4 h-4" />}
                photos={visit.departurePhotos}
              />
            )}
          </div>
        )}

        <Button onClick={onNewVisit} className="w-full" size="lg" variant="accent">
          Start New Visit
        </Button>
      </div>
    </Card>
  );
}
