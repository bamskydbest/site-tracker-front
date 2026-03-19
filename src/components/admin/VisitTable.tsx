import { Eye, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge.js';
import EmptyState from '../ui/EmptyState.js';
import type { Visit } from '../../types/index.js';

type SortKey = 'technicianName' | 'siteName' | 'department' | 'currentStep' | 'status' | 'checkInTime';
type SortDir = 'asc' | 'desc';

interface VisitTableProps {
  visits: Visit[];
  loading: boolean;
}

export default function VisitTable({ visits, loading }: VisitTableProps) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = sortKey
    ? [...visits].sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        const cmp = String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : visits;

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-accent" />
      : <ChevronDown className="w-3.5 h-3.5 text-accent" />;
  }

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
              {(
                [
                  { label: 'Technician', key: 'technicianName' },
                  { label: 'Site', key: 'siteName' },
                  { label: 'Department', key: 'department' },
                  { label: 'Step', key: 'currentStep' },
                  { label: 'Status', key: 'status' },
                  { label: 'Time', key: 'checkInTime' },
                ] as { label: string; key: SortKey }[]
              ).map(({ label, key }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer select-none"
                >
                  <span className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors">
                    {label}
                    <SortIcon col={key} />
                  </span>
                </th>
              ))}
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((visit) => (
              <tr key={visit._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-gray-900">{visit.technicianName}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{visit.siteName}</td>
                <td className="py-3 px-4 text-sm text-gray-500">{visit.department || '—'}</td>
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
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-medium text-gray-900 truncate min-w-0">{visit.technicianName}</span>
              <Badge status={visit.status} />
            </div>
            <div className="text-sm text-gray-600 mb-1 truncate">{visit.siteName}</div>
            {visit.department && (
              <div className="text-xs text-gray-400 mb-1 truncate">{visit.department}</div>
            )}
            <div className="flex items-center justify-between gap-2">
              <Badge status={visit.currentStep} />
              <span className="text-xs text-gray-400 shrink-0">{new Date(visit.checkInTime).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
