import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StaffSidebar from './StaffSidebar';
import StaffHeader from './StaffHeader';
import { usePermissions } from '../hooks/usePermissions';

const StaffLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const { isWorker } = usePermissions();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  // Redirect owners to admin panel (they shouldn't use staff interface)
  if (!isWorker()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffSidebar />
      <div className="lg:pl-64">
        <StaffHeader />
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
