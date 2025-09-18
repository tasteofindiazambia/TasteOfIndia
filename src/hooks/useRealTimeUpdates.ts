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
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://taste-of-india-6w40h9asr-raeskaas-projects.vercel.app/api';
    const streamUrl = `${API_BASE_URL}/admin/stream${restaurantId ? `?restaurant_id=${restaurantId}` : ''}`;

    console.log('🔌 Connecting to real-time stream:', streamUrl);

    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ Real-time connection established');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: RealTimeUpdate = JSON.parse(event.data);
        console.log('📡 Real-time update received:', data);

        setLastUpdate(data.timestamp || new Date().toISOString());

        switch (data.type) {
          case 'connected':
            console.log('🎉 SSE connection confirmed');
            break;
            
          case 'new_order':
            if (data.order && onNewOrder) {
              console.log('🆕 New order received:', data.order);
              onNewOrder(data.order);
              // Play notification sound
              playOrderAlert();
            }
            break;
            
          case 'order_updated':
            if (data.order && onOrderUpdate) {
              console.log('🔄 Order updated:', data.order);
              onOrderUpdate(data.order);
            }
            break;
            
          case 'new_reservation':
            if (data.reservation && onNewReservation) {
              console.log('📅 New reservation received:', data.reservation);
              onNewReservation(data.reservation);
              // Play notification sound
              playReservationAlert();
            }
            break;
            
          case 'reservation_updated':
            if (data.reservation && onReservationUpdate) {
              console.log('🔄 Reservation updated:', data.reservation);
              onReservationUpdate(data.reservation);
            }
            break;
            
          case 'heartbeat':
            // Keep connection alive
            break;
            
          case 'error':
            console.error('❌ Real-time stream error:', data.message);
            break;
        }
      } catch (error) {
        console.error('❌ Failed to parse real-time update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ Real-time connection error:', error);
      setIsConnected(false);
    };

    return () => {
      console.log('🔌 Disconnecting from real-time stream');
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [restaurantId, enabled, onNewOrder, onOrderUpdate, onNewReservation, onReservationUpdate]);

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
  } catch (error) {
    console.error('Failed to play reservation alert sound:', error);
  }
}