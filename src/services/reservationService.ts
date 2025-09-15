import apiService from './api';
import { Reservation, ReservationFormData } from '../types';

export const reservationService = {
  // Create a new reservation
  createReservation: async (reservationData: ReservationFormData): Promise<Reservation> => {
    return await apiService.createReservation(reservationData);
  },

  // Get all reservations (admin)
  getReservations: async (restaurantId?: number): Promise<Reservation[]> => {
    const filters = restaurantId ? { restaurant_id: restaurantId } : {};
    return await apiService.getAdminReservations(filters);
  },

  // Get reservation by ID
  getReservation: async (id: number): Promise<Reservation> => {
    const reservations = await apiService.getAdminReservations();
    return reservations.find(r => r.id === id);
  },

  // Update reservation status (admin)
  updateReservationStatus: async (id: number, status: string, notes?: string): Promise<Reservation> => {
    await apiService.updateReservationStatus(id, status, notes);
    return await reservationService.getReservation(id);
  },

  // Get reservations by date range
  getReservationsByDateRange: async (
    startDate: string, 
    endDate: string, 
    restaurantId?: number
  ): Promise<Reservation[]> => {
    const filters = { date_from: startDate, date_to: endDate };
    if (restaurantId) {
      filters.restaurant_id = restaurantId;
    }
    return await apiService.getAdminReservations(filters);
  }
};
