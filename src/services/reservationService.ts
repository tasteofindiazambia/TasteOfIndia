import apiService from './api';
import { Reservation, ReservationFormData } from '../types';
import { customerService } from './customerService';

export const reservationService = {
  // Create a new reservation
  createReservation: async (reservationData: ReservationFormData): Promise<Reservation> => {
    const reservation = await apiService.createReservation(reservationData);
    
    // Automatically save customer data
    try {
      await customerService.createCustomer({
        name: reservationData.customer_name,
        phone: reservationData.customer_phone,
        email: undefined, // ReservationFormData doesn't include email
        source: 'contact_form'
      });
    } catch (error) {
      console.error('Failed to save customer data:', error);
      // Don't throw error - reservation creation should still succeed
    }
    
    return reservation;
  },

  // Get all reservations (admin)
  getReservations: async (restaurantId?: number): Promise<Reservation[]> => {
    const filters = restaurantId ? { restaurant_id: restaurantId } : {};
    return await apiService.getAdminReservations(filters);
  },

  // Get reservation by ID
  getReservation: async (id: number): Promise<Reservation> => {
    return await apiService.getReservationDetails(id);
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
    const filters: any = { date_from: startDate, date_to: endDate };
    if (restaurantId) {
      filters.restaurant_id = restaurantId;
    }
    return await apiService.getAdminReservations(filters);
  }
};
