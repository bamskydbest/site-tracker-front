import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, FileText, Radio, Wifi, Network } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card.js';
import Badge from '../components/ui/Badge.js';
import Spinner from '../components/ui/Spinner.js';
import PhotoGrid from '../components/ui/PhotoGrid.js';
import ApprovalActions from '../components/admin/ApprovalActions.js';
import CommentForm from '../components/admin/CommentForm.js';
import CommentList from '../components/admin/CommentList.js';
import StepTracker from '../components/technician/StepTracker.js';
import { getVisitById } from '../services/visitService.js';
import { useSocketContext } from '../context/SocketContext.js';
import type { Visit, Comment, InstallationType, Photo } from '../types/index.js';

interface InstallationMeta {
  label: string;
  arrivalType: InstallationType;
  depType: string;
  icon: ReactNode;
  badgeColor: string;
}

const INSTALLATION_META: Record<InstallationType, InstallationMeta> = {
  'radio-installation': {
    label: 'Radio Installation',
    arrivalType: 'radio-installation',
    depType: 'radio-installation-dep',
    icon: <Radio className="w-3.5 h-3.5" />,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  'poe-installation': {
    label: 'POE Installation',
    arrivalType: 'poe-installation',
    depType: 'poe-installation-dep',
    icon: <Network className="w-3.5 h-3.5" />,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  'poe-uplink': {
    label: 'POE Uplink',
    arrivalType: 'poe-uplink',
    depType: 'poe-uplink-dep',
    icon: <Wifi className="w-3.5 h-3.5" />,
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
};

function EmptyPhotoState({ title }: { title: string }) {
  return (
    <div className="text-center py-6">
      <h4 className="text-sm font-medium text-gray-700 mb-1">{title}</h4>
      <p className="text-sm text-gray-400">No photos uploaded yet</p>
    </div>
  );
}

function InstallationBadge({ meta }: { meta: InstallationMeta }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${meta.badgeColor}`}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

function PhotoSection({
  photos,
  title,
  subtitle,
  badge,
}: {
  photos: Photo[];
  title?: string;
  subtitle?: string;
  badge?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        {badge}
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>
      {photos.length > 0 ? (
        <PhotoGrid photos={photos} title={title} />
      ) : (
        <EmptyPhotoState title={title ?? 'Photos'} />
      )}
    </Card>
  );
}

export default function AdminVisitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket, connected } = useSocketContext();

  const fetchVisit = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getVisitById(id);
      setVisit(data);
    } catch {
      toast.error('Visit not found');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchVisit();
  }, [fetchVisit]);

  useEffect(() => {
    if (!socket || !id || !connected) return;
    socket.emit('join-visit', id);

    const handleUpdate = () => fetchVisit();
    socket.on('visit-updated', handleUpdate);
    socket.on('photos-uploaded', handleUpdate);

    return () => {
      socket.off('visit-updated', handleUpdate);
      socket.off('photos-uploaded', handleUpdate);
      socket.emit('leave-visit', id);
    };
  }, [socket, id, connected, fetchVisit]);

  const handleNewComment = (comment: Comment) => {
    if (visit) {
      setVisit({ ...visit, comments: [...visit.comments, comment] });
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!visit) return null;

  const installationTypes = visit.installationTypes ?? [];
  const installationPhotos = visit.installationPhotos ?? [];

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Visit Detail</h1>
          <p className="text-sm text-gray-500">ID: {visit._id}</p>
        </div>
        <Badge status={visit.status} className="ml-auto" />
      </div>

      <StepTracker visit={visit} currentStep={visit.currentStep} />
      <ApprovalActions visit={visit} onUpdate={setVisit} />

      {/* ─── Info + Comments ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Technician</span>
              <span className="ml-auto font-medium">{visit.technicianName}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Site</span>
              <span className="ml-auto font-medium">{visit.siteName}</span>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-sm text-gray-500">Reason</span>
              <span className="ml-auto text-sm text-right">{visit.reason}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-sm text-gray-500">Location</span>
              <span className="ml-auto text-sm text-right">
                {visit.gpsLocation.address ||
                  `${visit.gpsLocation.lat}, ${visit.gpsLocation.lng}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Check-in</span>
              <span className="ml-auto text-sm">
                {new Date(visit.checkInTime).toLocaleString()}
              </span>
            </div>
            {visit.checkOutTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Check-out</span>
                <span className="ml-auto text-sm">
                  {new Date(visit.checkOutTime).toLocaleString()}
                </span>
              </div>
            )}

            {/* Work Scope badges */}
            {installationTypes.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Work Scope</p>
                <div className="flex flex-wrap gap-2">
                  {installationTypes.map((type) => {
                    const meta = INSTALLATION_META[type];
                    if (!meta) return null;
                    return (
                      <span
                        key={type}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.badgeColor}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Comments</h3>
          <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
            <CommentList comments={visit.comments} />
          </div>
          <CommentForm visitId={visit._id} step={visit.currentStep} onComment={handleNewComment} />
        </Card>
      </div>

      {/* ─── Photos: LEFT = all arrival | RIGHT = all departure ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── LEFT: Arrival column ── */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Arrival
          </h2>

          {/* Site arrival photos */}
          <Card className="p-4">
            {visit.arrivalPhotos.length > 0 ? (
              <PhotoGrid photos={visit.arrivalPhotos} title="Arrival Photos" />
            ) : (
              <EmptyPhotoState title="Arrival Photos" />
            )}
          </Card>

          {/* Installation arrival photos — one card per type */}
          {installationTypes.map((type) => {
            const meta = INSTALLATION_META[type];
            if (!meta) return null;
            const photos = installationPhotos.filter((p) => p.type === meta.arrivalType);
            return (
              <PhotoSection
                key={type}
                photos={photos}
                title={meta.label}
                subtitle="Arrival"
                badge={<InstallationBadge meta={meta} />}
              />
            );
          })}
        </div>

        {/* ── RIGHT: Departure column ── */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Departure
          </h2>

          {/* Site departure photos */}
          <Card className="p-4">
            {visit.departurePhotos.length > 0 ? (
              <PhotoGrid photos={visit.departurePhotos} title="Departure Photos" />
            ) : (
              <EmptyPhotoState title="Departure Photos" />
            )}
          </Card>

          {/* Installation departure photos — one card per type */}
          {installationTypes.map((type) => {
            const meta = INSTALLATION_META[type];
            if (!meta) return null;
            const photos = installationPhotos.filter((p) => p.type === meta.depType);
            return (
              <PhotoSection
                key={type}
                photos={photos}
                title={meta.label}
                subtitle="Departure"
                badge={<InstallationBadge meta={meta} />}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
