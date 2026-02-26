import { useState, useEffect, useCallback } from 'react';
import DashboardStats from '../components/admin/DashboardStats.js';
import VisitTable from '../components/admin/VisitTable.js';
import ReportExport from '../components/admin/ReportExport.js';
import SearchBar from '../components/ui/SearchBar.js';
import FilterPanel from '../components/ui/FilterPanel.js';
import Pagination from '../components/ui/Pagination.js';
import Card from '../components/ui/Card.js';
import { getVisits } from '../services/visitService.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useSocketContext } from '../context/SocketContext.js';
import type { Visit, DashboardStats as Stats } from '../types/index.js';
import api from '../services/api.js';

export default function AdminDashboard() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { socket, connected } = useSocketContext();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [visitsRes, statsRes] = await Promise.all([
        getVisits({ page, search: debouncedSearch, status, dateFrom, dateTo }),
        api.get('/reports/stats'),
      ]);
      setVisits(visitsRes.visits);
      setPages(visitsRes.pages);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!socket || !connected) return;
    socket.emit('join-admin');

    const refresh = () => fetchData();
    socket.on('new-checkin', refresh);
    socket.on('photos-uploaded', refresh);
    socket.on('visit-updated', refresh);

    return () => {
      socket.off('new-checkin', refresh);
      socket.off('photos-uploaded', refresh);
      socket.off('visit-updated', refresh);
    };
  }, [socket, connected, fetchData]);

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <ReportExport status={status} dateFrom={dateFrom} dateTo={dateTo} />
      </div>

      <DashboardStats stats={stats} loading={loading} />

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} placeholder="Search visits..." />
            </div>
          </div>
          <FilterPanel
            status={status}
            onStatusChange={setStatus}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onReset={resetFilters}
          />
          <VisitTable visits={visits} loading={loading} />
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
