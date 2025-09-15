import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin, Phone, MessageSquare } from 'lucide-react';

interface Reservation {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  location: string;
  date_time: string;
  party_size: number;
  occasion?: string;
  table_preference?: string;
  dietary_requirements?: string;
  confirmation_method: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
}

interface ReservationCalendarProps {
  reservations: Reservation[];
  onReservationClick: (reservation: Reservation) => void;
  onDateClick: (date: string) => void;
  selectedDate?: string;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  reservations,
  onReservationClick,
  onDateClick,
  selectedDate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getReservationsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return reservations.filter(reservation => 
      reservation.date_time.startsWith(dateString)
    );
  };

  const getReservationsForDay = (day: number) => {
    if (!day) return [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return getReservationsForDate(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-white text-deep-maroon shadow-sm' : 'text-gray-600'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'week' ? 'bg-white text-deep-maroon shadow-sm' : 'text-gray-600'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'day' ? 'bg-white text-deep-maroon shadow-sm' : 'text-gray-600'
                }`}
              >
                Day
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm text-deep-maroon hover:bg-deep-maroon hover:text-light-cream rounded transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Reservations</span>
            </div>
            <p className="text-lg font-bold text-blue-900 mt-1">
              {reservations.length}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Confirmed</span>
            </div>
            <p className="text-lg font-bold text-green-900 mt-1">
              {reservations.filter(r => r.status === 'confirmed').length}
            </p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Pending</span>
            </div>
            <p className="text-lg font-bold text-yellow-900 mt-1">
              {reservations.filter(r => r.status === 'pending').length}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">This Month</span>
            </div>
            <p className="text-lg font-bold text-purple-900 mt-1">
              {reservations.filter(r => {
                const reservationDate = new Date(r.date_time);
                return reservationDate.getMonth() === currentDate.getMonth() && 
                       reservationDate.getFullYear() === currentDate.getFullYear();
              }).length}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {viewMode === 'month' && (
          <>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {days.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((day, index) => {
                const dayReservations = day ? getReservationsForDay(day) : [];
                const isToday = day && new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() === new Date().toDateString();
                const isSelected = day && selectedDate === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border border-gray-200 ${
                      day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                    } ${isToday ? 'ring-2 ring-deep-maroon' : ''} ${isSelected ? 'bg-deep-maroon text-light-cream' : ''}`}
                    onClick={() => day && onDateClick(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-light-cream' : isToday ? 'text-deep-maroon' : 'text-gray-900'}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayReservations.slice(0, 3).map(reservation => (
                            <div
                              key={reservation.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onReservationClick(reservation);
                              }}
                              className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm ${getStatusColor(reservation.status)}`}
                            >
                              <div className="font-medium truncate">{reservation.customer_name}</div>
                              <div className="text-xs opacity-75">{formatTime(reservation.date_time)}</div>
                            </div>
                          ))}
                          {dayReservations.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayReservations.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {viewMode === 'week' && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Week view coming soon...</p>
          </div>
        )}

        {viewMode === 'day' && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Day view coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationCalendar;
