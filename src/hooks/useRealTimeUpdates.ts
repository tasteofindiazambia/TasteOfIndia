import { useEffect, useRef, useState } from 'react';
import { Order, Reservation } from '../types';

interface RealTimeUpdate {
  type: 'new_order' | 'order_updated' | 'new_reservation' | 'reservation_updated' | 'connected' | 'heartbeat' | 'error';
  order?: Order;
  reservation?: Reservation;
  message?: string;
  timestamp?: string;
}

interface UseRealTimeUpdatesProps {
  restaurantId?: number;
  onNewOrder?: (order: Order) => void;
  onOrderUpdate?: (order: Order) => void;
  onNewReservation?: (reservation: Reservation) => void;
  onReservationUpdate?: (reservation: Reservation) => void;
  enabled?: boolean;
}

export const useRealTimeUpdates = ({
  restaurantId,
  onNewOrder,
  onOrderUpdate,
  onNewReservation,
  onReservationUpdate,
  enabled = true
}: UseRealTimeUpdatesProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const lastOrderIdRef = useRef<number>(0);
  const lastReservationIdRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    // Use smart polling instead of SSE (Vercel has limitations with SSE)
    const checkForUpdates = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://taste-of-india-he5e2guvy-raeskaas-projects.vercel.app/api';
        
        // Check for new orders
        if (onNewOrder) {
          const ordersResponse = await fetch(`${API_BASE_URL}/admin?type=orders&restaurant_id=${restaurantId}&limit=1`);
          const orders = await ordersResponse.json();
          
          if (orders.length > 0 && orders[0].id > lastOrderIdRef.current) {
            console.log('🆕 New order detected:', orders[0]);
            onNewOrder(orders[0]);
            playOrderAlert();
            lastOrderIdRef.current = orders[0].id;
          }
        }

        // Check for new reservations
        if (onNewReservation) {
          const reservationsResponse = await fetch(`${API_BASE_URL}/admin?type=reservations&restaurant_id=${restaurantId}&limit=1`);
          const reservations = await reservationsResponse.json();
          
          if (reservations.length > 0 && reservations[0].id > lastReservationIdRef.current) {
            console.log('📅 New reservation detected:', reservations[0]);
            onNewReservation(reservations[0]);
            playReservationAlert();
            lastReservationIdRef.current = reservations[0].id;
          }
        }

        setLastUpdate(new Date().toISOString());
        setIsConnected(true);
      } catch (error) {
        console.error('❌ Error checking for updates:', error);
        setIsConnected(false);
      }
    };

    // Initial check
    checkForUpdates();
    
    // Check every 8 seconds (much less frequent than before)
    const interval = setInterval(checkForUpdates, 8000);

    return () => {
      console.log('🔌 Disconnecting from real-time updates');
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [restaurantId, enabled, onNewOrder, onNewReservation]);

  return {
    isConnected,
    lastUpdate
  };
};

// Sound alert functions
function playOrderAlert() {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    console.log('🔊 Order alert sound played');
  } catch (error) {
    console.error('Failed to play order alert sound:', error);
  }
}

function playReservationAlert() {
  try {
    // Create a different sound for reservations
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
    
    console.log('🔊 Reservation alert sound played');
  } catch (error) {
    console.error('Failed to play reservation alert sound:', error);
  }
}