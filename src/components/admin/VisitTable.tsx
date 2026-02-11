import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge.js';
import EmptyState from '../ui/EmptyState.js';
import type { Visit } from '../../types/index.js';

interface VisitTableProps {
  visits: Visit[];
  loading: boolean;
}

export default function VisitTable({ visits, loading }: VisitTableProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!visits.length) {
    return <EmptyState title="No visits found" description="No visits match your current filters." />;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Technician</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Site</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Step</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-gray-900">{visit.technicianName}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{visit.siteName}</td>
                <td className="py-3 px-4"><Badge status={visit.currentStep} /></td>
                <td className="py-3 px-4"><Badge status={visit.status} /></td>
                <td className="py-3 px-4 text-sm text-gray-500">{new Date(visit.checkInTime).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => navigate(`/admin/visits/${visit._id}`)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {visits.map((visit) => (
          <div
            key={visit._id}
            onClick={() => navigate(`/admin/visits/${visit._id}`)}
            className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{visit.technicianName}</span>
              <Badge status={visit.status} />
            </div>
            <div className="text-sm text-gray-600 mb-1">{visit.siteName}</div>
            <div className="flex items-center justify-between">
              <Badge status={visit.currentStep} />
              <span className="text-xs text-gray-400">{new Date(visit.checkInTime).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
