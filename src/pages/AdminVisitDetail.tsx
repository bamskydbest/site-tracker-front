import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, FileText } from 'lucide-react';
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
import type { Visit, Comment } from '../types/index.js';

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

  return (
    <div className="space-y-6">
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
                {visit.gpsLocation.address || `${visit.gpsLocation.lat}, ${visit.gpsLocation.lng}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Check-in</span>
              <span className="ml-auto text-sm">{new Date(visit.checkInTime).toLocaleString()}</span>
            </div>
            {visit.checkOutTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Check-out</span>
                <span className="ml-auto text-sm">{new Date(visit.checkOutTime).toLocaleString()}</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          {visit.arrivalPhotos.length > 0 ? (
            <PhotoGrid photos={visit.arrivalPhotos} title="Arrival Photos" />
          ) : (
            <div className="text-center py-6">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Arrival Photos</h4>
              <p className="text-sm text-gray-400">No arrival photos uploaded yet</p>
            </div>
          )}
        </Card>
        <Card className="p-4">
          {visit.departurePhotos.length > 0 ? (
            <PhotoGrid photos={visit.departurePhotos} title="Departure Photos" />
          ) : (
            <div className="text-center py-6">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Departure Photos</h4>
              <p className="text-sm text-gray-400">No departure photos uploaded yet</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
