import { Outlet } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function TechnicianLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-accent" />
          <span className="text-lg font-bold">Site Tracker</span>
          <span className="text-sm text-gray-300 ml-2">Technician</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
