import { type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export default function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="relative">
        <select
          className={`
            w-full appearance-none bg-white
            pl-4 pr-10 py-2.5
            border border-gray-300 rounded-lg
            text-sm text-gray-700
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            hover:border-gray-400
            transition-all cursor-pointer
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
