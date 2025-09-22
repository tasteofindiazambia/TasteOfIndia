import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'owner' | 'worker';
  requireOwnerAccess?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireOwnerAccess = false 
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const { isOwner, isWorker } = usePermissions();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Determine login page based on current route
    const isStaffRoute = window.location.pathname.startsWith('/staff');
    return <Navigate to={isStaffRoute ? "/staff" : "/admin"} replace />;
  }

  // Role-based access control
  if (requireOwnerAccess && !isOwner()) {
    // Workers trying to access owner-only features → redirect to staff
    return <Navigate to="/staff/dashboard" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user role
    if (isWorker()) {
      return <Navigate to="/staff/dashboard" replace />;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
