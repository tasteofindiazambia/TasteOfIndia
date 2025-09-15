import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Star, Search, Calendar, MapPin, Users } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  location_id: number;
  date: string;
  time: string;
  duration: number;
  price: number;
  max_attendees: number;
  current_attendees: number;
  image_url: string;
  category: string;
  featured: boolean;
  status: string;
  created_at: string;
}

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [restaurants, setRestaurants] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFeatured, setShowFeatured] = useState('all');
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    location_id: '',
    date: '',
    time: '',
    duration: 2,
    price: 0,
    max_attendees: 50,
    image_url: '',
    category: '',
    featured: false,
    status: 'upcoming'
  });

  const categories = ['all', 'Cooking Class', 'Tasting', 'Entertainment', 'Kids Workshop', 'Wine Tasting', 'Tea Ceremony', 'Cultural Event'];

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        showNotification({
          type: 'error',
          message: 'Failed to fetch events'
        });
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      showNotification({
        type: 'error',
        message: 'Failed to fetch events'
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/restaurants');
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchRestaurants();
  }, [fetchEvents, fetchRestaurants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEvent 
        ? `http://localhost:3001/api/events/${editingEvent.id}`
        : 'http://localhost:3001/api/events';
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
        price: parseFloat(formData.price.toString()),
        max_attendees: parseInt(formData.max_attendees.toString()),
        duration: parseInt(formData.duration.toString())
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        showNotification({
          type: 'success',
          message: editingEvent ? 'Event updated successfully' : 'Event created successfully'
        });
        fetchEvents();
        resetForm();
      } else {
        showNotification({
          type: 'error',
          message: 'Failed to save event'
        });
      }
    } catch (error) {
      console.error('Error saving event:', error);
      showNotification({
        type: 'error',
        message: 'Failed to save event'
      });
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      location_id: event.location_id.toString(),
      date: event.date,
      time: event.time,
      duration: event.duration,
      price: event.price,
      max_attendees: event.max_attendees,
      image_url: event.image_url,
      category: event.category,
      featured: event.featured,
      status: event.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification({
          type: 'success',
          message: 'Event deleted successfully'
        });
        fetchEvents();
      } else {
        showNotification({
          type: 'error',
          message: 'Failed to delete event'
        });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showNotification({
        type: 'error',
        message: 'Failed to delete event'
      });
    }
  };

  const toggleFeatured = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/events/${id}/featured`, {
        method: 'PUT',
      });

      if (response.ok) {
        showNotification({
          type: 'success',
          message: 'Event featured status updated'
        });
        fetchEvents();
      } else {
        showNotification({
          type: 'error',
          message: 'Failed to update featured status'
        });
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      showNotification({
        type: 'error',
        message: 'Failed to update featured status'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      location_id: '',
      date: '',
      time: '',
      duration: 2,
      price: 0,
      max_attendees: 50,
      image_url: '',
      category: '',
      featured: false,
      status: 'upcoming'
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || event.location === selectedLocation;
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesFeatured = showFeatured === 'all' || 
                           (showFeatured === 'featured' && event.featured) ||
                           (showFeatured === 'not-featured' && !event.featured);
    
    return matchesSearch && matchesLocation && matchesCategory && matchesFeatured;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Event Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 bg-deep-maroon text-white px-4 py-2 rounded-lg hover:bg-deep-maroon transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Event
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            />
          </div>
          
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
          >
            <option value="all">All Locations</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.name}>{restaurant.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={showFeatured}
            onChange={(e) => setShowFeatured(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
          >
            <option value="all">All Events</option>
            <option value="featured">Featured Only</option>
            <option value="not-featured">Not Featured</option>
          </select>
        </div>
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    >
                      <option value="">Select Category</option>
                      {categories.slice(1).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant
                    </label>
                    <select
                      value={formData.location_id}
                      onChange={(e) => setFormData({...formData, location_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    >
                      <option value="">Select Restaurant</option>
                      {restaurants.map(restaurant => (
                        <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Attendees
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_attendees}
                      onChange={(e) => setFormData({...formData, max_attendees: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Event</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-deep-maroon text-white rounded-lg hover:bg-deep-maroon transition-colors"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={event.image_url || '/api/placeholder/48/48'}
                          alt={event.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {event.title}
                          {event.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      {event.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Duration: {event.duration}h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                      {event.current_attendees}/{event.max_attendees}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${event.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.status === 'upcoming' 
                        ? 'bg-blue-100 text-blue-800'
                        : event.status === 'ongoing'
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleFeatured(event.id)}
                        className={`p-1 rounded ${
                          event.featured 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                        title={event.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star className={`w-4 h-4 ${event.featured ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-deep-maroon hover:text-deep-maroon p-1"
                        title="Edit event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
