import { useEffect, useState } from 'react';
import { Order, Reservation } from '../types';
import { orderService } from '../services/orderService';
import { reservationService } from '../services/reservationService';

export const useRealTimeUpdates = (restaurantId?: number) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, reservationsData] = await Promise.all([
          orderService.getOrders(restaurantId),
          reservationService.getReservations(restaurantId)
        ]);
        
        setOrders(ordersData);
        setReservations(reservationsData);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch real-time data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [restaurantId]);

  const refreshData = async () => {
    try {
      const [ordersData, reservationsData] = await Promise.all([
        orderService.getOrders(restaurantId),
        reservationService.getReservations(restaurantId)
      ]);
      
      setOrders(ordersData);
      setReservations(reservationsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  return {
    orders,
    reservations,
    lastUpdate,
    refreshData
  };
};
