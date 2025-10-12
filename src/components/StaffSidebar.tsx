import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ClipboardList,
  Calendar,
  BarChart3,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StaffSidebarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({ isMobileMenuOpen, onMobileMenuClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    {
      name: 'Orders',
      href: '/staff/orders',
      icon: ClipboardList,
      description: 'View and update orders'
    },
    {
      name: 'Today\'s Summary',
      href: '/staff/dashboard',
      icon: BarChart3,
      description: 'Daily overview'
    }
  ];

  const isActive = (href: string) => {
    return location.pathname === href || 
           (href === '/staff/dashboard' && location.pathname === '/staff');
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onMobileMenuClose}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full pt-5 pb-4 overflow-y-auto">
          {/* Mobile close button */}
          <div className="flex items-center justify-between px-4 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-deep-maroon rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">Staff Panel</h1>
                <p className="text-xs text-gray-500">Taste of India</p>
              </div>
            </div>
            <button
              onClick={onMobileMenuClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 mb-6">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-deep-maroon rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role} Account
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onMobileMenuClose}
                  className={`${
                    isActive(item.href)
                      ? 'bg-deep-maroon text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                >
                  <Icon
                    className={`${
                      isActive(item.href) 
                        ? 'text-white' 
                        : 'text-gray-400 group-hover:text-gray-700'
                    } mr-3 h-5 w-5 flex-shrink-0`}
                  />
                  <div>
                    <div>{item.name}</div>
                    <div className={`text-xs ${
                      isActive(item.href) 
                        ? 'text-white/80' 
                        : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 pb-4">
            <button
              onClick={() => {
                logout();
                onMobileMenuClose();
              }}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="w-8 h-8 bg-deep-maroon rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">Staff Panel</h1>
              <p className="text-sm text-gray-500">Taste of India</p>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-6 px-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-deep-maroon rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role} Account
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-deep-maroon text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                >
                  <Icon
                    className={`${
                      isActive(item.href) 
                        ? 'text-white' 
                        : 'text-gray-400 group-hover:text-gray-700'
                    } mr-3 h-5 w-5 flex-shrink-0`}
                  />
                  <div>
                    <div>{item.name}</div>
                    <div className={`text-xs ${
                      isActive(item.href) 
                        ? 'text-white/80' 
                        : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 pb-4">
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffSidebar;
