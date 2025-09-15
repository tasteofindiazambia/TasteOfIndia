import React from 'react';
import { Bell, Settings, User, Menu } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const { restaurants, selectedRestaurant, setSelectedRestaurant } = useRestaurant();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex justify-between items-center px-4 lg:px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
            Restaurant Management
          </h1>
          
          {/* Location Switcher */}
          <select
            id="admin_location_switcher"
            name="admin_location_switcher"
            value={selectedRestaurant?.id || ''}
            onChange={(e) => {
              const restaurant = restaurants.find(r => r.id === parseInt(e.target.value));
              setSelectedRestaurant(restaurant || null);
            }}
            className="hidden md:block px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-deep-maroon"
          >
            <option value="">All Locations</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
