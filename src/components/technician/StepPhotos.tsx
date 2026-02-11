import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import Card from '../ui/Card.js';
import PhotoUploader from './PhotoUploader.js';
import WaitingApproval from './WaitingApproval.js';
import { uploadPhotos } from '../../services/photoService.js';
import { getVisitById } from '../../services/visitService.js';
import { useSocketContext } from '../../context/SocketContext.js';
import type { Visit, Comment } from '../../types/index.js';

interface StepPhotosProps {
  visit: Visit;
  type: 'arrival' | 'departure';
  onApproved: (visit: Visit) => void;
  onVisitUpdate: (visit: Visit) => void;
}

export default function StepPhotos({ visit, type, onApproved, onVisitUpdate }: StepPhotosProps) {
  const [uploading, setUploading] = useState(false);
  const stepKey = type === 'arrival' ? 'arrivalPhotos' : 'departurePhotos';
  const [awaitingApproval, setAwaitingApproval] = useState(
    visit.steps[stepKey].status === 'awaiting-approval'
  );
  const [comments, setComments] = useState<Comment[]>(visit.comments || []);
  const { socket } = useSocketContext();

  // Sync comments when visit prop changes
  useEffect(() => {
    setComments(visit.comments || []);
  }, [visit.comments]);

  // Sync awaiting status when visit prop changes
  useEffect(() => {
    setAwaitingApproval(visit.steps[stepKey].status === 'awaiting-approval');
  }, [visit, stepKey]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-visit', visit._id);

    const handleApproved = (data: { visitId: string; step: string }) => {
      if (data.visitId === visit._id && data.step === stepKey) {
        setAwaitingApproval(false);
        toast.success('Photos approved! Proceeding to next step.');
        getVisitById(visit._id).then(onApproved);
      }
    };

    const handleDeclined = (data: { visitId: string; step: string; reason: string }) => {
      if (data.visitId === visit._id && data.step === stepKey) {
        setAwaitingApproval(false);
        toast.error(`Photos declined: ${data.reason}`);
        getVisitById(visit._id).then(onVisitUpdate);
      }
    };

    const handleNewComment = (data: { visitId: string; comment: Comment }) => {
      if (data.visitId === visit._id) {
        setComments((prev) => [...prev, data.comment]);
        toast('New comment from admin', { icon: '💬' });
      }
    };

    const handleVisitUpdated = (data: { visitId: string }) => {
      if (data.visitId === visit._id) {
        getVisitById(visit._id).then((v) => {
          setComments(v.comments || []);
        });
      }
    };

    socket.on('step-approved', handleApproved);
    socket.on('step-declined', handleDeclined);
    socket.on('new-comment', handleNewComment);
    socket.on('visit-updated', handleVisitUpdated);

    return () => {
      socket.off('step-approved', handleApproved);
      socket.off('step-declined', handleDeclined);
      socket.off('new-comment', handleNewComment);
      socket.off('visit-updated', handleVisitUpdated);
      socket.emit('leave-visit', visit._id);
    };
  }, [socket, visit._id, stepKey, onApproved, onVisitUpdate]);

  const handleUpload = useCallback(async (files: File[]) => {
    setUploading(true);
    try {
      await uploadPhotos(visit._id, files);
      setAwaitingApproval(true);
      toast.success('Photos uploaded! Waiting for admin approval.');
    } catch {
      toast.error('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [visit._id]);

  return (
    <Card className="p-6">
      {awaitingApproval ? (
        <WaitingApproval step={stepKey} comments={comments} />
      ) : (
        <PhotoUploader
          label={`${type === 'arrival' ? 'Arrival' : 'Departure'} Photos`}
          onUpload={handleUpload}
          uploading={uploading}
        />
      )}
    </Card>
  );
}
