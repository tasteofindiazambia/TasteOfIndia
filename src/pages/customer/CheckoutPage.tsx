import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Phone, User, MessageSquare } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { useNotification } from '../../context/NotificationContext';
import { orderService } from '../../services/orderService';

interface CheckoutFormData {
  customer_name: string;
  customer_phone: string;
  restaurant_id: number;
  special_instructions?: string;
}

const CheckoutPage: React.FC = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { restaurants, selectedRestaurant } = useRestaurant();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    defaultValues: {
      restaurant_id: selectedRestaurant?.id || restaurants[0]?.id
    }
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Transform cart items to match backend expectations
      const transformedItems = cartItems.map(item => ({
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        unit_price: item.price,
        special_instructions: item.specialInstructions || ''
      }));

      const orderData = {
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        restaurant_id: data.restaurant_id,
        special_instructions: data.special_instructions,
        items: transformedItems,
        order_type: 'pickup',
        payment_method: 'cash'
      };

      const order = await orderService.createOrder(orderData);
      clearCart();
      showNotification({
        type: 'success',
        message: 'Order placed successfully! You will receive a confirmation shortly.'
      });
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place order';
      setError(errorMessage);
      showNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Order Information</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="customer_name"
                  {...register('customer_name', { required: 'Name is required' })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.customer_name && (
                <p className="text-red-600 text-sm mt-1">{errors.customer_name.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="customer_phone"
                  {...register('customer_phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[+]?[1-9][\d]{0,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.customer_phone && (
                <p className="text-red-600 text-sm mt-1">{errors.customer_phone.message}</p>
              )}
            </div>

            {/* Restaurant Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location *
              </label>
              <select
                id="restaurant_id"
                {...register('restaurant_id', { required: 'Please select a location' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} - {restaurant.address}
                  </option>
                ))}
              </select>
              {errors.restaurant_id && (
                <p className="text-red-600 text-sm mt-1">{errors.restaurant_id.message}</p>
              )}
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="special_instructions"
                  {...register('special_instructions')}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  placeholder="Any special requests or dietary restrictions..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-deep-maroon text-light-cream py-3 px-6 rounded-lg hover:bg-burgundy transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold">
                  K{(item.price * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-deep-maroon">K{getCartTotal().toFixed(0)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-light-cream rounded-lg">
            <h3 className="font-semibold text-deep-maroon mb-2">Order Details</h3>
            <ul className="text-sm text-warm-gray space-y-1">
              <li>• Order will be prepared for pickup</li>
              <li>• Estimated preparation time: 15-20 minutes</li>
              <li>• You'll receive a confirmation shortly</li>
              <li>• Payment can be made at pickup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
