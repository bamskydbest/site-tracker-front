import { MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';

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

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-accent" />
          <span className="text-lg font-bold">Site Tracker</span>
        </div>
        {showLogout && admin && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">{admin.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
