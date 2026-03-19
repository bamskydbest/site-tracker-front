import { LogOut, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigate, Link } from 'react-router-dom';

interface HeaderProps {
  showLogout?: boolean;
}

export default function Header({ showLogout = false }: HeaderProps) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const displayName = admin?.name
    ? admin.name.charAt(0).toUpperCase() + admin.name.slice(1)
    : '';

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/k-NET.png" alt="K-NET" className="h-8 w-auto" />
          <span className="text-lg font-bold">Site Tracker</span>
        </div>
        {showLogout && admin && (
          <div className="flex items-center gap-4">
            {admin.role === 'superadmin' && (
              <Link
                to="/admin/team"
                className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Team</span>
              </Link>
            )}
            <span className="text-sm text-gray-300">Welcome, {displayName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
