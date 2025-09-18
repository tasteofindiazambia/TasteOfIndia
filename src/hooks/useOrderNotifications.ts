import { useEffect, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import { orderService } from '../services/orderService';
import { Order } from '../types';

interface UseOrderNotificationsProps {
  restaurantId?: number;
  enabled?: boolean;
}

export const useOrderNotifications = ({ restaurantId, enabled = true }: UseOrderNotificationsProps) => {
  const { showNotification } = useNotification();
  const previousOrdersRef = useRef<Order[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const checkForNewOrders = async () => {
      try {
        const currentOrders = await orderService.getOrders(restaurantId);
        
        // Skip notification on first load
        if (!isInitializedRef.current) {
          previousOrdersRef.current = currentOrders;
          isInitializedRef.current = true;
          return;
        }

        // Find new orders
        const previousOrderIds = new Set(previousOrdersRef.current.map(order => order.id));
        const newOrders = currentOrders.filter(order => !previousOrderIds.has(order.id));

        // Show notification for each new order
        newOrders.forEach(order => {
          showNotification({
            type: 'order',
            title: '🛒 New Order Received!',
            message: `Order #${order.id} from ${order.customer_name} - K${order.total || order.total_amount || 0}`,
            duration: 8000,
            data: order as any
          });
        });

        // Update previous orders
        previousOrdersRef.current = currentOrders;
      } catch (error) {
        console.error('Error checking for new orders:', error);
      }
    };

    // Check for new orders every 10 seconds
    const interval = setInterval(checkForNewOrders, 10000);

    return () => clearInterval(interval);
  }, [restaurantId, enabled, showNotification]);
};
