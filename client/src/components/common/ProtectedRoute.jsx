import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ allowedRoles = null, children }) {
  const { isAuthenticated, isLoading, user, sessionExpired } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || sessionExpired) {
    const message = sessionExpired 
      ? 'Your session has expired. Please log in again.'
      : undefined;

    return <Navigate to="/auth/login" state={{ from: location, message }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user?.role)) {
      // If user is trying to access seller portal but is still a buyer, redirect to onboarding
      if (allowedRoles.includes('seller') && user?.role === 'buyer') {
        return <Navigate to="/seller/onboarding" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children ? children : <Outlet />;
}
