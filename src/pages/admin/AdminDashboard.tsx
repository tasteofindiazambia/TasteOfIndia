import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag, DollarSign, Star, MapPin, RefreshCw
} from 'lucide-react';
import { Order, Reservation } from '../../types';
import { orderService } from '../../services/orderService';
import { reservationService } from '../../services/reservationService';
import { useRestaurant } from '../../context/RestaurantContext';
import AdminLocationSwitcher from '../../components/AdminLocationSwitcher';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';

const AdminDashboard: React.FC = () => {
  const { selectedRestaurant } = useRestaurant();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    popularItem: '',
    locationPerformance: {}
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enable order notifications
  useOrderNotifications({ 
    restaurantId: selectedRestaurant?.id, 
    enabled: true 
  });

  // Real data will be fetched from API

  const fetchDashboardData = useCallback(async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch orders and reservations
      const [allOrders, reservations] = await Promise.all([
        orderService.getOrders(selectedRestaurant?.id),
        reservationService.getReservationsByDateRange(
          `${today} 00:00:00`,
          `${today} 23:59:59`,
          selectedRestaurant?.id
        )
      ]);
      
      // Calculate total revenue
      const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || order.total_amount || 0), 0);
      
      // Set popular item (simplified for now)
      const popularItem = 'N/A';
      
      // Location performance - simplified for now
      const locationPerformance = {
        [selectedRestaurant?.name || 'Current Location']: { 
          revenue: totalRevenue, 
          orders: allOrders.length 
        }
      };
      
      setStats({
        totalOrders: allOrders.length,
        totalRevenue,
        popularItem,
        locationPerformance
      });
      
      setRecentOrders(allOrders.slice(0, 5));
      setTodayReservations(reservations.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Show empty state if API fails
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        popularItem: 'No data available',
        locationPerformance: {}
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...');
      fetchDashboardData(true);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-light-cream text-deep-maroon';
      case 'preparing': return 'bg-light-cream text-burgundy';
      case 'ready': return 'bg-light-cream text-deep-maroon';
      case 'completed': return 'bg-light-cream text-warm-gray';
      default: return 'bg-light-cream text-warm-gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                    {isRefreshing && (
                      <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">
                    Overview of your restaurant performance
                    {isRefreshing && <span className="text-blue-500 ml-2">• Refreshing...</span>}
                  </p>
                </div>
                <AdminLocationSwitcher />
              </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-deep-maroon">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-deep-maroon" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-warm-pink">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">K{stats.totalRevenue.toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-warm-pink" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-rose">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Popular Item</p>
              <p className="text-lg font-bold text-gray-900">{stats.popularItem}</p>
            </div>
            <Star className="w-8 h-8 text-rose" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gold">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locations</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{Object.keys(stats.locationPerformance).length}</p>
            </div>
            <MapPin className="w-8 h-8 text-gold" />
          </div>
        </div>
      </div>

      {/* Location Performance */}
      {Object.keys(stats.locationPerformance).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(stats.locationPerformance).map(([location, data]: [string, any]) => (
              <div key={location} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{location}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="text-sm font-semibold">K{data.revenue.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Orders:</span>
                    <span className="text-sm font-semibold">{data.orders}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Recent Orders & Today's Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No recent orders</p>
                <p className="text-sm text-gray-400">Orders will appear here once customers start placing them</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer_name} - K{(order.total || order.total_amount || 0).toFixed(0)}</p>
                  </div>
                  <span className={`px-2 py-1 text-sm rounded ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Reservations</h2>
          <div className="space-y-3">
            {todayReservations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No reservations today</p>
                <p className="text-sm text-gray-400">Reservations will appear here once customers book tables</p>
              </div>
            ) : (
              todayReservations.map((reservation) => (
                <div key={reservation.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{reservation.customer_name}</p>
                    <p className="text-sm text-gray-600">
                      {formatTime(reservation.date_time)} - Party of {reservation.party_size}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    {reservation.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Empty State Message */}
      {stats.totalOrders === 0 && stats.totalRevenue === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Welcome to Taste of India Admin!</h3>
          <p className="text-blue-700 mb-4">
            Your dashboard is ready. Start by importing your menu items from the Menu Management section using your CSV file.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.href = '/admin/menu'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Import Menu Items
            </button>
            <button 
              onClick={() => window.location.href = '/admin/orders'}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
