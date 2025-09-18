import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Users, Phone, Eye, XCircle, Plus, Filter, Search, Download, MessageSquare } from 'lucide-react';
import { Reservation } from '../../types';
import { reservationService } from '../../services/reservationService';
import { useRestaurant } from '../../context/RestaurantContext';
import { useNotification } from '../../context/NotificationContext';
import CreateReservationModal from '../../components/CreateReservationModal';
import ReservationCalendar from '../../components/ReservationCalendar';

const AdminReservations: React.FC = () => {
  const { selectedRestaurant } = useRestaurant();
  const { showNotification } = useNotification();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      let reservationsData: Reservation[];
      
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      if (dateFilter === 'today') {
        reservationsData = await reservationService.getReservationsByDateRange(
          `${today} 00:00:00`,
          `${today} 23:59:59`,
          selectedRestaurant?.id
        );
      } else if (dateFilter === 'tomorrow') {
        reservationsData = await reservationService.getReservationsByDateRange(
          `${tomorrow} 00:00:00`,
          `${tomorrow} 23:59:59`,
          selectedRestaurant?.id
        );
      } else {
        reservationsData = await reservationService.getReservations(selectedRestaurant?.id);
      }
      
      // Apply status filter
      if (filter !== 'all') {
        reservationsData = reservationsData.filter(r => r.status === filter);
      }
      
      setReservations(reservationsData);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant, filter, dateFilter]);

  useEffect(() => {
    fetchReservations();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing reservations...');
      fetchReservations();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [fetchReservations]);

  const updateReservationStatus = async (reservationId: number, newStatus: string) => {
    try {
      await reservationService.updateReservationStatus(reservationId, newStatus);
      fetchReservations(); // Refresh reservations
    } catch (error) {
      console.error('Failed to update reservation status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReservationCreated = (newReservation: Reservation) => {
    setReservations(prev => [newReservation, ...prev]);
    setShowCreateModal(false);
  };

  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setDateFilter('custom');
  };

  const handleExportReservations = () => {
    const csvContent = [
      ['Customer Name', 'Phone', 'Email', 'Date', 'Time', 'Party Size', 'Status', 'Location'].join(','),
      ...reservations.map(reservation => [
        reservation.customer_name,
        reservation.customer_phone,
        reservation.customer_email || '',
        new Date(reservation.date_time).toLocaleDateString(),
        new Date(reservation.date_time).toLocaleTimeString(),
        reservation.party_size,
        reservation.status,
        reservation.location
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservations_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredReservations = () => {
    let filtered = reservations;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === filter);
    }

    // Filter by date
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(reservation => 
          reservation.date_time.startsWith(today)
        );
        break;
      case 'tomorrow':
        filtered = filtered.filter(reservation => 
          reservation.date_time.startsWith(tomorrowString)
        );
        break;
      case 'custom':
        if (selectedDate) {
          filtered = filtered.filter(reservation => 
            reservation.date_time.startsWith(selectedDate)
          );
        }
        break;
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(reservation =>
        reservation.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.customer_phone.includes(searchQuery) ||
        reservation.customer_email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reservations Management</h1>
          <p className="text-gray-600 mt-1">Manage customer reservations and table bookings</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-deep-maroon shadow-sm' : 'text-gray-600'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-deep-maroon shadow-sm' : 'text-gray-600'
              }`}
            >
              Calendar
            </button>
          </div>
          
          {/* Create Reservation Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Reservation
          </button>
          
          {/* Export Button */}
          <button
            onClick={handleExportReservations}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Enhanced Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            >
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="all">All Dates</option>
              <option value="custom">Custom Date</option>
            </select>
          </div>

          {/* Custom Date */}
          {dateFilter === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              />
            </div>
          )}

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reservations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'calendar' ? (
        <ReservationCalendar
          reservations={filteredReservations()}
          onReservationClick={handleReservationClick}
          onDateClick={handleDateClick}
          selectedDate={selectedDate}
        />
      ) : (
        /* Reservations List */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredReservations().length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No reservations found</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reservation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations().map((reservation) => {
                  const { date, time } = formatDateTime(reservation.date_time);
                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{reservation.id}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reservation.customer_name}</div>
                        <div className="text-sm text-gray-500">{reservation.customer_phone}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{date}</div>
                        <div className="text-sm text-gray-500">{time}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users className="w-4 h-4 mr-1" />
                          {reservation.party_size} {reservation.party_size === 1 ? 'person' : 'people'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedReservation(reservation)}
                          className="text-deep-maroon hover:text-deep-maroon"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Reservation #{selectedReservation.id}</h2>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{selectedReservation.customer_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{selectedReservation.customer_phone}</span>
                  </div>
                </div>
              </div>

              {/* Reservation Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Reservation Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{formatDateTime(selectedReservation.date_time).date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{formatDateTime(selectedReservation.date_time).time}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{selectedReservation.party_size} {selectedReservation.party_size === 1 ? 'person' : 'people'}</span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedReservation.special_requests && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Special Requests</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedReservation.special_requests}</p>
                </div>
              )}

              {/* Status Update */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['confirmed', 'cancelled', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, status);
                        setSelectedReservation({...selectedReservation, status: status as Reservation['status']});
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedReservation.status === status
                          ? 'bg-deep-maroon text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Reservation Modal */}
      <CreateReservationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onReservationCreated={handleReservationCreated}
      />
    </div>
  );
};

export default AdminReservations;