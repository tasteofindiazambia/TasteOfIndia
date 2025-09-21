import React, { useState, useEffect } from 'react';
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
  order_type: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  special_instructions?: string;
}

const CheckoutPage: React.FC = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { restaurants, selectedRestaurant } = useRestaurant();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliverySettings, setDeliverySettings] = useState({
    delivery_fee_per_km: 10,
    delivery_time_minutes: 30,
    min_delivery_order: 0,
    max_delivery_radius_km: 15,
    latitude: 0,
    longitude: 0
  });
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState<number>(0);
  const [locationLoading, setLocationLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    defaultValues: {
      restaurant_id: selectedRestaurant?.id || restaurants[0]?.id,
      order_type: 'pickup'
    }
  });

  const watchOrderType = watch('order_type');
  const watchRestaurantId = watch('restaurant_id');

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setLocationLoading(false);
          
          // Calculate distance and delivery fee
          if (deliverySettings.latitude && deliverySettings.longitude) {
            const dist = calculateDistance(
              location.lat, location.lng,
              deliverySettings.latitude, deliverySettings.longitude
            );
            setDistance(Math.round(dist * 10) / 10); // Round to 1 decimal
            setCalculatedDeliveryFee(Math.ceil(dist * deliverySettings.delivery_fee_per_km));
          }
        },
        (error) => {
          setLocationLoading(false);
          showNotification({
            type: 'error',
            message: 'Unable to get your location. Please enter your address manually.'
          });
        }
      );
    } else {
      setLocationLoading(false);
      showNotification({
        type: 'error',
        message: 'Geolocation is not supported by this browser.'
      });
    }
  };

  // Fetch delivery settings when restaurant changes
  useEffect(() => {
    const currentRestaurant = restaurants.find(r => r.id === watchRestaurantId);
    if (currentRestaurant) {
      setDeliverySettings({
        delivery_fee_per_km: currentRestaurant.delivery_fee_per_km || 10,
        delivery_time_minutes: currentRestaurant.delivery_time_minutes || 30,
        min_delivery_order: currentRestaurant.min_delivery_order || 0,
        max_delivery_radius_km: currentRestaurant.max_delivery_radius_km || 15,
        latitude: currentRestaurant.latitude || 0,
        longitude: currentRestaurant.longitude || 0
      });
      
      // Recalculate distance if user location is available
      if (userLocation && currentRestaurant.latitude && currentRestaurant.longitude) {
        const dist = calculateDistance(
          userLocation.lat, userLocation.lng,
          currentRestaurant.latitude, currentRestaurant.longitude
        );
        setDistance(Math.round(dist * 10) / 10);
        setCalculatedDeliveryFee(Math.ceil(dist * (currentRestaurant.delivery_fee_per_km || 10)));
      }
    }
  }, [watchRestaurantId, restaurants, userLocation]);

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Transform cart items to match backend expectations
      const transformedItems = cartItems.map(item => ({
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        grams: item.grams,
        unit_price: item.grams ? item.menuItem.price : item.price / item.quantity, // Per gram or per unit price
        total_price: item.price, // Already calculated total price from cart
        special_instructions: item.grams 
          ? `${item.grams}g per package - ${item.specialInstructions || ''}`.trim()
          : item.specialInstructions || ''
      }));

      // Calculate delivery fee if applicable
      let deliveryFee = 0;
      if (data.order_type === 'delivery') {
        if (!userLocation) {
          setError('Please provide your location for delivery');
          setLoading(false);
          return;
        }
        
        // Check if within delivery radius
        if (distance > deliverySettings.max_delivery_radius_km) {
          setError(`Sorry, we only deliver within ${deliverySettings.max_delivery_radius_km}km radius. You are ${distance}km away.`);
          setLoading(false);
          return;
        }
        
        deliveryFee = calculatedDeliveryFee;
      }
      
      const totalWithDelivery = getCartTotal() + deliveryFee;

      // Check minimum delivery order
      if (data.order_type === 'delivery' && getCartTotal() < deliverySettings.min_delivery_order) {
        setError(`Minimum delivery order is K${deliverySettings.min_delivery_order.toFixed(0)}`);
        setLoading(false);
        return;
      }

      const orderData = {
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        restaurant_id: data.restaurant_id,
        order_type: data.order_type,
        delivery_address: data.order_type === 'delivery' ? data.delivery_address : null,
        delivery_latitude: data.order_type === 'delivery' && userLocation ? userLocation.lat : null,
        delivery_longitude: data.order_type === 'delivery' && userLocation ? userLocation.lng : null,
        delivery_distance_km: data.order_type === 'delivery' ? distance : null,
        delivery_fee: deliveryFee,
        special_instructions: data.special_instructions,
        items: transformedItems,
        total_amount: totalWithDelivery,
        payment_method: 'cash'
      };

      const order = await orderService.createOrder(orderData);
      
      // Auto-send WhatsApp message
      try {
        const orderSummary = `
🍛 *Taste of India - Order Summary*

📋 *Order #${order.id}*
👤 Customer: ${order.customer_name}
📞 Phone: ${order.customer_phone}
📅 Date: ${new Date().toLocaleDateString()}
${data.order_type === 'pickup' ? '🏪 *Pickup Order*' : '🚚 *Delivery Order*'}
${data.order_type === 'delivery' && data.delivery_address ? `📍 Address: ${data.delivery_address}` : ''}

🛒 *Items Ordered:*
${transformedItems.map((item: any) => {
          const menuItem = cartItems.find(cartItem => cartItem.menuItem.id === item.menu_item_id);
          return `• ${menuItem?.menuItem.name || 'Unknown Item'} × ${item.quantity} - K${item.total_price.toFixed(0)}`;
        }).join('\n')}

💰 *Subtotal: K${getCartTotal().toFixed(0)}*
${deliveryFee > 0 ? `🚚 *Delivery Fee: K${deliveryFee}*` : ''}
💰 *Total: K${totalWithDelivery.toFixed(0)}*

${data.special_instructions ? `📝 Special Instructions: ${data.special_instructions}` : ''}

🏪 *Taste of India Restaurant*
${data.order_type === 'pickup' ? 'Ready for pickup in 15-20 minutes!' : 'Delivery in 30-45 minutes!'}
Thank you for your order! 🙏
        `.trim();
        
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(orderSummary)}`;
        window.open(whatsappUrl, '_blank');
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp message:', whatsappError);
        // Don't block the order process if WhatsApp fails
      }
      
      clearCart();
      showNotification({
        type: 'success',
        message: 'Order placed successfully! WhatsApp message sent.'
      });
      navigate(`/order-confirmation/${order.order_token || order.id}`);
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

            {/* Order Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Type *
              </label>
              <select
                id="order_type"
                {...register('order_type', { required: 'Please select order type' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              >
                <option value="pickup">🏪 Pickup (Ready in 15-20 minutes)</option>
                <option value="delivery">
                  🚚 Delivery (K{deliverySettings.delivery_fee_per_km}/km • {deliverySettings.max_delivery_radius_km}km max)
                </option>
              </select>
              {errors.order_type && (
                <p className="text-red-600 text-sm mt-1">{errors.order_type.message}</p>
              )}
            </div>

            {/* Restaurant Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {watchOrderType === 'delivery' ? 'Restaurant Location *' : 'Pickup Location *'}
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

            {/* Delivery Address - Only show if delivery is selected */}
            {watchOrderType === 'delivery' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    id="delivery_address"
                    {...register('delivery_address', { 
                      required: watchOrderType === 'delivery' ? 'Delivery address is required' : false 
                    })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    placeholder="Enter your full delivery address including landmarks..."
                  />
                  {errors.delivery_address && (
                    <p className="text-red-600 text-sm mt-1">{errors.delivery_address.message}</p>
                  )}
                </div>

                {/* Location Input */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📍 Your Location (for delivery fee calculation)
                  </label>
                  
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {locationLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Getting Location...</span>
                        </>
                      ) : (
                        <>
                          <span>📱</span>
                          <span>Use My Current Location</span>
                        </>
                      )}
                    </button>

                    {userLocation && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-sm text-green-800">
                          ✅ Location detected: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                        </div>
                        {distance > 0 && (
                          <div className="text-sm text-green-700 mt-1">
                            📏 Distance: {distance}km • 💰 Delivery Fee: K{calculatedDeliveryFee}
                          </div>
                        )}
                        {distance > deliverySettings.max_delivery_radius_km && (
                          <div className="text-sm text-red-600 mt-1">
                            ⚠️ Outside delivery radius ({deliverySettings.max_delivery_radius_km}km max)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

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

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span>K{getCartTotal().toFixed(0)}</span>
            </div>
            {watchOrderType === 'delivery' && (
              <div className="flex justify-between items-center text-sm">
                <span>Delivery Fee:</span>
                <span>
                  {userLocation && distance > 0 ? (
                    <span>K{calculatedDeliveryFee} ({distance}km × K{deliverySettings.delivery_fee_per_km}/km)</span>
                  ) : (
                    <span className="text-gray-500">Calculate with location</span>
                  )}
                </span>
              </div>
            )}
            {watchOrderType === 'delivery' && deliverySettings.min_delivery_order > 0 && (
              <div className="text-xs text-gray-600">
                Minimum delivery order: K{deliverySettings.min_delivery_order.toFixed(0)}
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-deep-maroon">
                K{(getCartTotal() + (watchOrderType === 'delivery' ? calculatedDeliveryFee : 0)).toFixed(0)}
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-light-cream rounded-lg">
            <h3 className="font-semibold text-deep-maroon mb-2">Order Details</h3>
            <ul className="text-sm text-warm-gray space-y-1">
              {watchOrderType === 'pickup' ? (
                <>
                  <li>• Order will be prepared for pickup</li>
                  <li>• Estimated preparation time: 15-20 minutes</li>
                  <li>• You'll receive a confirmation shortly</li>
                  <li>• Payment can be made at pickup</li>
                </>
              ) : (
                <>
                  <li>• Order will be prepared and delivered</li>
                  <li>• Estimated preparation time: 15-20 minutes</li>
                  <li>• Estimated delivery time: {deliverySettings.delivery_time_minutes} minutes total</li>
                  <li>• Delivery fee: K{deliverySettings.delivery_fee}</li>
                  {deliverySettings.min_delivery_order > 0 && (
                    <li>• Minimum order: K{deliverySettings.min_delivery_order.toFixed(0)}</li>
                  )}
                  <li>• Payment can be made on delivery</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
