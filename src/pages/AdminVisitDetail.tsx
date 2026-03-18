import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, FileText, TreePine, Zap, Server, Users, User2 } from 'lucide-react';
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
import type { Visit, Comment, Photo } from '../types/index.js';

const NEW_SECTIONS = [
  { key: 'outdoor', label: 'Outdoor', icon: <TreePine className="w-4 h-4" /> },
  { key: 'power',   label: 'Power',   icon: <Zap className="w-4 h-4" /> },
  { key: 'rack',    label: 'Rack',    icon: <Server className="w-4 h-4" /> },
] as const;

function EmptyPhotoState({ title }: { title: string }) {
  return (
    <div className="text-center py-6">
      <p className="text-sm text-gray-400">{title} — no photos yet</p>
    </div>
  );
}

function SectionCard({
  label,
  icon,
  photos,
}: {
  label: string;
  icon: ReactNode;
  photos: Photo[];
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-500">{icon}</span>
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        {photos.length > 0 && (
          <span className="ml-auto text-xs text-gray-400">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      {photos.length > 0 ? (
        <PhotoGrid photos={photos} />
      ) : (
        <EmptyPhotoState title={label} />
      )}
    </Card>
  );
}

function ApprovedByBadge({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
      <User2 className="w-3.5 h-3.5 flex-shrink-0" />
      Approved by <span className="font-semibold">{name}</span>
    </div>
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

  // Detect new-style visit (Outdoor/Power/Rack sections)
  const isNewVisit = visit.arrivalPhotos.some((p) =>
    ['outdoor-arrival', 'power-arrival', 'rack-arrival'].includes(p.type)
  );

  const installationPhotos = visit.installationPhotos ?? [];
  const arrivalApprovedBy = visit.steps.arrivalPhotos.approvedBy;
  const departureApprovedBy = visit.steps.departurePhotos.approvedBy;

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
            {visit.department && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Department</span>
                <span className="ml-auto font-medium">{visit.department}</span>
              </div>
            )}
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
            {/* Approval info */}
            {(arrivalApprovedBy || departureApprovedBy) && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                {arrivalApprovedBy && <ApprovedByBadge name={`Arrival — ${arrivalApprovedBy}`} />}
                {departureApprovedBy && <ApprovedByBadge name={`Departure — ${departureApprovedBy}`} />}
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

      {/* ─── Photos ─── */}
      {isNewVisit ? (
        /* New layout: Outdoor / Power / Rack per column */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Arrival column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Arrival</h2>
              {arrivalApprovedBy && <ApprovedByBadge name={arrivalApprovedBy} />}
            </div>
            {NEW_SECTIONS.map(({ key, label, icon }) => (
              <SectionCard
                key={`${key}-arrival`}
                label={label}
                icon={icon}
                photos={visit.arrivalPhotos.filter((p) => p.type === `${key}-arrival`)}
              />
            ))}
          </div>

          {/* Departure column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Departure</h2>
              {departureApprovedBy && <ApprovedByBadge name={departureApprovedBy} />}
            </div>
            {NEW_SECTIONS.map(({ key, label, icon }) => (
              <SectionCard
                key={`${key}-departure`}
                label={label}
                icon={icon}
                photos={visit.departurePhotos.filter((p) => p.type === `${key}-departure`)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Legacy layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Arrival</h2>
            <Card className="p-4">
              {visit.arrivalPhotos.length > 0 ? (
                <PhotoGrid photos={visit.arrivalPhotos} title="Arrival Photos" />
              ) : (
                <EmptyPhotoState title="Arrival Photos" />
              )}
            </Card>
            {installationPhotos.filter((p) => !p.type.endsWith('-dep')).length > 0 && (
              <Card className="p-4">
                <PhotoGrid
                  photos={installationPhotos.filter((p) => !p.type.endsWith('-dep'))}
                  title="Installation Photos"
                />
              </Card>
            )}
          </div>
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Departure</h2>
            <Card className="p-4">
              {visit.departurePhotos.length > 0 ? (
                <PhotoGrid photos={visit.departurePhotos} title="Departure Photos" />
              ) : (
                <EmptyPhotoState title="Departure Photos" />
              )}
            </Card>
            {installationPhotos.filter((p) => p.type.endsWith('-dep')).length > 0 && (
              <Card className="p-4">
                <PhotoGrid
                  photos={installationPhotos.filter((p) => p.type.endsWith('-dep'))}
                  title="Installation Photos (Departure)"
                />
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
