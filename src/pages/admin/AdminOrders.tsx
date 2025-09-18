import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, Eye, Printer, Search, ArrowUpDown, Phone, MessageSquare, X, Plus, Filter, Download } from 'lucide-react';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';
import { useRestaurant } from '../../context/RestaurantContext';
import { useNotification } from '../../context/NotificationContext';
import CreateOrderModal from '../../components/CreateOrderModal';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';

const AdminOrders: React.FC = () => {
  const { selectedRestaurant } = useRestaurant();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'total'>('newest');
  const [showOrderSidebar, setShowOrderSidebar] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [orderValueRange, setOrderValueRange] = useState<{min: number, max: number}>({
    min: 0,
    max: 1000
  });

  // Enable order notifications
  useOrderNotifications({ 
    restaurantId: selectedRestaurant?.id, 
    enabled: true 
  });

  // Real-time updates
  useRealTimeUpdates({
    restaurantId: selectedRestaurant?.id,
    onNewOrder: (newOrder) => {
      console.log('🆕 Real-time: New order received:', newOrder);
      setOrders(prev => [newOrder, ...prev]);
      showNotification({
        type: 'success',
        message: `New order #${newOrder.id} received from ${newOrder.customer_name}`
      });
    },
    onOrderUpdate: (updatedOrder) => {
      console.log('🔄 Real-time: Order updated:', updatedOrder);
      setOrders(prev => prev.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      ));
      if (selectedOrder && selectedOrder.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      }
    },
    enabled: true
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let ordersData: Order[];
      
      if (filter === 'all') {
        ordersData = await orderService.getOrders(selectedRestaurant?.id);
      } else {
        ordersData = await orderService.getOrdersByStatus(filter, selectedRestaurant?.id);
      }
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant, filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updateOrderStatus({
        orderId,
        status: newStatus as Order['status']
      });
      
      // Update local state immediately for better UX
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
      ));
      
      // Update selected order if it's the same
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({...selectedOrder, status: newStatus as Order['status']});
      }
      
      showNotification({
        type: 'success',
        message: `Order #${orderId} status updated to ${newStatus}`
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      showNotification({
        type: 'error',
        message: 'Failed to update order status'
      });
    }
  };

  const handleViewOrder = (order: Order) => {
    console.log('Order:', order);
    setSelectedOrder(order);
    setShowOrderSidebar(true);
  };

  const handleCloseSidebar = () => {
    setShowOrderSidebar(false);
    setSelectedOrder(null);
  };

  const handleWhatsAppCustomer = (order: Order) => {
    const message = `Hi ${order.customer_name}! This is Taste of India. We received your order #${order.id}. Thank you for choosing us!`;
    const whatsappUrl = `https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePrintOrder = (order: Order) => {
    // Create a print-friendly version of the order
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const orderItems = Array.isArray(order.items) 
        ? order.items 
        : (order.items && typeof order.items === 'string') 
          ? JSON.parse(order.items) 
          : [];
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Order #${order.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 20px; }
              .order-info { margin-bottom: 20px; }
              .items { margin-bottom: 20px; }
              .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .total { font-weight: bold; font-size: 18px; border-top: 1px solid #ccc; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Taste of India</h1>
              <h2>Order #${order.id}</h2>
            </div>
            <div class="order-info">
              <p><strong>Customer:</strong> ${order.customer_name}</p>
              <p><strong>Phone:</strong> ${order.customer_phone}</p>
              <p><strong>Order Time:</strong> ${formatDate(order.created_at)}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
            <div class="items">
              <h3>Order Items:</h3>
              ${orderItems.map((item: {name: string, quantity: number, price: number}) => `
                <div class="item">
                  <span>${item.name} × ${item.quantity}</span>
                  <span>K{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              `).join('')}
            </div>
            <div class="total">
              <div class="item">
                <span>Total:</span>
                <span>K{(order.total || order.total_amount || 0).toFixed(0)}</span>
              </div>
            </div>
            ${order.special_instructions ? `
              <div>
                <h3>Special Instructions:</h3>
                <p>${order.special_instructions}</p>
              </div>
            ` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleOrderCreated = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setShowCreateOrderModal(false);
  };

  const handleBulkAction = (action: string, selectedOrderIds: number[]) => {
    switch (action) {
      case 'mark-ready':
        selectedOrderIds.forEach(id => {
          updateOrderStatus(id, 'ready');
        });
        showNotification({
          type: 'success',
          message: `${selectedOrderIds.length} orders marked as ready`
        });
        break;
      case 'export':
        // Export functionality
        showNotification({
          type: 'info',
          message: 'Export functionality coming soon'
        });
        break;
    }
  };

  const filteredAndSortedOrders = () => {
    let filtered = orders;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_phone.includes(searchQuery) ||
        order.id.toString().includes(searchQuery)
      );
    }

    // Filter by date range
    filtered = filtered.filter(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });

    // Filter by order value range
    filtered = filtered.filter(order => {
      const orderTotal = order.total || order.total_amount || 0;
      return orderTotal >= orderValueRange.min && orderTotal <= orderValueRange.max;
    });

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'total':
          return (b.total || b.total_amount || 0) - (a.total || a.total_amount || 0);
        default:
          return 0;
      }
    });

    return filtered;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return <Clock className="w-4 h-4" />;
      case 'preparing': return <Clock className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${showOrderSidebar ? 'lg:mr-96' : ''}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Create Order Button */}
            <button
              onClick={() => setShowCreateOrderModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Order
            </button>
            
            {/* Export Button */}
            <button
              onClick={() => handleBulkAction('export', [])}
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
            <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              >
                <option value="all">All Orders</option>
                <option value="received">Received</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              />
            </div>

            {/* Order Value Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Value</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={orderValueRange.min}
                  onChange={(e) => setOrderValueRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={orderValueRange.max}
                  onChange={(e) => setOrderValueRange(prev => ({ ...prev, max: parseInt(e.target.value) || 1000 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="order_search"
                name="order_search"
                placeholder="Search by customer name, phone, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              />
            </div>
            
            {/* Sort */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                id="order_sort"
                name="order_sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'total')}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon appearance-none bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="total">Highest Total</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredAndSortedOrders().length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{searchQuery ? 'No orders match your search' : 'No orders found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Customer
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Items
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Time
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedOrders().map((order) => {
                    const orderItems = order.order_items || [];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{order.customer_name}</div>
                        </td>
                        <td className="px-2 sm:px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm text-gray-900">{order.customer_name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {order.customer_phone}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900">{orderItems.length} items</div>
                        </td>
                        <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">K{(order.total || order.total_amount || 0).toFixed(0)}</div>
                        </td>
                        <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 hidden sm:inline">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-deep-maroon hover:text-deep-maroon p-1 rounded hover:bg-light-cream"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePrintOrder(order)}
                              className="text-gray-600 hover:text-gray-900 hidden sm:inline-block"
                              title="Print Order"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => window.open(`tel:${order.customer_phone}`)}
                              className="text-green-600 hover:text-green-900"
                              title="Call Customer"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Sidebar */}
      {showOrderSidebar && selectedOrder && (
        <>
          {/* Mobile Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={handleCloseSidebar}
          />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-screen w-full max-w-sm sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto border-l-2 border-deep-maroon">
            <div className="p-6">
              {/* Sidebar Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Order #{selectedOrder?.id || 'TEST'}</h2>
                <button
                  onClick={handleCloseSidebar}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedOrder?.customer_name || 'Test Customer'}</p>
                    <p><strong>Phone:</strong> {selectedOrder?.customer_phone || '1234567890'}</p>
                    <p><strong>Order Time:</strong> {selectedOrder ? formatDate(selectedOrder.created_at) : '2025-01-01 12:00:00'}</p>
                  </div>
                  
                  {/* Quick Action Buttons */}
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      onClick={() => selectedOrder && window.open(`tel:${selectedOrder.customer_phone}`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Call Customer
                    </button>
                    <button
                      onClick={() => selectedOrder && handleWhatsAppCustomer(selectedOrder)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp Customer
                    </button>
                    <button
                      onClick={() => selectedOrder && handlePrintOrder(selectedOrder)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      Print Order
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder?.order_items && selectedOrder.order_items.length > 0 ? (
                    selectedOrder.order_items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{item.menu_items?.name || 'Unknown Item'}</span>
                          <span className="text-gray-600 ml-2">× {item.quantity}</span>
                        </div>
                        <span className="font-medium text-gray-900">K{item.total_price?.toFixed(0) || '0'}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No items found
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>K{selectedOrder ? (selectedOrder.total || selectedOrder.total_amount || 0).toFixed(0) : '10'}</span>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder?.special_instructions && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Special Instructions</h3>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedOrder.special_instructions}</p>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {['received', 'preparing', 'ready', 'completed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          if (selectedOrder) {
                            updateOrderStatus(selectedOrder.id, status);
                            setSelectedOrder({...selectedOrder, status: status as Order['status']});
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                          selectedOrder?.status === status
                            ? 'bg-deep-maroon text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {getStatusIcon(status)}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Current Status: <span className={`font-medium ${selectedOrder ? getStatusColor(selectedOrder.status).replace('bg-', 'text-').replace('-100', '-800') : 'text-gray-800'}`}>
                        {selectedOrder ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) : 'Received'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={showCreateOrderModal}
        onClose={() => setShowCreateOrderModal(false)}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
};

export default AdminOrders;