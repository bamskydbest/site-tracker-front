import { Outlet } from 'react-router-dom';
import Header from './Header.js';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showLogout />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
