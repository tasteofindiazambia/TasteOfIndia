import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Calendar, Clock, Users, Phone, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Reservation } from '../../types';
import { reservationService } from '../../services/reservationService';
import ReservationWhatsAppShare from '../../components/ReservationWhatsAppShare';

const ReservationConfirmationPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const location = useLocation();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!reservationId) {
        setError('Reservation ID not provided');
        setLoading(false);
        return;
      }

      // First, try to get reservation from navigation state or localStorage
      let localReservation = null;
      
      // Check navigation state first
      if (location.state?.reservation) {
        localReservation = location.state.reservation;
        console.log('Found reservation in navigation state:', localReservation);
      } else {
        // Check localStorage as fallback
        try {
          const storedReservation = localStorage.getItem(`reservation_${reservationId}`);
          if (storedReservation) {
            localReservation = JSON.parse(storedReservation);
            console.log('Found reservation in localStorage:', localReservation);
          }
        } catch (error) {
          console.error('Error reading from localStorage:', error);
        }
      }

      if (localReservation) {
        setReservation(localReservation);
        setLoading(false);
        return;
      }

      // If no local data, try to fetch from server
      try {
        setLoading(true);
        const reservationData = await reservationService.getReservation(parseInt(reservationId));
        setReservation(reservationData);
        
        // Store for future use
        localStorage.setItem(`reservation_${reservationId}`, JSON.stringify(reservationData));
      } catch (err: any) {
        console.error('Error fetching reservation:', err);
        if (err.message?.includes('404')) {
          setError(`Reservation #${reservationId} not found. It may have been cancelled or removed.`);
        } else {
          setError('Unable to load reservation details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reservation details...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reservation Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the reservation you're looking for. This might be because:
          </p>
          <ul className="text-left text-gray-600 mb-6 space-y-2">
            <li>• The reservation ID is incorrect</li>
            <li>• The reservation has been removed</li>
            <li>• You don't have permission to view this reservation</li>
          </ul>
          <div className="space-y-3">
            <Link
              to="/reservation"
              className="block bg-deep-maroon text-white px-6 py-3 rounded-lg hover:bg-burgundy transition-colors"
            >
              Make a New Reservation
            </Link>
            <Link
              to="/"
              className="block border border-deep-maroon text-deep-maroon px-6 py-3 rounded-lg hover:bg-deep-maroon hover:text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Reservation Confirmation</h1>
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
              {getStatusIcon(reservation.status)}
              <span className="capitalize">{reservation.status}</span>
            </div>
          </div>
          <p className="text-gray-600">
            Reservation #{reservation.id} • {new Date(reservation.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Reservation Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Customer Information
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-gray-900">{reservation.customer_name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <p className="text-gray-900">{reservation.customer_phone}</p>
              </div>
              {reservation.customer_email && (
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{reservation.customer_email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reservation Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Reservation Details
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Date & Time:</span>
                <p className="text-gray-900">{new Date(reservation.date_time).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Party Size:</span>
                <p className="text-gray-900">{reservation.party_size} people</p>
              </div>
              {reservation.occasion && (
                <div>
                  <span className="font-medium text-gray-700">Occasion:</span>
                  <p className="text-gray-900">{reservation.occasion}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {reservation.special_requests && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {reservation.special_requests}
            </p>
          </div>
        )}

        {/* WhatsApp Sharing */}
        <ReservationWhatsAppShare reservation={reservation} />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            to="/reservation"
            className="bg-deep-maroon text-white px-6 py-3 rounded-lg hover:bg-burgundy transition-colors text-center"
          >
            Make Another Reservation
          </Link>
          <Link
            to="/"
            className="border border-deep-maroon text-deep-maroon px-6 py-3 rounded-lg hover:bg-deep-maroon hover:text-white transition-colors text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReservationConfirmationPage;
