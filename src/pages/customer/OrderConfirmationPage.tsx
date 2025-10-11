import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, Phone, MessageSquare } from 'lucide-react';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';
import WhatsAppShare from '../../components/WhatsAppShare';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        console.log('No orderId provided');
        setError('No order ID provided');
        setLoading(false);
        return;
      }
      
      console.log('Fetching order with ID/Token:', orderId);
      console.log('Order ID length:', orderId.length);
      console.log('Is numeric:', !isNaN(parseInt(orderId)));
      
      try {
        setLoading(true);
        
        // Validate token format (should be 64 hex characters)
        const isValidToken = orderId.length === 64 && /^[a-f0-9]+$/i.test(orderId);
        const isNumericId = !isNaN(parseInt(orderId)) && orderId.length < 10;
        
        console.log('Is valid token:', isValidToken);
        console.log('Is numeric ID:', isNumericId);
        
        let orderData;
        if (isNumericId) {
          // Numeric ID - admin access
          orderData = await orderService.getOrder(parseInt(orderId));
        } else if (isValidToken) {
          // Valid token - customer access
          orderData = await orderService.getOrderByToken(orderId);
        } else {
          // Invalid format
          throw new Error('Invalid order identifier format');
        }
        
        // Parse the items if they're stored as JSON string
        if (typeof orderData.items === 'string') {
          orderData.items = JSON.parse(orderData.items);
        }
        
        console.log('Order data received:', orderData);
        console.log('Order items:', orderData.items);
        console.log('Order items type:', typeof orderData.items);
        console.log('Order items length:', orderData.items?.length);
        if (orderData.items && orderData.items.length > 0) {
          console.log('First item:', orderData.items[0]);
          console.log('First item keys:', Object.keys(orderData.items[0]));
        }
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mb-4">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-4">
              {error || 'We couldn\'t find the order you\'re looking for.'}
            </p>
            
            {orderId && (
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-2">Troubleshooting:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Make sure you're using the correct confirmation link</li>
                  <li>• Check if the link was copied completely</li>
                  <li>• Try refreshing the page</li>
                  <li>• Contact us if the problem persists</li>
                </ul>
                <p className="text-xs text-gray-400 mt-2">
                  Order ID: {orderId?.substring(0, 10)}...
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <Link 
              to="/" 
              className="inline-block bg-deep-maroon text-white px-6 py-2 rounded-lg hover:bg-burgundy transition-colors"
            >
              Return to Home
            </Link>
            <br />
            <Link 
              to="/contact" 
              className="text-deep-maroon hover:underline text-sm"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'text-orange-800 bg-orange-100';
      case 'ready': return 'text-green-800 bg-green-100';
      case 'delivered': return 'text-gray-800 bg-gray-100';
      case 'out for delivery': return 'text-blue-800 bg-blue-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusText = (status: string, orderType?: string) => {
    switch (status) {
      case 'preparing': return 'Preparing Your Order';
      case 'ready': return orderType === 'delivery' ? 'Ready for Delivery' : 'Ready for Pickup';
      case 'delivered': return 'Order Delivered';
      case 'out for delivery': return 'Out for Delivery';
      default: return status;
    }
  };

  const getEstimatedTime = (order: any) => {
    const prepTime = order.estimated_preparation_time || 20;
    const deliveryTime = order.delivery_time_estimate || 0;
    const totalTime = prepTime + deliveryTime;
    
    return {
      prepTime,
      deliveryTime,
      totalTime
    };
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">
          Thank you for your order. We're preparing your delicious meal.
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">Order #{order.id}</h2>
            <p className="text-gray-600">
              Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
              {new Date(order.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </div>
        </div>

        {/* Customer Info */}
        <div className="border-t pt-4 mb-4">
          <h3 className="font-semibold mb-2">Customer Information</h3>
          <p className="text-gray-700">{order.customer_name}</p>
          <p className="text-gray-700">{order.customer_phone}</p>
        </div>

        {/* Order Type & Delivery Info */}
        <div className="border-t pt-4 mb-4">
          <h3 className="font-semibold mb-2">Order Type & Timing</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              {order.order_type === 'pickup' ? (
                <>
                  <span className="text-2xl mr-2">🏪</span>
                  <span className="font-medium text-deep-maroon">Pickup Order</span>
                </>
              ) : (
                <>
                  <span className="text-2xl mr-2">🚚</span>
                  <span className="font-medium text-deep-maroon">Delivery Order</span>
                </>
              )}
            </div>
            
            {order.order_type === 'delivery' && order.delivery_address && (
              <div className="ml-8">
                <p className="text-sm text-gray-600">Delivery Address:</p>
                <p className="text-gray-700">{order.delivery_address}</p>
              </div>
            )}
            
            <div className="ml-8 space-y-1">
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span>Preparation Time: {getEstimatedTime(order).prepTime} minutes</span>
              </div>
              
              {order.order_type === 'delivery' && (
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Delivery Time: +{getEstimatedTime(order).deliveryTime} minutes</span>
                </div>
              )}
              
              <div className="flex items-center text-sm font-medium text-deep-maroon">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  Total Estimated Time: {getEstimatedTime(order).totalTime} minutes
                  {order.order_type === 'delivery' ? ' (including delivery)' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t pt-4 mb-4">
          <h3 className="font-semibold mb-3">Order Items</h3>
          <div className="space-y-2">
            {order.items && order.items.length > 0 ? (
              order.items.map((item: any, index: number) => {
                const itemName = item.menu_item_name || item.name || item.menu_items?.name || 'Unknown Item';
                const basePrice = item.unit_price || item.price || 0;
                const quantity = item.quantity || 1;
                const itemTotal = basePrice * quantity;
                const packagingPrice = (item.packaging_price || 0) * quantity;
                const totalPrice = itemTotal + packagingPrice;
                
                return (
                  <div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 text-lg">
                          {itemName}
                        </span>
                        <span className="text-gray-600 ml-2">× {quantity}</span>
                        {item.grams && (
                          <span className="text-gray-500 ml-2">({item.grams}g per packet)</span>
                        )}
                        {item.special_instructions && (
                          <div className="text-sm text-gray-500 italic mt-2">
                            Note: {item.special_instructions}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-deep-maroon text-lg">
                        K{totalPrice.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                      {item.grams ? (
                        // Dynamic pricing breakdown
                        <div className="space-y-1">
                          <p className="font-medium text-gray-800">Order Total Breakdown:</p>
                          <p>• Price: K{basePrice.toFixed(0)} per gram</p>
                          <p>• Weight: {item.grams}g × {quantity} packet{quantity > 1 ? 's' : ''}</p>
                          <p>• Item cost: {item.grams}g × {quantity} × K{basePrice.toFixed(0)} = K{itemTotal.toFixed(0)}</p>
                          {packagingPrice > 0 && (
                            <p>• Packaging: K{item.packaging_price?.toFixed(0) || '0'} × {quantity} = K{packagingPrice.toFixed(0)}</p>
                          )}
                          <p className="font-medium text-deep-maroon">• Total: K{totalPrice.toFixed(0)}</p>
                        </div>
                      ) : (
                        // Regular pricing breakdown
                        <div className="space-y-1">
                          <p className="font-medium text-gray-800">Order Total Breakdown:</p>
                          <p>• Base price: K{basePrice.toFixed(0)} each</p>
                          <p>• Quantity: {quantity} item{quantity > 1 ? 's' : ''}</p>
                          <p>• Item cost: {quantity} × K{basePrice.toFixed(0)} = K{itemTotal.toFixed(0)}</p>
                          {packagingPrice > 0 && (
                            <p>• Packaging: K{item.packaging_price?.toFixed(0) || '0'} × {quantity} = K{packagingPrice.toFixed(0)}</p>
                          )}
                          <p className="font-medium text-deep-maroon">• Total: K{totalPrice.toFixed(0)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                <div>No items found</div>
                <div className="text-sm mt-2">
                  Debug: items = {JSON.stringify(order.items)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Special Instructions */}
        {order.special_instructions && (
          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Special Instructions
            </h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded">
              {order.special_instructions}
            </p>
          </div>
        )}

        {/* Total */}
        <div className="border-t pt-4 space-y-2">
          {/* Calculate items total and packaging total */}
          {(() => {
            const itemsTotal = order.items?.reduce((total: number, item: any) => {
              const basePrice = item.unit_price || item.price || 0;
              const quantity = item.quantity || 1;
              return total + (basePrice * quantity);
            }, 0) || 0;
            
            const packagingTotal = order.items?.reduce((total: number, item: any) => {
              const packagingPrice = item.packaging_price || 0;
              const quantity = item.quantity || 1;
              return total + (packagingPrice * quantity);
            }, 0) || 0;
            
            const subtotal = itemsTotal + packagingTotal;
            
            return (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span>Items Total:</span>
                  <span>K{itemsTotal.toFixed(0)}</span>
                </div>
                {packagingTotal > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Packaging:</span>
                    <span>K{packagingTotal.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span>K{subtotal.toFixed(0)}</span>
                </div>
                {order.delivery_fee && order.delivery_fee > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Delivery Fee:</span>
                    <span>K{order.delivery_fee.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-deep-maroon">K{(order.total || order.total_amount || 0).toFixed(0)}</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Order Status
        </h3>
        <div className="space-y-3">
          <div className={`flex items-center ${order.status === 'preparing' ? 'text-deep-maroon' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full mr-3 ${order.status === 'preparing' ? 'bg-deep-maroon' : 'bg-gray-300'}`}></div>
            <span>Preparing Your Order</span>
          </div>
          <div className={`flex items-center ${order.status === 'ready' ? 'text-deep-maroon' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full mr-3 ${order.status === 'ready' ? 'bg-deep-maroon' : 'bg-gray-300'}`}></div>
            <span>{order.order_type === 'delivery' ? 'Ready for Delivery' : 'Ready for Pickup'}</span>
          </div>
          {order.order_type === 'delivery' && (
            <div className={`flex items-center ${order.status === 'out for delivery' ? 'text-deep-maroon' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full mr-3 ${order.status === 'out for delivery' ? 'bg-deep-maroon' : 'bg-gray-300'}`}></div>
              <span>Out for Delivery</span>
            </div>
          )}
          <div className={`flex items-center ${order.status === 'delivered' ? 'text-deep-maroon' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full mr-3 ${order.status === 'delivered' ? 'bg-deep-maroon' : 'bg-gray-300'}`}></div>
            <span>Delivered</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Share */}
      <WhatsAppShare order={order} />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/menu/1"
          className="flex-1 border border-deep-maroon text-deep-maroon text-center py-3 px-6 rounded-lg hover:bg-light-cream transition-colors font-medium"
        >
          Order Again
        </Link>
        <Link
          to="/"
          className="flex-1 bg-deep-maroon text-white text-center py-3 px-6 rounded-lg hover:bg-burgundy transition-colors font-medium"
        >
          Back to Home
        </Link>
      </div>

      {/* Contact Info */}
      <div className="mt-8 bg-light-cream rounded-lg p-6 text-center">
        <h3 className="font-semibold text-deep-maroon mb-2">Need Help?</h3>
        <p className="text-warm-gray mb-3">
          If you have any questions about your order, please contact us:
        </p>
        <div className="flex items-center justify-center space-x-2 text-warm-gray">
          <Phone className="w-4 h-4" />
          <span>+1 (555) 123-4567</span>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
