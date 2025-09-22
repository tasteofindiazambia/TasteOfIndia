import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

const AdminLogin: React.FC = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const { login, loading, error, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with credentials:', credentials);
    
    try {
      const success = await login(credentials.username, credentials.password);
      console.log('Login success:', success);
      
      if (success) {
        console.log('Login successful, checking user role...');
        // Check user role from context (it should be updated by now)
        if (user?.role === 'worker') {
          console.log('Worker account, redirecting to staff panel...');
          navigate('/staff');
        } else {
          console.log('Owner/Admin account, redirecting to admin dashboard...');
          navigate('/admin/dashboard');
        }
      }
    } catch (err) {
      console.error('Login form error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-deep-maroon rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600">Access the restaurant management system</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-deep-maroon text-white py-2 px-4 rounded-lg hover:bg-burgundy transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="mb-2">Demo credentials:</p>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div>
              <p className="font-semibold text-gray-700">Owner Account:</p>
              <p>Username: <strong>admin</strong></p>
              <p>Password: <strong>admin123</strong></p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Staff Account:</p>
              <p>Username: <strong>worker</strong></p>
              <p>Password: <strong>worker123</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
