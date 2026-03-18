import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card.js';
import Spinner from '../ui/Spinner.js';
import { getPendingAdmins, approveAdminById, rejectAdminById } from '../../services/authService.js';
import type { PendingAdmin } from '../../types/index.js';

export default function PendingApprovals() {
  const [pending, setPending] = useState<PendingAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, 'approve' | 'reject' | null>>({});

  const fetchPending = useCallback(async () => {
    try {
      const data = await getPendingAdmins();
      setPending(data);
    } catch {
      // Silent — superadmin only endpoint
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id: string, name: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'approve' }));
    try {
      await approveAdminById(id);
      toast.success(`${name}'s account approved`);
      setPending((prev) => prev.filter((a) => a._id !== id));
    } catch {
      toast.error('Failed to approve account');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm(`Reject ${name}'s registration? This cannot be undone.`)) return;
    setActionLoading((prev) => ({ ...prev, [id]: 'reject' }));
    try {
      await rejectAdminById(id);
      toast.success(`${name}'s registration rejected`);
      setPending((prev) => prev.filter((a) => a._id !== id));
    } catch {
      toast.error('Failed to reject registration');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  if (loading) return <Spinner size="sm" className="py-4" />;
  if (pending.length === 0) return null;

  return (
    <Card className="p-4 border-l-4 border-l-amber-400 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-amber-500" />
        <h2 className="text-base font-semibold text-gray-900">Pending Department Head Approvals</h2>
        <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
          {pending.length} pending
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Name</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Email</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Department</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Registered</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((a) => {
              const busy = !!actionLoading[a._id];
              return (
                <tr key={a._id} className="border-b border-gray-50">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{a.name}</td>
                  <td className="py-2.5 px-3 text-gray-600">{a.email}</td>
                  <td className="py-2.5 px-3 text-gray-600">{a.department || '—'}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApprove(a._id, a.name)}
                        disabled={busy}
                        className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(a._id, a.name)}
                        disabled={busy}
                        className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {pending.map((a) => {
          const busy = !!actionLoading[a._id];
          return (
            <div key={a._id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.email}</p>
                  {a.department && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      <Users className="w-3 h-3 inline mr-1" />{a.department}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleApprove(a._id, a.name)}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => handleReject(a._id, a.name)}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
