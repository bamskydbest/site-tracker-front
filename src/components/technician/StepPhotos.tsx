import { useState, useCallback, useEffect } from 'react';
import { CheckCircle2, Send, TreePine, Zap, Server } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card.js';
import Button from '../ui/Button.js';
import PhotoUploader from './PhotoUploader.js';
import WaitingApproval from './WaitingApproval.js';
import { uploadPhotos } from '../../services/photoService.js';
import { submitStep, getVisitById } from '../../services/visitService.js';
import { useSocketContext } from '../../context/SocketContext.js';
import type { Visit, Comment } from '../../types/index.js';

interface StepPhotosProps {
  visit: Visit;
  type: 'arrival' | 'departure';
  onApproved: (visit: Visit) => void;
  onVisitUpdate: (visit: Visit) => void;
}

const SECTIONS = [
  { key: 'outdoor', label: 'Outdoor', icon: <TreePine className="w-4 h-4" /> },
  { key: 'power',   label: 'Power',   icon: <Zap className="w-4 h-4" /> },
  { key: 'rack',    label: 'Rack',    icon: <Server className="w-4 h-4" /> },
] as const;

type SectionKey = typeof SECTIONS[number]['key'];

export default function StepPhotos({ visit, type, onApproved, onVisitUpdate }: StepPhotosProps) {
  const stepKey = type === 'arrival' ? 'arrivalPhotos' : 'departurePhotos';
  const photos = type === 'arrival' ? visit.arrivalPhotos : visit.departurePhotos;

  const [awaitingApproval, setAwaitingApproval] = useState(
    visit.steps[stepKey].status === 'awaiting-approval'
  );
  const [comments, setComments] = useState<Comment[]>(visit.comments || []);
  const { socket, connected } = useSocketContext();

  // Initialise uploaded state from existing photos (survives page refresh)
  const [sectionUploaded, setSectionUploaded] = useState<Record<SectionKey, boolean>>(() => {
    const result = { outdoor: false, power: false, rack: false };
    SECTIONS.forEach(({ key }) => {
      result[key] = photos.some((p) => p.type === `${key}-${type}`);
    });
    return result;
  });

  const [sectionUploading, setSectionUploading] = useState<Record<SectionKey, boolean>>({
    outdoor: false, power: false, rack: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const allSectionsUploaded = SECTIONS.every(({ key }) => sectionUploaded[key]);
  const uploadedCount = SECTIONS.filter(({ key }) => sectionUploaded[key]).length;

  useEffect(() => { setComments(visit.comments || []); }, [visit.comments]);
  useEffect(() => {
    setAwaitingApproval(visit.steps[stepKey].status === 'awaiting-approval');
  }, [visit, stepKey]);

  useEffect(() => {
    if (!socket || !connected) return;
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
        setSectionUploaded({ outdoor: false, power: false, rack: false });
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
        getVisitById(visit._id).then((v) => setComments(v.comments || []));
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
  }, [socket, connected, visit._id, stepKey, onApproved, onVisitUpdate]);

  const handleSectionUpload = useCallback(
    async (sectionKey: SectionKey, files: File[], caption: string) => {
      const photoType = `${sectionKey}-${type}`;
      setSectionUploading((prev) => ({ ...prev, [sectionKey]: true }));
      try {
        await uploadPhotos(visit._id, files, photoType, caption);
        setSectionUploaded((prev) => ({ ...prev, [sectionKey]: true }));
        toast.success(`${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} photos uploaded!`);
      } catch {
        toast.error(`Failed to upload ${sectionKey} photos. Please try again.`);
      } finally {
        setSectionUploading((prev) => ({ ...prev, [sectionKey]: false }));
      }
    },
    [visit._id, type]
  );

  const handleSubmitForApproval = useCallback(async () => {
    setSubmitting(true);
    try {
      await submitStep(visit._id);
      setAwaitingApproval(true);
      toast.success('All photos submitted! Waiting for admin approval.');
    } catch {
      toast.error('Failed to submit for approval. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [visit._id]);

  if (awaitingApproval) {
    return (
      <Card className="p-6">
        <WaitingApproval step={stepKey} comments={comments} />
      </Card>
    );
  }

  const stepLabel = type === 'arrival' ? 'Arrival' : 'Departure';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 px-1">
        Upload photos for all 3 sections below, then submit for admin approval.
      </p>

      {SECTIONS.map((section, idx) => {
        const done = sectionUploaded[section.key];
        const uploading = sectionUploading[section.key];

        return (
          <Card key={section.key} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {done
                ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                : <span className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-400">{idx + 1}</span>
              }
              <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                {section.icon}
                {section.label}
              </span>
              {done && <span className="ml-auto text-xs text-green-600 font-medium">Complete</span>}
            </div>

            {done ? (
              <div className="flex items-center gap-3 py-3 px-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm font-medium text-green-800">
                  {stepLabel} {section.label} photos uploaded successfully.
                </p>
              </div>
            ) : (
              <PhotoUploader
                label={`${stepLabel} — ${section.label} Photos`}
                onUpload={(files, caption) => handleSectionUpload(section.key, files, caption)}
                uploading={uploading}
              />
            )}
          </Card>
        );
      })}

      {/* Submit bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-800">
              {allSectionsUploaded
                ? 'All 3 sections complete — ready to submit for approval'
                : `${uploadedCount} of 3 sections uploaded`}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Outdoor, Power, and Rack photos are all required
            </p>
          </div>
          <Button
            onClick={handleSubmitForApproval}
            loading={submitting}
            disabled={!allSectionsUploaded || submitting}
            variant="accent"
            className="sm:flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            Submit for Approval
          </Button>
        </div>
      </Card>
    </div>
  );
}
