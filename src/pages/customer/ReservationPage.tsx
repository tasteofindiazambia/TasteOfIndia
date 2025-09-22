import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, Users, User, Phone, MessageSquare } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useNotification } from '../../context/NotificationContext';
import { reservationService } from '../../services/reservationService';
import { ReservationFormData, Reservation } from '../../types';
import ReservationWhatsAppShare from '../../components/ReservationWhatsAppShare';

interface ReservationForm {
  customer_name: string;
  customer_phone: string;
  date_time: string;
  party_size: number;
  restaurant_id: number;
  special_requests?: string;
}

const ReservationPage: React.FC = () => {
  const { restaurants, selectedRestaurant } = useRestaurant();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const preselectedRestaurant = searchParams.get('restaurant');
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ReservationForm>({
    defaultValues: {
      restaurant_id: preselectedRestaurant ? parseInt(preselectedRestaurant) : selectedRestaurant?.id || restaurants[0]?.id,
      party_size: 2
    }
  });

  const onSubmit = async (data: ReservationForm) => {
    try {
      setLoading(true);
      setError(null);

      const reservationData: ReservationFormData = {
        ...data,
        date_time: data.date_time
      };

      const createdReservation = await reservationService.createReservation(reservationData);
      setReservation(createdReservation);
      setSuccess(true);
      showNotification({
        type: 'success',
        message: 'Reservation sent to admin! We will contact you via WhatsApp to confirm.'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to make reservation';
      setError(errorMessage);
      showNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  if (success && reservation) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Reservation Sent!</h2>
          <p className="text-green-700 mb-4">
            Your table reservation has been sent to our admin team. We will contact you via WhatsApp to confirm the details.
          </p>
        </div>
        
        {/* Reservation Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Reservation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <span className="font-medium">Reservation ID:</span> #{reservation.id}
            </div>
            <div>
              <span className="font-medium">Customer:</span> {reservation.customer_name}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {reservation.customer_phone}
            </div>
            <div>
              <span className="font-medium">Date & Time:</span> {new Date(reservation.date_time).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Party Size:</span> {reservation.party_size} people
            </div>
            <div>
              <span className="font-medium">Status:</span> <span className="text-yellow-600 font-medium">Pending Confirmation</span>
            </div>
            {reservation.occasion && (
              <div className="md:col-span-2">
                <span className="font-medium">Occasion:</span> {reservation.occasion}
              </div>
            )}
            {reservation.special_requests && (
              <div className="md:col-span-2">
                <span className="font-medium">Special Requests:</span> {reservation.special_requests}
              </div>
            )}
          </div>
        </div>
        
        {/* WhatsApp Sharing */}
        <ReservationWhatsAppShare reservation={reservation} />
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-deep-maroon text-white px-6 py-3 rounded-lg hover:bg-burgundy transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate('/reservation')}
            className="border border-deep-maroon text-deep-maroon px-6 py-3 rounded-lg hover:bg-deep-maroon hover:text-white transition-colors"
          >
            Make Another Reservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Make a Reservation</h1>
      <p className="text-gray-600 mb-8">Book a table at one of our restaurant locations</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="reservation_customer_name"
                  name="customer_name"
                  {...register('customer_name', { required: 'Name is required' })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.customer_name && (
                <p className="text-red-600 text-sm mt-1">{errors.customer_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="reservation_customer_phone"
                  name="customer_phone"
                  {...register('customer_phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[+]?[1-9][\d]{0,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.customer_phone && (
                <p className="text-red-600 text-sm mt-1">{errors.customer_phone.message}</p>
              )}
            </div>
          </div>

          {/* Reservation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  id="reservation_date_time"
                  name="date_time"
                  {...register('date_time', { 
                    required: 'Date and time is required',
                    validate: (value) => {
                      const selectedDate = new Date(value);
                      const now = new Date();
                      return selectedDate > now || 'Please select a future date and time';
                    }
                  })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              {errors.date_time && (
                <p className="text-red-600 text-sm mt-1">{errors.date_time.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Size *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="reservation_party_size"
                  name="party_size"
                  {...register('party_size', { 
                    required: 'Party size is required',
                    min: { value: 1, message: 'Party size must be at least 1' },
                    max: { value: 12, message: 'Maximum party size is 12' }
                  })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((size) => (
                    <option key={size} value={size}>
                      {size} {size === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
              </div>
              {errors.party_size && (
                <p className="text-red-600 text-sm mt-1">{errors.party_size.message}</p>
              )}
            </div>
          </div>

          {/* Restaurant Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant Location *
            </label>
            <select
              id="reservation_restaurant_id"
              name="restaurant_id"
              {...register('restaurant_id', { required: 'Please select a location' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name} - {restaurant.address}
                </option>
              ))}
            </select>
            {errors.restaurant_id && (
              <p className="text-red-600 text-sm mt-1">{errors.restaurant_id.message}</p>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                id="reservation_special_requests"
                name="special_requests"
                {...register('special_requests')}
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                placeholder="Special occasions, accessibility needs, seating preferences..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-deep-maroon text-white py-3 px-6 rounded-lg hover:bg-burgundy transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Making Reservation...' : 'Book Table'}
          </button>
        </form>
      </div>

      {/* Restaurant Info */}
      <div className="mt-8 bg-light-cream rounded-lg p-6">
        <h3 className="font-semibold text-deep-maroon mb-3">Reservation Policy</h3>
        <ul className="text-sm text-warm-gray space-y-1">
          <li>• Reservations are recommended, especially during peak hours</li>
          <li>• We'll call to confirm your reservation within 30 minutes</li>
          <li>• Please arrive within 15 minutes of your reservation time</li>
          <li>• For parties of 8 or more, please call us directly</li>
          <li>• Cancellations can be made up to 2 hours before your reservation</li>
        </ul>
      </div>
    </div>
  );
};

export default ReservationPage;
