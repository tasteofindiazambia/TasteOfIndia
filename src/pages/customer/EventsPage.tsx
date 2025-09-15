import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Users, Search, Star, Filter } from 'lucide-react';

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
  status: 'upcoming' | 'ongoing' | 'completed';
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Sample event data
  const sampleEvents: Event[] = [
    {
      id: 1,
      title: "Indian Cooking Masterclass",
      description: "Join our expert chefs for a hands-on cooking class featuring traditional Indian dishes. Learn the secrets of authentic Indian cuisine.",
      location: "Taste of India - Lusaka",
      location_id: 1,
      date: "2025-02-15",
      time: "10:00",
      duration: 3,
      price: 50,
      max_attendees: 20,
      current_attendees: 15,
      image_url: "/api/placeholder/400/300",
      category: "Cooking Class",
      featured: true,
      status: 'upcoming'
    },
    {
      id: 2,
      title: "Spice Tasting Experience",
      description: "Discover the world of Indian spices with our guided tasting session. Learn about different spices and their uses in Indian cooking.",
      location: "Taste of India - Manda Hill",
      location_id: 2,
      date: "2025-02-20",
      time: "14:00",
      duration: 2,
      price: 25,
      max_attendees: 15,
      current_attendees: 8,
      image_url: "/api/placeholder/400/300",
      category: "Tasting",
      featured: true,
      status: 'upcoming'
    },
    {
      id: 3,
      title: "Bollywood Night Dinner",
      description: "Enjoy a special dinner with live Bollywood music and dance performances. Experience the vibrant culture of India.",
      location: "Taste of India - Lusaka",
      location_id: 1,
      date: "2025-02-25",
      time: "19:00",
      duration: 4,
      price: 75,
      max_attendees: 50,
      current_attendees: 32,
      image_url: "/api/placeholder/400/300",
      category: "Entertainment",
      featured: false,
      status: 'upcoming'
    },
    {
      id: 4,
      title: "Kids Indian Food Workshop",
      description: "A fun and interactive cooking workshop designed for children. Kids will learn to make simple Indian snacks and desserts.",
      location: "Taste of India - Manda Hill",
      location_id: 2,
      date: "2025-03-01",
      time: "11:00",
      duration: 2,
      price: 20,
      max_attendees: 12,
      current_attendees: 6,
      image_url: "/api/placeholder/400/300",
      category: "Kids Workshop",
      featured: false,
      status: 'upcoming'
    },
    {
      id: 5,
      title: "Wine & Curry Pairing Evening",
      description: "Explore the perfect pairing of wines with Indian curries. Learn from our sommelier about wine selection for Indian cuisine.",
      location: "Taste of India - Lusaka",
      location_id: 1,
      date: "2025-03-05",
      time: "18:30",
      duration: 3,
      price: 60,
      max_attendees: 25,
      current_attendees: 18,
      image_url: "/api/placeholder/400/300",
      category: "Wine Tasting",
      featured: true,
      status: 'upcoming'
    },
    {
      id: 6,
      title: "Traditional Indian Tea Ceremony",
      description: "Experience the art of Indian tea making with our traditional chai ceremony. Learn about different tea varieties and brewing techniques.",
      location: "Taste of India - Manda Hill",
      location_id: 2,
      date: "2025-03-10",
      time: "15:00",
      duration: 1.5,
      price: 15,
      max_attendees: 20,
      current_attendees: 12,
      image_url: "/api/placeholder/400/300",
      category: "Tea Ceremony",
      featured: false,
      status: 'upcoming'
    }
  ];

  const locations = ['all', 'Taste of India - Lusaka', 'Taste of India - Manda Hill'];
  const categories = ['all', 'Cooking Class', 'Tasting', 'Entertainment', 'Kids Workshop', 'Wine Tasting', 'Tea Ceremony'];

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setFilteredEvents(data);
      } else {
        // Fallback to sample data if API fails
        setEvents(sampleEvents);
        setFilteredEvents(sampleEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to sample data
      setEvents(sampleEvents);
      setFilteredEvents(sampleEvents);
    } finally {
      setLoading(false);
    }
  }, [sampleEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    let filtered = events;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(event => event.location === selectedLocation);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    setFilteredEvents(filtered);
  }, [searchQuery, selectedLocation, selectedCategory, events]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getAvailabilityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAvailabilityText = (current: number, max: number) => {
    const remaining = max - current;
    if (remaining <= 0) return 'Sold Out';
    if (remaining <= 5) return `${remaining} spots left`;
    return `${remaining} spots available`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  const featuredEvents = filteredEvents.filter(event => event.featured);
  const regularEvents = filteredEvents.filter(event => !event.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-deep-maroon to-burgundy text-white py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Events & Experiences</h1>
            <p className="text-xl sm:text-2xl mb-8 text-light-cream">
              Join us for exciting culinary events and cultural experiences at our locations
            </p>
            
            {/* Search Bar */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events, categories, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Location Filter */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              >
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-deep-maroon text-white px-2 py-1 rounded text-sm font-medium flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </div>
                    <div className="absolute top-2 right-2 bg-white text-gray-900 px-2 py-1 rounded text-sm font-medium">
                      ${event.price}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-deep-maroon font-medium">{event.category}</span>
                      <span className={`text-sm font-medium ${getAvailabilityColor(event.current_attendees, event.max_attendees)}`}>
                        {getAvailabilityText(event.current_attendees, event.max_attendees)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatTime(event.time)} ({event.duration}h)</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{event.current_attendees}/{event.max_attendees} attendees</span>
                      </div>
                    </div>

                    <button
                      className="w-full bg-deep-maroon text-white py-2 px-4 rounded-lg hover:bg-deep-maroon transition-colors font-medium"
                      disabled={event.current_attendees >= event.max_attendees}
                    >
                      {event.current_attendees >= event.max_attendees ? 'Sold Out' : 'Book Event'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Events */}
        {regularEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white text-gray-900 px-2 py-1 rounded text-sm font-medium">
                      ${event.price}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-deep-maroon font-medium">{event.category}</span>
                      <span className={`text-sm font-medium ${getAvailabilityColor(event.current_attendees, event.max_attendees)}`}>
                        {getAvailabilityText(event.current_attendees, event.max_attendees)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatTime(event.time)} ({event.duration}h)</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{event.current_attendees}/{event.max_attendees} attendees</span>
                      </div>
                    </div>

                    <button
                      className="w-full bg-deep-maroon text-white py-2 px-4 rounded-lg hover:bg-deep-maroon transition-colors font-medium"
                      disabled={event.current_attendees >= event.max_attendees}
                    >
                      {event.current_attendees >= event.max_attendees ? 'Sold Out' : 'Book Event'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
