import apiService from './api';
import { Order, OrderFormData, OrderStatusUpdate } from '../types';

export const orderService = {
  // Create a new order
  createOrder: async (orderData: OrderFormData): Promise<Order> => {
    return await apiService.createOrder(orderData);
  },

  // Get all orders (admin)
  getOrders: async (restaurantId?: number): Promise<Order[]> => {
    const filters = restaurantId ? { restaurant_id: restaurantId } : {};
    return await apiService.getAdminOrders(filters);
  },

  // Get order by ID
  getOrder: async (id: number): Promise<Order> => {
    return await apiService.getOrderDetails(id);
  },

  // Update order status (admin)
  updateOrderStatus: async (updateData: OrderStatusUpdate): Promise<Order> => {
    await apiService.updateOrderStatus(updateData.orderId, updateData.status, updateData.estimatedTime);
    return await apiService.getOrderDetails(updateData.orderId);
  },

  // Get orders by status
  getOrdersByStatus: async (status: string, restaurantId?: number): Promise<Order[]> => {
    const filters: any = { status };
    if (restaurantId) {
      filters.restaurant_id = restaurantId;
    }
    return await apiService.getAdminOrders(filters);
  }
};
