import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import Spinner from '../components/ui/Spinner.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { admin, loading } = useAuth();

  if (loading) {
    return <Spinner size="lg" className="min-h-screen" />;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
