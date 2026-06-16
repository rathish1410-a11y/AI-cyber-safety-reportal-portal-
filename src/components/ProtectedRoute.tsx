import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark-bg)' }}>
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(56,189,248,0.1)', borderTopColor: 'var(--cyber-blue)' }} />
            <div className="absolute inset-2 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.06)' }} />
          </div>
          <p className="font-mono text-xs tracking-wider" style={{ color: 'rgba(56,189,248,0.5)' }}>AUTHENTICATING<span className="animate-pulse">...</span></p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!adminOnly && adminOnly === false && profile?.role === 'admin' && location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
