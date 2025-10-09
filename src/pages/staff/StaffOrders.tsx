import React, { useState, useEffect } from 'react';
import { 
  Eye,
  Clock,
  CheckCircle,
  Package,
  Search,
  Filter,
  MessageSquare
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

const StaffOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const fetchedOrders = await orderService.getOrders();
        // Filter out any invalid orders
        const validOrders = (fetchedOrders || []).filter((order: any) => order && order.id);
        setOrders(validOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      if (!orderId || orderId === undefined) {
        console.error('Invalid order ID:', orderId);
        return;
      }
      
      await orderService.updateOrderStatus({ 
        orderId, 
        status: newStatus as any
      });
      
      setOrders(orders.map((order: any) => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    // Ensure order has required fields
    if (!order || !order.id) {
      return false;
    }
    
    const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helpers to render item details coming from API (or fallback)
  const getOrderItems = (order: Order): any[] => {
    const raw = (order as any).items;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as any[];
    try {
      const parsed = JSON.parse(raw as unknown as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const buildItemsSummary = (order: Order): string => {
    const items = getOrderItems(order);
    if (!items.length) return "";
    const parts = items.slice(0, 3).map((it: any) => {
      const name = it.menu_item_name || it.name || 'Item';
      const qty = it.quantity || 1;
      return `${name} × ${qty}`;
    });
    const more = items.length > 3 ? ` +${items.length - 3} more` : '';
    return parts.join(', ') + more;
  };

  const formatMoney = (n: number | string | undefined): string => {
    const num = Number(n || 0);
    if (Number.isNaN(num)) return 'K0';
    return `K${num.toFixed(0)}`; // match app style (no decimals)
  };

  const computeOrderTotal = (order: any): number => {
    const apiTotal = Number(order.total_amount ?? order.total);
    if (!Number.isNaN(apiTotal) && apiTotal > 0) return apiTotal;
    const items = getOrderItems(order);
    const itemsSum = items.reduce((sum: number, it: any) => {
      const qty = Number(it.quantity || 1);
      const unit = it.total_price && qty ? Number(it.total_price) / qty : Number(it.unit_price ?? it.price ?? 0);
      return sum + qty * (Number.isNaN(unit) ? 0 : unit);
    }, 0);
    const fee = Number(order.delivery_fee || 0);
    return itemsSum + (Number.isNaN(fee) ? 0 : fee);
  };

  const buildWhatsAppLink = (phone: string | undefined, orderNumber?: string) => {
    if (!phone) return '#';
    // Strip non-digits and keep leading + if present
    const cleaned = phone.replace(/[^\d+]/g, '');
    const text = orderNumber 
      ? `Hello, this is Taste of India staff regarding order ${orderNumber}.`
      : `Hello, this is Taste of India staff regarding your order.`;
    return `https://wa.me/${encodeURIComponent(cleaned)}?text=${encodeURIComponent(text)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle;
      case 'preparing': return Package;
      case 'ready': return CheckCircle;
      case 'delivered': return CheckCircle;
      default: return Clock;
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
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="mt-1 text-gray-600">
          View and update order status
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            />
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
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No orders available at the moment.'
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <div key={order.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <StatusIcon className="w-8 h-8 text-deep-maroon" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.order_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Customer: {order.customer_name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: {formatMoney(computeOrderTotal(order))}
                        </p>
                        {buildItemsSummary(order) && (
                          <p className="text-xs text-gray-500 truncate">
                            {buildItemsSummary(order)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at || '').toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <a
                        href={buildWhatsAppLink(order.customer_phone, (order as any).order_number)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-green-500 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </a>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      
                      {order.status !== 'delivered' && order.status !== 'cancelled' && order.id && (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{selectedOrder.order_number}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
                  <p className="flex items-center gap-2">
                    <span><strong>Phone:</strong> {selectedOrder.customer_phone}</span>
                    <a
                      href={buildWhatsAppLink(selectedOrder.customer_phone, selectedOrder.order_number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 border border-green-500 text-xs font-medium rounded text-green-700 bg-white hover:bg-green-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" /> Message customer
                    </a>
                  </p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p><strong>Total:</strong> {formatMoney(computeOrderTotal(selectedOrder))}</p>
                  <p><strong>Order Time:</strong> {new Date(selectedOrder.created_at || '').toLocaleString()}</p>
                </div>
                
                {getOrderItems(selectedOrder).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {getOrderItems(selectedOrder).map((item: any, index: number) => {
                        const name = item.menu_item_name || item.name || 'Unknown Item';
                        const qty = item.quantity || 1;
                        // Prefer total_price/qty for accurate unit when item is per-gram
                        const computedUnit = item.total_price && qty ? (Number(item.total_price) / qty) : undefined;
                        const unit = computedUnit ?? item.unit_price ?? item.price ?? 0;
                        const line = (qty * Number(unit));
                        return (
                          <div key={index} className="p-2 bg-gray-50 rounded">
                            <div className="flex justify-between items-center">
                              <span>{name}</span>
                              <span>Qty: {qty} × {formatMoney(unit)} = {formatMoney(line)}</span>
                            </div>
                            {(item.special_instructions || item.note) && (
                              <div className="text-xs text-gray-500 mt-1">
                                Note: {item.special_instructions || item.note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Delivery details */}
                {(selectedOrder as any).order_type === 'delivery' && (
                  <div className="pt-2 border-t">
                    <h4 className="font-semibold mb-2">Delivery</h4>
                    <p><strong>Address:</strong> {(selectedOrder as any).delivery_address || '—'}</p>
                    <p><strong>Distance:</strong> {(selectedOrder as any).delivery_distance_km ? `${(selectedOrder as any).delivery_distance_km} km` : '—'}</p>
                    <p><strong>Fee:</strong> K{((selectedOrder as any).delivery_fee || 0).toFixed(2)}</p>
                  </div>
                )}

                {(selectedOrder as any).special_instructions && (
                  <div className="pt-2 border-t">
                    <h4 className="font-semibold mb-2">Special Instructions</h4>
                    <p className="text-sm text-gray-700">{(selectedOrder as any).special_instructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOrders;
