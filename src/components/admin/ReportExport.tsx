import { useState } from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button.js';
import { exportReport } from '../../services/reportService.js';

interface ReportExportProps {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function ReportExport({ status, dateFrom, dateTo }: ReportExportProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'csv') => {
    setLoading(format);
    try {
      await exportReport({ format, status, dateFrom, dateTo });
      toast.success(`${format.toUpperCase()} exported`);
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} loading={loading === 'pdf'}>
        <FileText className="w-4 h-4" /> PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport('csv')} loading={loading === 'csv'}>
        <FileSpreadsheet className="w-4 h-4" /> CSV
      </Button>
    </div>
  );
}
