import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Users, Mail, Building2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card.js';
import Spinner from '../components/ui/Spinner.js';
import Badge from '../components/ui/Badge.js';
import { getAllAdmins, deleteAdminById } from '../services/authService.js';
import type { PendingAdmin } from '../types/index.js';

export default function AdminTeam() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<PendingAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    try {
      const data = await getAllAdmins();
      setAdmins(data);
    } catch {
      toast.error('Failed to load department heads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}'s access? They will no longer be able to log in.`)) return;
    setDeleting(id);
    try {
      await deleteAdminById(id);
      toast.success(`${name}'s account removed`);
      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch {
      toast.error('Failed to remove account');
    } finally {
      setDeleting(null);
    }
  };

  const active = admins.filter((a) => a.status === 'active');
  const pending = admins.filter((a) => a.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Department Heads</h1>
          <p className="text-sm text-gray-500">{active.length} active · {pending.length} pending</p>
        </div>
      </div>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : admins.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No department heads registered yet.</p>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="p-0 overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Department</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Registered</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{a.name}</td>
                    <td className="py-3 px-4 text-gray-600">{a.email}</td>
                    <td className="py-3 px-4 text-gray-600">{a.department || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {a.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(a._id, a.name)}
                        disabled={deleting === a._id}
                        className="flex items-center gap-1 ml-auto px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deleting === a._id ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {admins.map((a) => (
              <Card key={a._id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{a.name}</p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      a.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {a.status === 'active' ? 'Active' : 'Pending'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(a._id, a.name)}
                    disabled={deleting === a._id}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1.5 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    {a.email}
                  </div>
                  {a.department && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                      {a.department}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
