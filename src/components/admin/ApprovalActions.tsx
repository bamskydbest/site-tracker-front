import { useState } from 'react';
import { CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button.js';
import Modal from '../ui/Modal.js';
import { approveStep, declineStep, getVisitById } from '../../services/visitService.js';
import { useAuth } from '../../context/AuthContext.js';
import type { Visit } from '../../types/index.js';

interface ApprovalActionsProps {
  visit: Visit;
  onUpdate: (visit: Visit) => void;
}

export default function ApprovalActions({ visit, onUpdate }: ApprovalActionsProps) {
  const { admin } = useAuth();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const stepStatus = visit.steps[visit.currentStep];
  if (stepStatus.status !== 'awaiting-approval') return null;

  const isExternal = visit.visitorType === 'external';
  const isSuperadmin = admin?.role === 'superadmin';
  const isDeptMatch = admin?.department === visit.department;
  const canAct = isSuperadmin || (!isExternal && isDeptMatch);

  const label = isExternal
    ? 'External visitor request awaiting superadmin approval'
    : visit.currentStep === 'arrivalPhotos'
    ? 'Arrival photos awaiting approval'
    : 'Departure photos awaiting approval';

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveStep(visit._id);
      const populated = await getVisitById(visit._id);
      toast.success(isExternal ? 'Visitor request approved!' : 'Step approved!');
      onUpdate(populated);
    } catch {
      toast.error('Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    setLoading(true);
    try {
      await declineStep(visit._id, reason);
      const populated = await getVisitById(visit._id);
      toast.success(isExternal ? 'Visitor request declined' : 'Step declined');
      setDeclining(false);
      onUpdate(populated);
    } catch {
      toast.error('Failed to decline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${isExternal ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <span className={`text-sm font-medium ${isExternal ? 'text-blue-800' : 'text-yellow-800'}`}>
          {label}
        </span>

        {canAct ? (
          <div className="flex gap-2 ml-auto">
            <Button variant="accent" size="sm" onClick={handleApprove} loading={loading}>
              <CheckCircle className="w-4 h-4" /> Approve
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeclining(true)}>
              <XCircle className="w-4 h-4" /> Decline
            </Button>
          </div>
        ) : (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldAlert className="w-3.5 h-3.5" />
            {isExternal ? 'Superadmin approval required' : 'Awaiting department head approval'}
          </div>
        )}
      </div>

      <Modal
        open={declining}
        onClose={() => setDeclining(false)}
        title={isExternal ? 'Decline Visitor Request' : 'Decline Photos'}
      >
        <div className="space-y-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isExternal ? 'Reason for declining visitor request...' : 'Reason for declining...'}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setDeclining(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDecline} loading={loading}>
              Decline
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
