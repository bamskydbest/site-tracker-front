import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, MapPin, Building2, Mail } from 'lucide-react';
import Card from '../ui/Card.js';
import Button from '../ui/Button.js';
import { useSocketContext } from '../../context/SocketContext.js';
import type { Visit } from '../../types/index.js';

type ApprovalState = 'waiting' | 'approved' | 'declined';

interface ExternalWaitingProps {
  visit: Visit;
  onNewVisit: () => void;
}

export default function ExternalWaiting({ visit, onNewVisit }: ExternalWaitingProps) {
  const { socket, connected } = useSocketContext();

  const [state, setState] = useState<ApprovalState>(() => {
    if (visit.status === 'completed') return 'approved';
    if (visit.status === 'declined') return 'declined';
    return 'waiting';
  });
  const [declineReason, setDeclineReason] = useState(
    visit.steps.arrivalPhotos.declineReason || ''
  );

  useEffect(() => {
    if (!socket || !connected) return;
    socket.emit('join-visit', visit._id);

    const handleApproved = (data: { visitId: string }) => {
      if (data.visitId === visit._id) setState('approved');
    };

    const handleDeclined = (data: { visitId: string; reason: string }) => {
      if (data.visitId === visit._id) {
        setState('declined');
        setDeclineReason(data.reason || '');
      }
    };

    const handleVisitUpdated = (data: { visitId: string; visit: Visit }) => {
      if (data.visitId !== visit._id) return;
      const v = data.visit;
      if (v.status === 'completed') setState('approved');
      if (v.status === 'declined') {
        setState('declined');
        setDeclineReason(v.steps.arrivalPhotos.declineReason || '');
      }
    };

    socket.on('step-approved', handleApproved);
    socket.on('step-declined', handleDeclined);
    socket.on('visit-updated', handleVisitUpdated);

    return () => {
      socket.off('step-approved', handleApproved);
      socket.off('step-declined', handleDeclined);
      socket.off('visit-updated', handleVisitUpdated);
      socket.emit('leave-visit', visit._id);
    };
  }, [socket, connected, visit._id]);

  return (
    <Card className="p-6">
      {/* Status banner */}
      {state === 'waiting' && (
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Request Submitted</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Your visit request is awaiting superadmin approval. You will be notified by email once a decision is made.
          </p>
        </div>
      )}

      {state === 'approved' && (
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Request Approved</h2>
          <p className="text-green-700 mt-1 text-sm font-medium">
            You have been approved to access the site. Please proceed.
          </p>
        </div>
      )}

      {state === 'declined' && (
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Request Declined</h2>
          {declineReason && (
            <p className="text-red-600 mt-1 text-sm">Reason: {declineReason}</p>
          )}
          <p className="text-gray-500 mt-1 text-sm">
            Please contact the relevant department for further assistance.
          </p>
        </div>
      )}

      {/* Visit summary */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Organisation</p>
            <p className="text-sm font-medium">{visit.companyName || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Site</p>
            <p className="text-sm font-medium">{visit.siteName}</p>
          </div>
        </div>
        {visit.contactEmail && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Notification email</p>
              <p className="text-sm font-medium">{visit.contactEmail}</p>
            </div>
          </div>
        )}
      </div>

      {(state === 'approved' || state === 'declined') && (
        <Button onClick={onNewVisit} className="w-full" size="lg" variant="accent">
          Submit Another Request
        </Button>
      )}
    </Card>
  );
}
