import React from 'react';
import { MapPin, BarChart3 } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

const AdminLocationSwitcher: React.FC = () => {
  const { restaurants, selectedRestaurant, setSelectedRestaurant } = useRestaurant();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-5 h-5 text-deep-maroon" />
          <h2 className="text-lg font-semibold text-gray-900">Location Analytics</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRestaurant(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !selectedRestaurant
                ? 'bg-deep-maroon text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Locations
          </button>
          
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => setSelectedRestaurant(restaurant)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedRestaurant?.id === restaurant.id
                  ? 'bg-deep-maroon text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span className="hidden sm:inline">{restaurant.name}</span>
                <span className="sm:hidden">{restaurant.name.split(' ')[2]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {selectedRestaurant && (
        <div className="mt-4 p-3 bg-light-cream border border-deep-maroon rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-deep-maroon" />
            <span className="text-sm text-deep-maroon">
              <strong>Viewing:</strong> {selectedRestaurant.name} - {selectedRestaurant.address}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLocationSwitcher;
