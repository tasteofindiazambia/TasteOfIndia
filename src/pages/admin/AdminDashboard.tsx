import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBag, Calendar, DollarSign, Clock, TrendingUp, Users, 
  Star, AlertTriangle, BarChart3, PieChart, Activity, Target,
  Download, Filter, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { Order, Reservation } from '../../types';
import { orderService } from '../../services/orderService';
import { reservationService } from '../../services/reservationService';
import { useRestaurant } from '../../context/RestaurantContext';
import AdminLocationSwitcher from '../../components/AdminLocationSwitcher';

const AdminDashboard: React.FC = () => {
  const { selectedRestaurant } = useRestaurant();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    todayReservations: 0,
    averageOrderValue: 0,
    customerRetention: 0,
    weeklyGoal: 5000,
    weeklyActual: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [showWidgets, setShowWidgets] = useState({
    revenueChart: true,
    orderVolume: true,
    popularItems: true,
    peakHours: true,
    locationComparison: true,
    alerts: true
  });

  // Sample analytics data for demonstration
  const sampleAnalytics = {
    revenueData: {
      daily: [120, 180, 220, 190, 250, 280, 320],
      weekly: [1200, 1400, 1600, 1800, 2000, 2200, 2400],
      monthly: [8000, 8500, 9000, 9500, 10000, 10500, 11000]
    },
    orderVolume: {
      daily: [15, 22, 28, 24, 32, 35, 42],
      weekly: [150, 180, 200, 220, 240, 260, 280],
      monthly: [1000, 1100, 1200, 1300, 1400, 1500, 1600]
    },
    popularItems: [
      { name: 'Chicken Biryani', orders: 45, revenue: 1125 },
      { name: 'Samosas', orders: 38, revenue: 304 },
      { name: 'Butter Chicken', orders: 32, revenue: 800 },
      { name: 'Naan Bread', orders: 28, revenue: 140 },
      { name: 'Mango Lassi', orders: 25, revenue: 125 }
    ],
    peakHours: [
      { hour: '11:00', orders: 5 },
      { hour: '12:00', orders: 12 },
      { hour: '13:00', orders: 18 },
      { hour: '14:00', orders: 8 },
      { hour: '18:00', orders: 15 },
      { hour: '19:00', orders: 22 },
      { hour: '20:00', orders: 20 },
      { hour: '21:00', orders: 12 }
    ],
    locationComparison: {
      'Manda Hill': { revenue: 8500, orders: 180, avgOrder: 47.22 },
      'Parirenyetwa': { revenue: 6200, orders: 140, avgOrder: 44.29 }
    },
    alerts: [
      { type: 'warning', message: 'Low stock: Basmati rice (5kg remaining)', icon: AlertTriangle },
      { type: 'info', message: 'Peak hour: 7-8 PM (22 orders)', icon: Clock },
      { type: 'success', message: 'Goal achieved: Weekly revenue target met', icon: Target }
    ]
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch orders
      const allOrders = await orderService.getOrders(selectedRestaurant?.id);
      const pendingOrders = await orderService.getOrdersByStatus('received', selectedRestaurant?.id);
      const preparingOrders = await orderService.getOrdersByStatus('preparing', selectedRestaurant?.id);
      
      // Fetch today's reservations
      const reservations = await reservationService.getReservationsByDateRange(
        `${today} 00:00:00`,
        `${today} 23:59:59`,
        selectedRestaurant?.id
      );
      
      // Calculate analytics
      const todayRevenue = allOrders
        .filter(order => order.created_at.startsWith(today))
        .reduce((sum, order) => sum + (order.total || order.total_amount || 0), 0);
      
      const averageOrderValue = allOrders.length > 0 
        ? allOrders.reduce((sum, order) => sum + (order.total || order.total_amount || 0), 0) / allOrders.length 
        : 0;
      
      const weeklyActual = allOrders
        .filter(order => {
          const orderDate = new Date(order.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        })
        .reduce((sum, order) => sum + (order.total || order.total_amount || 0), 0);
      
      setStats({
        totalOrders: allOrders.length,
        pendingOrders: pendingOrders.length + preparingOrders.length,
        todayRevenue,
        todayReservations: reservations.length,
        averageOrderValue,
        customerRetention: 78, // Sample data
        weeklyGoal: 5000,
        weeklyActual
      });
      
      setRecentOrders(allOrders.slice(0, 5));
      setTodayReservations(reservations.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Use sample data if API fails
      setStats({
        totalOrders: 156,
        pendingOrders: 8,
        todayRevenue: 320,
        todayReservations: 12,
        averageOrderValue: 45.50,
        customerRetention: 78,
        weeklyGoal: 5000,
        weeklyActual: 4200
      });
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    fetchDashboardData();
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
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Analytics</h1>
          <p className="text-gray-600 mt-1">Real-time insights and performance metrics</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <AdminLocationSwitcher />
          
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-deep-maroon"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === 'line' ? 'bg-white text-deep-maroon shadow-sm' : 'text-gray-600'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === 'bar' ? 'bg-white text-deep-maroon shadow-sm' : 'text-gray-600'
              }`}
            >
              Bar
            </button>
          </div>
          
          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-deep-maroon">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last week
              </p>
            </div>
            <ShoppingBag className="w-8 h-8 text-deep-maroon" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-warm-pink">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">${stats.todayRevenue.toFixed(2)}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% from yesterday
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-warm-pink" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-rose">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">${stats.averageOrderValue.toFixed(2)}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5% from last month
              </p>
            </div>
            <Target className="w-8 h-8 text-rose" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gold">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customer Retention</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.customerRetention}%</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3% from last month
              </p>
            </div>
            <Users className="w-8 h-8 text-gold" />
          </div>
        </div>
      </div>

      {/* Weekly Goal Progress */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Weekly Revenue Goal</h3>
          <span className="text-sm text-gray-600">
            ${stats.weeklyActual.toFixed(0)} / ${stats.weeklyGoal.toFixed(0)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-deep-maroon to-warm-pink h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((stats.weeklyActual / stats.weeklyGoal) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {((stats.weeklyActual / stats.weeklyGoal) * 100).toFixed(1)}% of weekly goal achieved
        </p>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends Chart */}
        {showWidgets.revenueChart && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
              <button
                onClick={() => setShowWidgets(prev => ({ ...prev, revenueChart: false }))}
                className="text-gray-400 hover:text-gray-600"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {sampleAnalytics.revenueData[dateRange].map((value, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-8 rounded-t ${
                      chartType === 'bar' 
                        ? 'bg-gradient-to-t from-deep-maroon to-warm-pink' 
                        : 'bg-deep-maroon'
                    }`}
                    style={{ height: `${(value / Math.max(...sampleAnalytics.revenueData[dateRange])) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">${value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Items Chart */}
        {showWidgets.popularItems && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Popular Items</h3>
              <button
                onClick={() => setShowWidgets(prev => ({ ...prev, popularItems: false }))}
                className="text-gray-400 hover:text-gray-600"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {sampleAnalytics.popularItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-deep-maroon' :
                      index === 1 ? 'bg-warm-pink' :
                      index === 2 ? 'bg-rose' :
                      index === 3 ? 'bg-gold' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{item.orders} orders</p>
                    <p className="text-xs text-gray-600">${item.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Location Comparison */}
      {showWidgets.locationComparison && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Location Performance</h3>
            <button
              onClick={() => setShowWidgets(prev => ({ ...prev, locationComparison: false }))}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(sampleAnalytics.locationComparison).map(([location, data]) => (
              <div key={location} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{location}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="text-sm font-semibold">${data.revenue.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Orders:</span>
                    <span className="text-sm font-semibold">{data.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Order:</span>
                    <span className="text-sm font-semibold">${data.avgOrder.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Panel */}
      {showWidgets.alerts && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            <button
              onClick={() => setShowWidgets(prev => ({ ...prev, alerts: false }))}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {sampleAnalytics.alerts.map((alert, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                alert.type === 'info' ? 'bg-blue-50 border border-blue-200' :
                'bg-green-50 border border-green-200'
              }`}>
                <alert.icon className={`w-5 h-5 ${
                  alert.type === 'warning' ? 'text-yellow-600' :
                  alert.type === 'info' ? 'text-blue-600' :
                  'text-green-600'
                }`} />
                <span className="text-sm text-gray-700">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders & Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
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
              <p className="text-gray-500 text-center py-4">No reservations today</p>
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
    </div>
  );
};

export default AdminDashboard;
