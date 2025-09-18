import apiService from './api';
import { Order, OrderFormData, OrderStatusUpdate } from '../types';
import { customerService } from './customerService';

export const orderService = {
  // Create a new order
  createOrder: async (orderData: OrderFormData): Promise<Order> => {
    const order = await apiService.createOrder(orderData);
    
    // Automatically save customer data
    try {
      await customerService.createCustomer({
        name: orderData.customer_name,
        phone: orderData.customer_phone,
        email: undefined, // OrderFormData doesn't include email
        source: 'order'
      });
    } catch (error) {
      console.error('Failed to save customer data:', error);
      // Don't throw error - order creation should still succeed
    }
    
    return order;
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
