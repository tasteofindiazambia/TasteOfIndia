import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Restaurant } from '../types';
import { restaurantService } from '../services/restaurantService';

interface RestaurantContextType {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  loading: boolean;
  error: string | null;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

interface RestaurantProviderProps {
  children: ReactNode;
}

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getRestaurants();
        setRestaurants(data);
        // Set first restaurant as default if none selected
        if (data.length > 0 && !selectedRestaurant) {
          setSelectedRestaurant(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []); // Remove selectedRestaurant dependency to prevent infinite loop

  const value: RestaurantContextType = {
    restaurants,
    selectedRestaurant,
    setSelectedRestaurant,
    loading,
    error
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};
