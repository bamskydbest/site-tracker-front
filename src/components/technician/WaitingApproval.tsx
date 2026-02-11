import { Clock, MessageSquare } from 'lucide-react';
import type { Comment } from '../../types/index.js';

interface WaitingApprovalProps {
  step: string;
  comments: Comment[];
}

export default function WaitingApproval({ step, comments }: WaitingApprovalProps) {
  const stepComments = comments.filter((c) => c.step === step);

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="w-8 h-8 text-yellow-600 animate-pulse" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Awaiting Admin Approval</h3>
      <p className="text-sm text-gray-500 mb-6">
        Your {step === 'arrivalPhotos' ? 'arrival' : 'departure'} photos are being reviewed.
      </p>

      {stepComments.length > 0 && (
        <div className="text-left max-w-md mx-auto">
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4" />
            Admin Comments
          </div>
          <div className="space-y-2">
            {stepComments.map((comment) => (
              <div key={comment._id} className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="font-medium text-gray-900">{typeof comment.admin === 'object' ? comment.admin?.name : 'Admin'}</div>
                <div className="text-gray-600">{comment.text}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
