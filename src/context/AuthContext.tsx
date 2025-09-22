import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';

interface User {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'owner' | 'worker'; // Enhanced role types
  fullName?: string; // New field for full name
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  // New role-based helper functions
  isOwner: () => boolean;
  isWorker: () => boolean;
  hasFullAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated for both admin and staff routes
    const checkAuth = async () => {
      try {
        const token = apiService.getAuthToken();
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        const isStaffRoute = window.location.pathname.startsWith('/staff');
        
        if (token && (isAdminRoute || isStaffRoute)) {
          // Verify the token with the backend for authenticated routes
          const response = await apiService.verifyToken();
          if (response.success && response.user) {
            setIsAuthenticated(true);
            setUser(response.user);
            console.log('Auth restored on page refresh:', response.user);
            
            // Check if user is on wrong route and redirect accordingly
            if (isAdminRoute && response.user.role === 'worker') {
              console.log('Worker user on admin route, redirecting to staff');
              window.location.href = '/staff/dashboard';
              return;
            } else if (isStaffRoute && (response.user.role === 'admin' || response.user.role === 'owner')) {
              console.log('Admin/Owner user on staff route, redirecting to admin');
              window.location.href = '/admin/dashboard';
              return;
            }
          } else {
            // Token is invalid, remove it
            apiService.removeAuthToken();
            setIsAuthenticated(false);
            setUser(null);
            console.log('Invalid token on page refresh, redirecting to login');
          }
        } else if (token && !isAdminRoute && !isStaffRoute) {
          // For non-authenticated routes, just check if token exists
          setIsAuthenticated(!!token);
        }
      } catch (error) {
        // Log auth errors for authenticated routes
        if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/staff')) {
          console.error('Auth check failed:', error);
        }
        apiService.removeAuthToken();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; user?: User }> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting login with:', { username, password: '***' });
      
      const response = await apiService.login(username, password);
      console.log('Login response:', response);
      
      if (response.success && response.user) {
        setIsAuthenticated(true);
        setUser(response.user);
        
        // Log successful authentication
        console.log('User authenticated successfully:', response.user);
        
        return { success: true, user: response.user };
      } else {
        setError(response.message || 'Login failed');
        return { success: false };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      // Force redirect to login page based on current route
      const isStaffRoute = window.location.pathname.startsWith('/staff');
      window.location.href = isStaffRoute ? '/staff' : '/admin';
    }
  };

  // Role-based helper functions
  const isOwner = () => {
    return user?.role === 'admin' || user?.role === 'owner'; // 'admin' for backward compatibility
  };

  const isWorker = () => {
    return user?.role === 'worker';
  };

  const hasFullAccess = () => {
    return isOwner(); // Only owners have full access
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    error,
    isOwner,
    isWorker,
    hasFullAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
