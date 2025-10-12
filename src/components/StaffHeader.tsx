import React, { useState } from 'react';
import { Menu, Bell, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StaffHeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const StaffHeader: React.FC<StaffHeaderProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { user } = useAuth();
  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const currentDate = new Date().toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Welcome message */}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.fullName || user?.username}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {currentDate} • {currentTime}
            </p>
          </div>

          {/* Right side - notifications and user */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-500 relative">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User avatar */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-deep-maroon rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffHeader;
