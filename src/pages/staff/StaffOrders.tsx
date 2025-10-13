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
        console.log('🔄 [StaffOrders] Fetching orders...');
        const fetchedOrders = await orderService.getOrders();
        // Filter out any invalid orders
        const validOrders = (fetchedOrders || []).filter((order: any) => order && order.id);
        console.log(`📋 [StaffOrders] Fetched ${validOrders.length} orders`);
        console.log('📋 [StaffOrders] Order IDs:', validOrders.map(o => ({ id: o.id, order_number: o.order_number, status: o.status })));
        setOrders(validOrders);
      } catch (error) {
        console.error('❌ [StaffOrders] Error fetching orders:', error);
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
    
    const matchesSearch = order.id?.toString().includes(searchTerm.toLowerCase()) ||
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
    const parts = items.slice(0, 2).map((it: any) => {
      const name = it.menu_item_name || it.name || 'Item';
      const qty = it.quantity || 1;
      const basePrice = it.unit_price || it.price || 0;
      const itemTotal = basePrice * qty;
      const packagingPrice = (it.packaging_price || 0) * qty;
      const totalPrice = itemTotal + packagingPrice;
      
      let itemText = `${name} × ${qty}`;
      if (it.grams) itemText += ` (${it.grams}g)`;
      itemText += ` = K${totalPrice.toFixed(0)}`;
      if (packagingPrice > 0) {
        itemText += ` (inc. K${packagingPrice.toFixed(0)} packaging)`;
      }
      return itemText;
    });
    const more = items.length > 2 ? ` +${items.length - 2} more items` : '';
    return parts.join(', ') + more;
  };

  const formatMoney = (n: number | string | undefined): string => {
    const num = Number(n || 0);
    if (Number.isNaN(num)) return 'K0';
    return `K${num.toFixed(0)}`; // match app style (no decimals)
  };

  const formatPerGramPrice = (n: number | string | undefined): string => {
    const num = Number(n || 0);
    if (Number.isNaN(num)) return 'K0.00';
    return `K${num.toFixed(2)}`; // show decimals for per-gram pricing
  };

  const computeOrderTotal = (order: any): number => {
    const apiTotal = Number(order.total_amount ?? order.total);
    if (!Number.isNaN(apiTotal) && apiTotal > 0) return apiTotal;
    const items = getOrderItems(order);
    const itemsSum = items.reduce((sum: number, it: any) => {
      const qty = Number(it.quantity || 1);
      // For dynamic pricing items, use the stored total_price
      if (it.total_price) {
        return sum + (Number(it.total_price) * qty);
      }
      // For regular items, use unit_price or price
      const unit = Number(it.unit_price ?? it.price ?? 0);
      return sum + qty * (Number.isNaN(unit) ? 0 : unit);
    }, 0);
    const fee = Number(order.delivery_fee || 0);
    return itemsSum + (Number.isNaN(fee) ? 0 : fee);
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone;
    
    // Remove all non-digit characters
    const digits = phone.replace(/[^0-9]/g, '');
    
    // If it starts with 260 (Zambia country code without +)
    if (digits.startsWith('260')) {
      // Remove the leading 0 from the local number if it exists
      const localNumber = digits.substring(3);
      if (localNumber.startsWith('0')) {
        return `+260${localNumber.substring(1)}`;
      }
      return `+${digits}`;
    }
    
    // If it already has +260, check for redundant zero
    if (phone.startsWith('+260')) {
      const localNumber = phone.substring(4);
      if (localNumber.startsWith('0')) {
        return `+260${localNumber.substring(1)}`;
      }
      return phone;
    }
    
    // Return as is if no formatting needed
    return phone;
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
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready for pickup': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing': return Package;
      case 'ready for pickup': return CheckCircle;
      case 'delivered': return CheckCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-4 sm:mb-6"></div>
          <div className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-3 sm:p-4 rounded-lg shadow h-16 sm:h-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600">
          View and update order status
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon text-sm sm:text-base"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 sm:pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon appearance-none bg-white text-sm sm:text-base"
            >
              <option value="all">All Status</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="out for delivery">Out for Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 sm:p-8 text-center">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-sm sm:text-base text-gray-600">
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
              <div key={order.id} className="bg-white shadow rounded-lg p-4 sm:p-6">
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className="w-6 h-6 text-deep-maroon flex-shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at || '').toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      Customer: {order.customer_name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: {formatMoney(computeOrderTotal(order))}
                    </p>
                    {buildItemsSummary(order) && (
                      <p className="text-xs text-gray-500">
                        {buildItemsSummary(order)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <a
                        href={buildWhatsAppLink(order.customer_phone, order.id.toString())}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-green-500 text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </a>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </div>
                    
                    {order.status !== 'delivered' && order.id && (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                      >
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="out for delivery">Out for Delivery</option>
                      </select>
                    )}
                  </div>
                </div>
                
                {/* Desktop Layout */}
                <div className="hidden sm:block">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <StatusIcon className="w-8 h-8 text-deep-maroon" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id}
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
                          href={buildWhatsAppLink(order.customer_phone, order.id.toString())}
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
                        
                        {order.status !== 'delivered' && order.id && (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                          >
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="out for delivery">Out for Delivery</option>
                          </select>
                        )}
                      </div>
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
                  Order #{selectedOrder.id}
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
                    <span><strong>Phone:</strong> {formatPhoneNumber(selectedOrder.customer_phone)}</span>
                    <a
                      href={buildWhatsAppLink(selectedOrder.customer_phone, selectedOrder.id.toString())}
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
                        
                        // For dynamic pricing items, calculate per-gram price and item total correctly
                        let basePrice, itemTotal, packagingPrice, totalPrice, grams;
                        
                        // Extract grams from special_instructions if not directly available
                        if (item.grams) {
                          grams = item.grams;
                        } else if (item.special_instructions && item.special_instructions.includes('g per package')) {
                          // Extract grams from special_instructions like "100g per package -"
                          const match = item.special_instructions.match(/(\d+)g per package/);
                          grams = match ? parseInt(match[1]) : null;
                        }
                        
                        if (grams && item.unit_price && item.unit_price < 10) {
                          // Dynamic pricing: basePrice is per-gram price
                          basePrice = item.unit_price; // per-gram
                          itemTotal = basePrice * grams * qty;
                          const perUnitPackaging = item.packaging_price ?? item.menu_items?.packaging_price ?? item.menuItem?.packaging_price ?? 0;
                          packagingPrice = perUnitPackaging * qty;
                          totalPrice = itemTotal + packagingPrice;
                        } else {
                          // Regular pricing
                          basePrice = item.unit_price || item.price || 0;
                          itemTotal = basePrice * qty;
                          const perUnitPackaging = item.packaging_price ?? item.menu_items?.packaging_price ?? item.menuItem?.packaging_price ?? 0;
                          packagingPrice = perUnitPackaging * qty;
                          totalPrice = itemTotal + packagingPrice;
                        }
                        
                        return (
                          <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <span className="font-medium text-gray-900">{name}</span>
                                <span className="text-gray-600 ml-2">× {qty}</span>
                                {item.grams && (
                                  <span className="text-gray-500 ml-2">({item.grams}g)</span>
                                )}
                                {(item.special_instructions || item.note) && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Note: {item.special_instructions || item.note}
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-deep-maroon">{formatMoney(totalPrice)}</span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1 bg-white p-2 rounded border">
                              {grams ? (
                                // Dynamic pricing breakdown
                                <div className="space-y-1">
                                  <div className="font-medium text-gray-800">Order Total Breakdown:</div>
                                  <div>• Price: {formatPerGramPrice(basePrice)} per gram</div>
                                  <div>• Weight: {grams}g × {qty} packet{qty > 1 ? 's' : ''}</div>
                                  <div>• Item cost: {grams}g × {qty} × {formatPerGramPrice(basePrice)} = {formatMoney(itemTotal)}</div>
                                  {packagingPrice > 0 && (
                                    <div>• Packaging: {formatMoney((item.packaging_price ?? item.menu_items?.packaging_price ?? item.menuItem?.packaging_price ?? 0))} × {qty} = {formatMoney(packagingPrice)}</div>
                                  )}
                                  <div className="font-medium text-deep-maroon">• Total: {formatMoney(totalPrice)}</div>
                                </div>
                              ) : (
                                // Regular pricing breakdown
                                <div className="space-y-1">
                                  <div className="font-medium text-gray-800">Order Total Breakdown:</div>
                                  <div>• Base price: {formatMoney(basePrice)} each</div>
                                  <div>• Quantity: {qty} item{qty > 1 ? 's' : ''}</div>
                                  <div>• Item cost: {qty} × {formatMoney(basePrice)} = {formatMoney(itemTotal)}</div>
                                  {packagingPrice > 0 && (
                                    <div>• Packaging: {formatMoney((item.packaging_price ?? item.menu_items?.packaging_price ?? item.menuItem?.packaging_price ?? 0))} × {qty} = {formatMoney(packagingPrice)}</div>
                                  )}
                                  <div className="font-medium text-deep-maroon">• Total: {formatMoney(totalPrice)}</div>
                                </div>
                              )}
                            </div>
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

                {/* Pickup details */}
                {(selectedOrder as any).order_type === 'pickup' && (
                  <div className="pt-2 border-t">
                    <h4 className="font-semibold mb-2">Pickup</h4>
                    <p><strong>Location:</strong> {
                      (selectedOrder as any).restaurant_id === 1 ? 'Taste of India - Manda Hill' : 
                      (selectedOrder as any).restaurant_id === 2 ? 'Taste of India - Parirenyetwa' : 
                      `Restaurant ${(selectedOrder as any).restaurant_id}`
                    }</p>
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
