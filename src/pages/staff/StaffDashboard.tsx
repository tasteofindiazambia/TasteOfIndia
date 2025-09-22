import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { reservationService } from '../../services/reservationService';

interface DashboardStats {
  todayOrders: number;
  pendingOrders: number;
  todayReservations: number;
  upcomingReservations: number;
}

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    pendingOrders: 0,
    todayReservations: 0,
    upcomingReservations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get today's date
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Fetch orders
        const orders = await orderService.getOrders();
        const todayOrders = orders.filter(order => 
          order.created_at?.startsWith(todayStr)
        );
        const pendingOrders = orders.filter(order => 
          order.status === 'pending' || order.status === 'confirmed'
        );
        
        // Fetch reservations
        const reservations = await reservationService.getReservations();
        const todayReservations = reservations.filter(reservation => {
          const reservationDate = new Date(reservation.date_time).toISOString().split('T')[0];
          return reservationDate === todayStr;
        });
        const upcomingReservations = reservations.filter(reservation => {
          const reservationDate = new Date(reservation.date_time);
          return reservationDate >= today && reservation.status !== 'cancelled';
        });
        
        setStats({
          todayOrders: todayOrders.length,
          pendingOrders: pendingOrders.length,
          todayReservations: todayReservations.length,
          upcomingReservations: upcomingReservations.length
        });
        
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: ClipboardList,
      color: 'bg-blue-500',
      description: 'Orders received today'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: 'bg-orange-500',
      description: 'Orders needing attention'
    },
    {
      title: "Today's Reservations",
      value: stats.todayReservations,
      icon: Calendar,
      color: 'bg-green-500',
      description: 'Tables booked today'
    },
    {
      title: 'Upcoming Reservations',
      value: stats.upcomingReservations,
      icon: Clock,
      color: 'bg-purple-500',
      description: 'Future reservations'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Today's Overview</h1>
        <p className="mt-1 text-gray-600">
          Quick summary of today's operations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${card.color} rounded-md flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {card.value}
                      </dd>
                      <dd className="text-xs text-gray-400 mt-1">
                        {card.description}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/staff/orders"
            className="flex items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-deep-maroon hover:bg-gray-50 transition-colors"
          >
            <ClipboardList className="w-6 h-6 text-deep-maroon mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Manage Orders</h3>
              <p className="text-sm text-gray-600">View and update order status</p>
            </div>
          </a>
          
          <a
            href="/staff/reservations"
            className="flex items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-deep-maroon hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-6 h-6 text-deep-maroon mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Manage Reservations</h3>
              <p className="text-sm text-gray-600">Handle table bookings</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
