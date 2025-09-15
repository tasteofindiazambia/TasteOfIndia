import apiService from './api';
import { Restaurant, MenuItem, Category } from '../types';

export const restaurantService = {
  // Get all restaurants
  getRestaurants: async (): Promise<Restaurant[]> => {
    return await apiService.getRestaurants();
  },

  // Get restaurant by ID
  getRestaurant: async (id: number): Promise<Restaurant> => {
    return await apiService.getRestaurant(id);
  },

  // Get menu for a restaurant
  getMenu: async (restaurantId: number): Promise<MenuItem[]> => {
    return await apiService.getMenu(restaurantId);
  },

  // Get categories for a restaurant
  getCategories: async (restaurantId: number): Promise<Category[]> => {
    return await apiService.getMenuCategories(restaurantId);
  },

  // Search menu items
  searchMenuItems: async (restaurantId: number, query: string): Promise<MenuItem[]> => {
    const menuItems = await apiService.getMenu(restaurantId);
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
  }
};
