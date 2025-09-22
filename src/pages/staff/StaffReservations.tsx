import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Eye,
  Phone
} from 'lucide-react';
import { reservationService } from '../../services/reservationService';
import { Reservation } from '../../types';

const StaffReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const fetchedReservations = await reservationService.getReservations();
        
        // Also check localStorage for any recent reservations that might not be in the database yet
        const recentReservations = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('reservation_')) {
            try {
              const reservationData = JSON.parse(localStorage.getItem(key) || '{}');
              // Only include reservations from the last 24 hours
              const reservationTime = new Date(reservationData.created_at || reservationData.date_time);
              const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
              if (reservationTime > twentyFourHoursAgo) {
                // Check if this reservation is already in the server data
                const exists = fetchedReservations.find(r => r.id === reservationData.id);
                if (!exists) {
                  recentReservations.push({
                    ...reservationData,
                    _source: 'localStorage',
                    _note: 'Recent reservation - may not appear in database yet'
                  });
                }
              }
            } catch (error) {
              console.error('Error parsing localStorage reservation:', error);
            }
          }
        }
        
        // Combine server data with recent localStorage reservations
        const allReservations = [...fetchedReservations, ...recentReservations];
        setReservations(allReservations);
        
        console.log('Staff reservations loaded:', allReservations.length);
        console.log('Server reservations:', fetchedReservations.length);
        console.log('Recent localStorage reservations:', recentReservations.length);
        
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Auto-refresh reservations every 30 seconds to catch new ones
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing staff reservations...');
      const fetchReservations = async () => {
        try {
          const fetchedReservations = await reservationService.getReservations();
          
          // Also check localStorage for any recent reservations
          const recentReservations = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('reservation_')) {
              try {
                const reservationData = JSON.parse(localStorage.getItem(key) || '{}');
                const reservationTime = new Date(reservationData.created_at || reservationData.date_time);
                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                if (reservationTime > twentyFourHoursAgo) {
                  const exists = fetchedReservations.find(r => r.id === reservationData.id);
                  if (!exists) {
                    recentReservations.push({
                      ...reservationData,
                      _source: 'localStorage',
                      _note: 'Recent reservation - may not appear in database yet'
                    });
                  }
                }
              } catch (error) {
                console.error('Error parsing localStorage reservation:', error);
              }
            }
          }
          
          const allReservations = [...fetchedReservations, ...recentReservations];
          setReservations(allReservations);
        } catch (error) {
          console.error('Error auto-refreshing reservations:', error);
        }
      };
      
      fetchReservations();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (reservationId: number, newStatus: string) => {
    try {
      await reservationService.updateReservationStatus(reservationId, newStatus);
      setReservations(reservations.map(reservation => 
        reservation.id === reservationId ? { ...reservation, status: newStatus } : reservation
      ));
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation({ ...selectedReservation, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating reservation status:', error);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const reservationDate = new Date(reservation.date_time);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = reservationDate.toDateString() === today.toDateString();
          break;
        case 'tomorrow':
          matchesDate = reservationDate.toDateString() === tomorrow.toDateString();
          break;
        case 'upcoming':
          matchesDate = reservationDate >= today;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow h-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reservations Management</h1>
        <p className="mt-1 text-gray-600">
          Manage table reservations and bookings
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon appearance-none bg-white"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No reservations available at the moment.'
              }
            </p>
          </div>
        ) : (
          filteredReservations.map((reservation) => (
            <div key={reservation.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Calendar className="w-8 h-8 text-deep-maroon" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reservation.customer_name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(reservation.date_time).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(reservation.date_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {reservation.party_size} guests
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {reservation.customer_phone}
                        </div>
                      </div>
                      {reservation.occasion && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Occasion:</strong> {reservation.occasion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(reservation.status)}`}>
                    {reservation.status}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedReservation(reservation)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    
                    {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                      <select
                        value={reservation.status}
                        onChange={(e) => handleStatusUpdate(reservation.id, e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Reservation Details
                </h3>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p><strong>Customer:</strong> {selectedReservation.customer_name}</p>
                  <p><strong>Phone:</strong> {selectedReservation.customer_phone}</p>
                  <p><strong>Email:</strong> {selectedReservation.customer_email || 'N/A'}</p>
                  <p><strong>Date & Time:</strong> {new Date(selectedReservation.date_time).toLocaleString()}</p>
                  <p><strong>Party Size:</strong> {selectedReservation.party_size} guests</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedReservation.status)}`}>
                      {selectedReservation.status}
                    </span>
                  </p>
                  {selectedReservation.occasion && (
                    <p><strong>Occasion:</strong> {selectedReservation.occasion}</p>
                  )}
                  {selectedReservation.special_requests && (
                    <p><strong>Special Requests:</strong> {selectedReservation.special_requests}</p>
                  )}
                  <p><strong>Reservation Time:</strong> {new Date(selectedReservation.created_at || '').toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffReservations;
