import { Filter } from 'lucide-react';
import Button from './Button.js';

interface FilterPanelProps {
  status: string;
  onStatusChange: (status: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onReset: () => void;
}

export default function FilterPanel({
  status, onStatusChange, dateFrom, dateTo, onDateFromChange, onDateToChange, onReset,
}: FilterPanelProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Filter className="w-4 h-4" />
        Filters
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="awaiting-approval">Awaiting Approval</option>
          <option value="completed">Completed</option>
          <option value="declined">Declined</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <Button variant="ghost" size="sm" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
