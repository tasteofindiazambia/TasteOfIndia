import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
// import { Restaurant } from '../types';
import { useRestaurant } from '../context/RestaurantContext';

const LocationSelector: React.FC = () => {
  const { restaurants, selectedRestaurant, setSelectedRestaurant } = useRestaurant();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Select Restaurant Location</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => setSelectedRestaurant(restaurant)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedRestaurant?.id === restaurant.id
                ? 'border-deep-maroon bg-light-cream'
                : 'border-gray-200 hover:border-deep-maroon hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                selectedRestaurant?.id === restaurant.id
                  ? 'border-deep-maroon bg-deep-maroon'
                  : 'border-gray-300'
              }`} />
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{restaurant.name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.address}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{restaurant.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedRestaurant && (
        <div className="mt-4 p-3 bg-light-cream border border-deep-maroon rounded-lg">
          <p className="text-sm text-deep-maroon">
            <strong>Selected:</strong> {selectedRestaurant.name} - {selectedRestaurant.address}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
