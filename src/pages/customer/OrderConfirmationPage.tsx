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
      if (!orderId) return;
      
      try {
        setLoading(true);
        const orderData = await orderService.getOrder(parseInt(orderId));
        
        // Parse the items if they're stored as JSON string
        if (typeof orderData.items === 'string') {
          orderData.items = JSON.parse(orderData.items);
        }
        
        setOrder(orderData);
      } catch (err) {
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
          <p className="text-red-600 text-lg">{error || 'Order not found'}</p>
          <Link to="/" className="text-deep-maroon hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'text-deep-maroon bg-light-cream';
      case 'preparing': return 'text-burgundy bg-light-cream';
      case 'ready': return 'text-deep-maroon bg-light-cream';
      case 'completed': return 'text-warm-gray bg-light-cream';
      default: return 'text-warm-gray bg-light-cream';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Order Received';
      case 'preparing': return 'Preparing Your Order';
      case 'ready': return 'Ready for Pickup';
      case 'completed': return 'Order Completed';
      default: return status;
    }
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

        {/* Order Items */}
        <div className="border-t pt-4 mb-4">
          <h3 className="font-semibold mb-3">Order Items</h3>
          <div className="space-y-2">
            {order.order_items && order.order_items.length > 0 ? (
              order.order_items.map((item: any, index: number) => (
                <div key={item.id || index} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.menu_items?.name || 'Unknown Item'}</span>
                    <span className="text-gray-600 ml-2">× {item.quantity}</span>
                  </div>
                  <span className="font-medium">
                    K{item.total_price?.toFixed(0) || '0'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No items found
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
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span className="text-deep-maroon">K{(order.total || order.total_amount || 0).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Order Status
        </h3>
        <div className="space-y-3">
          <div className={`flex items-center ${order.status === 'received' ? 'text-deep-maroon' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full mr-3 ${order.status === 'received' ? 'bg-deep-maroon' : 'bg-gray-300'}`}></div>
            <span>Order Received</span>
          </div>
          <div className={`flex items-center ${order.status === 'preparing' ? 'text-deep-maroon' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full mr-3 ${order.status === 'preparing' ? 'bg-deep-maroon' : 'bg-gray-300'}`}></div>
            <span>Preparing Your Order</span>
          </div>
          <div className={`flex items-center ${order.status === 'ready' ? 'text-deep-maroon' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full mr-3 ${order.status === 'ready' ? 'bg-deep-maroon' : 'bg-gray-300'}`}></div>
            <span>Ready for Pickup</span>
          </div>
          <div className={`flex items-center ${order.status === 'completed' ? 'text-deep-maroon' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full mr-3 ${order.status === 'completed' ? 'bg-deep-maroon' : 'bg-gray-300'}`}></div>
            <span>Order Completed</span>
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
