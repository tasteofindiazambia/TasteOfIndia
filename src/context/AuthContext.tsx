import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
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
    // Check if user is already authenticated - only for admin routes
    const checkAuth = async () => {
      try {
        const token = apiService.getAuthToken();
        if (token && window.location.pathname.startsWith('/admin')) {
          // Verify the token with the backend only for admin routes
          const response = await apiService.verifyToken();
          if (response.success && response.user) {
            setIsAuthenticated(true);
            setUser(response.user);
          } else {
            // Token is invalid, remove it
            apiService.removeAuthToken();
            setIsAuthenticated(false);
            setUser(null);
          }
        } else if (token && !window.location.pathname.startsWith('/admin')) {
          // For non-admin routes, just check if token exists without verification
          setIsAuthenticated(!!token);
        }
      } catch (error) {
        // Only log auth errors for admin routes to avoid console spam
        if (window.location.pathname.startsWith('/admin')) {
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

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting login with:', { username, password: '***' });
      
      const response = await apiService.login(username, password);
      console.log('Login response:', response);
      
      if (response.success && response.user) {
        setIsAuthenticated(true);
        setUser(response.user);
        return true;
      } else {
        setError(response.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      return false;
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
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
