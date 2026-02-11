import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Admin } from '../types/index.js';
import { getMe } from '../services/authService.js';

interface AuthContextType {
  admin: Admin | null;
  setAdmin: (admin: Admin | null) => void;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      const parsed = JSON.parse(stored) as Admin;
      setAdmin(parsed);
      getMe()
        .then((data) => setAdmin({ ...data, token: parsed.token }))
        .catch(() => {
          localStorage.removeItem('admin');
          setAdmin(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSetAdmin = (admin: Admin | null) => {
    if (admin) {
      localStorage.setItem('admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('admin');
    }
    setAdmin(admin);
  };

  const logout = () => {
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, setAdmin: handleSetAdmin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
