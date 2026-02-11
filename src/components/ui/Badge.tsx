const colors: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800',
  'awaiting-approval': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  pending: 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
};

interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-600'} ${className}`}>
      {status.replace(/-/g, ' ')}
    </span>
  );
}
