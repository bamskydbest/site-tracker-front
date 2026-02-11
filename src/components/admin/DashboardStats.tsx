import { Users, Activity, Clock, CheckCircle } from 'lucide-react';
import Card from '../ui/Card.js';
import type { DashboardStats as Stats } from '../../types/index.js';

interface DashboardStatsProps {
  stats: Stats | null;
  loading: boolean;
}

const items = [
  { key: 'total' as const, label: 'Total Visits', icon: Users, color: 'text-primary bg-blue-50' },
  { key: 'active' as const, label: 'Active', icon: Activity, color: 'text-green-600 bg-green-50' },
  { key: 'awaitingApproval' as const, label: 'Pending Approval', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  { key: 'completedToday' as const, label: 'Completed Today', icon: CheckCircle, color: 'text-accent bg-blue-50' },
];

export default function DashboardStats({ stats, loading }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map(({ key, label, icon: Icon, color }) => (
        <Card key={key} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              {loading ? (
                <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats?.[key] ?? 0}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
