import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, Radio, Wifi, Network, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card.js';
import Button from '../ui/Button.js';
import PhotoUploader from './PhotoUploader.js';
import WaitingApproval from './WaitingApproval.js';
import { uploadPhotos } from '../../services/photoService.js';
import { submitStep, getVisitById } from '../../services/visitService.js';
import { useSocketContext } from '../../context/SocketContext.js';
import type { Visit, Comment, InstallationType } from '../../types/index.js';

interface StepPhotosProps {
  visit: Visit;
  type: 'arrival' | 'departure';
  onApproved: (visit: Visit) => void;
  onVisitUpdate: (visit: Visit) => void;
}

interface InstallationSection {
  value: InstallationType;
  depValue: string;
  label: string;
  icon: ReactNode;
}

const INSTALLATION_SECTIONS: InstallationSection[] = [
  {
    value: 'radio-installation',
    depValue: 'radio-installation-dep',
    label: 'Radio Installation',
    icon: <Radio className="w-4 h-4" />,
  },
  {
    value: 'poe-installation',
    depValue: 'poe-installation-dep',
    label: 'POE Installation',
    icon: <Network className="w-4 h-4" />,
  },
  {
    value: 'poe-uplink',
    depValue: 'poe-uplink-dep',
    label: 'POE Uplink',
    icon: <Wifi className="w-4 h-4" />,
  },
];

export default function StepPhotos({ visit, type, onApproved, onVisitUpdate }: StepPhotosProps) {
  const stepKey = type === 'arrival' ? 'arrivalPhotos' : 'departurePhotos';
  const [awaitingApproval, setAwaitingApproval] = useState(
    visit.steps[stepKey].status === 'awaiting-approval'
  );
  const [comments, setComments] = useState<Comment[]>(visit.comments || []);
  const { socket, connected } = useSocketContext();

  // Initialise upload state from existing visit data so a page refresh
  // doesn't lose progress — and so arrival photos never bleed into departure.
  const [mainUploaded, setMainUploaded] = useState(() => {
    if (type === 'arrival') return visit.arrivalPhotos.length > 0;
    return visit.departurePhotos.length > 0;
  });

  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingInstallation, setUploadingInstallation] = useState<Record<string, boolean>>({});

  const [installationUploaded, setInstallationUploaded] = useState<Record<string, boolean>>(() => {
    const result: Record<string, boolean> = {};
    const existingPhotos = visit.installationPhotos ?? [];
    INSTALLATION_SECTIONS.forEach((section) => {
      if (!visit.installationTypes?.includes(section.value)) return;
      // Use the correct photo-type key for this phase
      const photoTypeKey = type === 'arrival' ? section.value : section.depValue;
      result[section.value] = existingPhotos.some((p) => p.type === photoTypeKey);
    });
    return result;
  });

  const [submitting, setSubmitting] = useState(false);

  // Selected installation types for this visit
  const activeInstallations = INSTALLATION_SECTIONS.filter((s) =>
    visit.installationTypes?.includes(s.value)
  );
  const hasInstallationTypes = activeInstallations.length > 0;

  // All sections complete check
  const allSectionsUploaded =
    mainUploaded &&
    (!hasInstallationTypes || activeInstallations.every((s) => installationUploaded[s.value]));

  // Sync comments when visit prop changes
  useEffect(() => {
    setComments(visit.comments || []);
  }, [visit.comments]);

  // Sync awaiting status when visit prop changes
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
        // Reset so the technician re-uploads everything from scratch
        setMainUploaded(false);
        setInstallationUploaded({});
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
  }, [socket, connected, visit._id, stepKey, onApproved, onVisitUpdate]);

  const handleMainUpload = useCallback(
    async (files: File[]) => {
      setUploadingMain(true);
      try {
        const photoType = type === 'arrival' ? 'arrival' : 'departure';
        await uploadPhotos(visit._id, files, photoType);
        setMainUploaded(true);
        if (!hasInstallationTypes) {
          setAwaitingApproval(true);
          toast.success('Photos uploaded! Waiting for admin approval.');
        } else {
          toast.success('Photos uploaded! Please complete the remaining sections below.');
        }
      } catch {
        toast.error('Failed to upload photos. Please try again.');
      } finally {
        setUploadingMain(false);
      }
    },
    [visit._id, type, hasInstallationTypes]
  );

  const handleInstallationUpload = useCallback(
    async (files: File[], section: InstallationSection) => {
      // Departure phase uses the -dep suffixed type so photos never mix with arrival
      const photoType = type === 'arrival' ? section.value : section.depValue;
      setUploadingInstallation((prev) => ({ ...prev, [section.value]: true }));
      try {
        await uploadPhotos(visit._id, files, photoType);
        setInstallationUploaded((prev) => ({ ...prev, [section.value]: true }));
        toast.success(`${section.label} photos uploaded!`);
      } catch {
        toast.error(`Failed to upload ${section.label} photos. Please try again.`);
      } finally {
        setUploadingInstallation((prev) => ({ ...prev, [section.value]: false }));
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
  const totalSections = 1 + activeInstallations.length;

  return (
    <div className="space-y-4">
      {/* ─── Main site photos ─── */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          {mainUploaded && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Step 1 of {totalSections}
          </span>
        </div>

        {mainUploaded ? (
          <div className="flex items-center gap-3 py-4 px-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-800">{stepLabel} Photos Uploaded</p>
              <p className="text-xs text-green-600">
                {hasInstallationTypes
                  ? 'Continue with the sections below.'
                  : 'Submitted to admin.'}
              </p>
            </div>
          </div>
        ) : (
          <PhotoUploader
            label={`${stepLabel} Photos`}
            onUpload={handleMainUpload}
            uploading={uploadingMain}
          />
        )}
      </Card>

      {/* ─── Installation-specific photo sections ─── */}
      {hasInstallationTypes &&
        activeInstallations.map((section, idx) => {
          const done = installationUploaded[section.value];
          const uploading = uploadingInstallation[section.value] ?? false;
          const isLocked = !mainUploaded;

          return (
            <Card key={section.value} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {done && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Step {idx + 2} of {totalSections}
                </span>
              </div>

              {isLocked ? (
                <div className="flex items-center gap-3 py-6 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <span className="flex items-center gap-2 text-gray-400">
                    {section.icon}
                    <span className="text-sm">{section.label}</span>
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    Upload {stepLabel.toLowerCase()} photos first
                  </span>
                </div>
              ) : done ? (
                <div className="flex items-center gap-3 py-4 px-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {section.label} Photos Uploaded
                    </p>
                    <p className="text-xs text-green-600">Section complete.</p>
                  </div>
                </div>
              ) : (
                <PhotoUploader
                  label={
                    <span className="flex items-center gap-2">
                      {section.icon}
                      {section.label} Photos
                    </span>
                  }
                  onUpload={(files) => handleInstallationUpload(files, section)}
                  uploading={uploading}
                />
              )}
            </Card>
          );
        })}

      {/* ─── Submit for approval (only when installation types are selected) ─── */}
      {hasInstallationTypes && (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800">
                {allSectionsUploaded
                  ? 'All sections complete — ready to submit'
                  : `${
                      (mainUploaded ? 1 : 0) +
                      activeInstallations.filter((s) => installationUploaded[s.value]).length
                    } of ${totalSections} sections uploaded`}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Complete all sections before submitting for admin approval
              </p>
            </div>
            <Button
              onClick={handleSubmitForApproval}
              loading={submitting}
              disabled={!allSectionsUploaded || submitting}
              variant="accent"
            >
              <Send className="w-4 h-4" />
              Submit for Approval
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
