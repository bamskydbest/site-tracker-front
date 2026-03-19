import { Filter } from 'lucide-react';
import Button from './Button.js';
import Select from './Select.js';
import { DEPARTMENTS } from '../../types/index.js';

interface FilterPanelProps {
  status: string;
  onStatusChange: (status: string) => void;
  department: string;
  onDepartmentChange: (department: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onReset: () => void;
}

export default function FilterPanel({
  status, onStatusChange,
  department, onDepartmentChange,
  dateFrom, dateTo, onDateFromChange, onDateToChange, onReset,
}: FilterPanelProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 self-end pb-2.5">
        <Filter className="w-4 h-4" />
        Filters
      </div>

      <div className="min-w-[140px]">
        <Select
          label="Status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="awaiting-approval">Awaiting Approval</option>
          <option value="completed">Completed</option>
          <option value="declined">Declined</option>
        </Select>
      </div>

      <div className="min-w-[180px]">
        <Select
          label="Department"
          value={department}
          onChange={(e) => onDepartmentChange(e.target.value)}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent hover:border-gray-400 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent hover:border-gray-400 transition-all"
        />
      </div>

      <div className="self-end">
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
