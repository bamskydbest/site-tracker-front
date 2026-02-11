import api from './api.js';

interface ExportParams {
  format: 'pdf' | 'csv';
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const exportReport = async (params: ExportParams): Promise<void> => {
  const { data } = await api.get('/reports/export', {
    params,
    responseType: 'blob',
  });

  const ext = params.format === 'csv' ? 'csv' : 'pdf';
  const blob = new Blob([data], {
    type: params.format === 'csv' ? 'text/csv' : 'application/pdf',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `visits-report.${ext}`;
  link.click();
  window.URL.revokeObjectURL(url);
};
