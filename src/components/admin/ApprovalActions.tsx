import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button.js';
import Modal from '../ui/Modal.js';
import { approveStep, declineStep } from '../../services/visitService.js';
import type { Visit } from '../../types/index.js';

interface ApprovalActionsProps {
  visit: Visit;
  onUpdate: (visit: Visit) => void;
}

export default function ApprovalActions({ visit, onUpdate }: ApprovalActionsProps) {
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const stepStatus = visit.steps[visit.currentStep];
  if (stepStatus.status !== 'awaiting-approval') return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      const updated = await approveStep(visit._id);
      toast.success('Step approved!');
      onUpdate(updated);
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
      const updated = await declineStep(visit._id, reason);
      toast.success('Step declined');
      setDeclining(false);
      onUpdate(updated);
    } catch {
      toast.error('Failed to decline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <span className="text-sm font-medium text-yellow-800">
          {visit.currentStep === 'arrivalPhotos' ? 'Arrival' : 'Departure'} photos awaiting approval
        </span>
        <div className="flex gap-2 ml-auto">
          <Button variant="accent" size="sm" onClick={handleApprove} loading={loading}>
            <CheckCircle className="w-4 h-4" /> Approve
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeclining(true)}>
            <XCircle className="w-4 h-4" /> Decline
          </Button>
        </div>
      </div>

      <Modal open={declining} onClose={() => setDeclining(false)} title="Decline Photos">
        <div className="space-y-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for declining..."
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
