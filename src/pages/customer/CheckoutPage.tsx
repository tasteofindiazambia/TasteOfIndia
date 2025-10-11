import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Phone, User, MessageSquare, ChevronDown } from 'lucide-react';
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

// Common African country codes for the dropdown
const countryCodes = [
  { code: '+260', country: 'Zambia', flag: '🇿🇲' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+225', country: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+227', country: 'Niger', flag: '🇳🇪' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+229', country: 'Benin', flag: '🇧🇯' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+235', country: 'Chad', flag: '🇹🇩' },
  { code: '+236', country: 'Central African Republic', flag: '🇨🇫' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
  { code: '+238', country: 'Cape Verde', flag: '🇨🇻' },
  { code: '+239', country: 'São Tomé and Príncipe', flag: '🇸🇹' },
  { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦' },
  { code: '+242', country: 'Republic of the Congo', flag: '🇨🇬' },
  { code: '+243', country: 'Democratic Republic of the Congo', flag: '🇨🇩' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' },
  { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+246', country: 'British Indian Ocean Territory', flag: '🇮🇴' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
  { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
  { code: '+262', country: 'Réunion', flag: '🇷🇪' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
  { code: '+264', country: 'Namibia', flag: '🇳🇦' },
  { code: '+265', country: 'Malawi', flag: '🇲🇼' },
  { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼' },
  { code: '+268', country: 'Eswatini', flag: '🇸🇿' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲' },
  { code: '+290', country: 'Saint Helena', flag: '🇸🇭' },
  { code: '+291', country: 'Eritrea', flag: '🇪🇷' },
  { code: '+297', country: 'Aruba', flag: '🇦🇼' },
  { code: '+298', country: 'Faroe Islands', flag: '🇫🇴' },
  { code: '+299', country: 'Greenland', flag: '🇬🇱' }
];

const CheckoutPage: React.FC = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { restaurants, selectedRestaurant } = useRestaurant();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Deprecated local state; using react-hook-form watch instead
  const [orderType] = useState<'pickup' | 'delivery'>('pickup');
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
  const [geocoding, setGeocoding] = useState(false);
  const [addressPinned, setAddressPinned] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+260'); // Default to Zambia
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const deliveryAddressRef = useRef<HTMLTextAreaElement | null>(null);
  const googleAutocompleteRef = useRef<any>(null);
  const countryDropdownRef = useRef<HTMLDivElement | null>(null);
  const mapsApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY as string | undefined;
  
  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen]);
  
  // Generic geocode with multi-provider fallback (free, no key)
  const geocodeAddress = async (text: string): Promise<{ lat: number; lng: number } | null> => {
    const q = encodeURIComponent(text);
    const providers = [
      `https://geocode.maps.co/search?q=${q}`, // OSM mirror
      `https://photon.komoot.io/api/?q=${q}`,   // Photon (Komoot)
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=0&limit=1&q=${q}`
    ];
    for (const url of providers) {
      try {
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        // Normalize result
        if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
        if (data && data.features && data.features.length > 0) {
          const f = data.features[0];
          const [lng, lat] = f.geometry?.coordinates || [];
          if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
        }
      } catch (_e) {
        // try next provider
      }
    }
    return null;
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    defaultValues: {
      restaurant_id: 2, // Default to Parirenyetwa
      order_type: 'pickup'
    }
  });

  const watchOrderType = watch('order_type');
  const watchRestaurantId = watch('restaurant_id');
  const watchDeliveryAddress = watch('delivery_address');
  // Register for delivery_address with a combined ref so RHF still tracks value
  const addressRegister = register('delivery_address', {
    required: watchOrderType === 'delivery' ? 'Delivery address is required' : false
  });

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

  // Load Google Maps JS API (Places)
  const loadGoogleMaps = async (): Promise<any> => {
    if ((window as any).google?.maps?.places) return (window as any).google;
    if (!mapsApiKey) return null;
    return new Promise((resolve, reject) => {
      const existing = document.getElementById('google-maps-js');
      if (existing) {
        (window as any).initMap = () => resolve((window as any).google);
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-js';
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places&callback=initMap`;
      (window as any).initMap = () => resolve((window as any).google);
      script.onerror = reject as any;
      document.body.appendChild(script);
    });
  };

  // Attach Google Places Autocomplete to Delivery Address when Delivery is selected
  useEffect(() => {
    let listener: any;
    (async () => {
      if (watchOrderType !== 'delivery') return;
      if (!deliveryAddressRef.current) return;
      const google = await loadGoogleMaps();
      if (!google) return; // no key configured
      if (googleAutocompleteRef.current) return; // already attached
      const options: any = {
        componentRestrictions: { country: 'zm' },
        fields: ['geometry', 'formatted_address', 'name'],
        types: ['geocode']
      };
      const ac = new google.maps.places.Autocomplete(deliveryAddressRef.current, options);
      googleAutocompleteRef.current = ac;
      listener = ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        const loc = place?.geometry?.location;
        if (loc) {
          const coords = { lat: loc.lat(), lng: loc.lng() };
          setUserLocation(coords);
          setAddressPinned(true);
          setGeocoding(false);
          setGeocodeError(null);
          if (place.formatted_address && deliveryAddressRef.current) {
            deliveryAddressRef.current.value = place.formatted_address;
          }
          const currentRestaurant = restaurants.find(r => r.id === watchRestaurantId);
          if (currentRestaurant?.latitude && currentRestaurant?.longitude) {
            const dist = calculateDistance(
              coords.lat, coords.lng,
              currentRestaurant.latitude, currentRestaurant.longitude
            );
            const roundedDistance = Math.round(dist);
            setDistance(roundedDistance);
            setCalculatedDeliveryFee(roundedDistance * (currentRestaurant.delivery_fee_per_km || 10));
          }
        } else {
          setAddressPinned(false);
          setGeocodeError('Could not read this place. Please pick a suggestion.');
        }
      });
    })();

    return () => {
      try {
        if (listener) listener.remove();
      } catch { /* ignore */ }
    };
  }, [watchOrderType, restaurants, watchRestaurantId]);

  // Geocode manually entered address and auto-pin
  useEffect(() => {
    if (watchOrderType !== 'delivery') {
      setAddressPinned(false);
      return;
    }
    const text = (watchDeliveryAddress || '').trim();
    if (text.length < 6) {
      setAddressPinned(false);
      setGeocodeError(null);
      return;
    }

    setGeocoding(true);
    const handle = setTimeout(async () => {
      try {
        const coords = await geocodeAddress(text);
        if (coords) {
          setUserLocation(coords);
          setAddressPinned(true);
          setGeocodeError(null);
          const currentRestaurant = restaurants.find(r => r.id === watchRestaurantId);
          if (currentRestaurant?.latitude && currentRestaurant?.longitude) {
            const dist = calculateDistance(
              coords.lat, coords.lng,
              currentRestaurant.latitude, currentRestaurant.longitude
            );
            const roundedDistance = Math.round(dist);
            setDistance(roundedDistance);
            setCalculatedDeliveryFee(roundedDistance * (currentRestaurant.delivery_fee_per_km || 10));
          }
        } else {
          setAddressPinned(false);
          setGeocodeError('Address not found. Try a nearby landmark.');
        }
      } catch (_e) {
        setAddressPinned(false);
        setGeocodeError('Network error while looking up the address.');
      } finally {
        setGeocoding(false);
      }
    }, 600);

    return () => clearTimeout(handle);
  }, [watchDeliveryAddress, watchOrderType, restaurants, watchRestaurantId]);

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
            const roundedDistance = Math.round(dist);
            setDistance(roundedDistance);
            setCalculatedDeliveryFee(roundedDistance * deliverySettings.delivery_fee_per_km);
          }
        },
        (_err) => {
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
      const transformedItems = cartItems.map(item => {
        // Base unit price (per unit or per gram)
        const baseUnit = item.grams ? Number(item.menuItem.price) : Number(item.menuItem.price);
        const packagingPerUnit = Number(item.menuItem.packaging_price || 0);
        const linePackaging = packagingPerUnit * (item.quantity || 0);
        const baseLineUnit = item.grams ? (baseUnit * Number(item.grams || 0)) : baseUnit;
        const baseLine = baseLineUnit * (item.quantity || 0);
        const totalWithPackaging = baseLine + linePackaging;

        return {
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          grams: item.grams,
          unit_price: item.grams ? baseUnit : baseUnit, // per gram or per unit
          total_price: totalWithPackaging, // include packaging
          packaging_fee: linePackaging, // optional, for transparency
          special_instructions: item.grams 
            ? `${item.grams}g per package - ${item.specialInstructions || ''}`.trim()
            : item.specialInstructions || ''
        };
      });

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

      // Soft minimum delivery order check (warn but do not block)
      if (
        data.order_type === 'delivery' &&
        (getCartTotal() + deliveryFee) < (deliverySettings.min_delivery_order || 0)
      ) {
        showNotification({
          type: 'info',
          message: `Below minimum delivery order of K${(deliverySettings.min_delivery_order || 0).toFixed(0)}. Proceeding anyway.`
        });
      }

      const orderData = {
        customer_name: data.customer_name,
        customer_phone: `${selectedCountryCode}${data.customer_phone}`,
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
      
      clearCart();
      showNotification({
        type: 'success',
        message: 'Order placed successfully!'
      });
      navigate(`/order-confirmation/${(order as any).order_token || order.id}`);
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
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 pb-32 sm:pb-40">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Order Form */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Order Information</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  id="customer_name"
                  {...register('customer_name', { required: 'Name is required' })}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon text-sm sm:text-base"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.customer_name && (
                <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.customer_name.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="flex">
                {/* Country Code Dropdown */}
                <div className="relative" ref={countryDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="flex items-center px-2 sm:px-3 py-2 border border-gray-300 border-r-0 rounded-l-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-deep-maroon focus:z-10"
                  >
                    <span className="text-xs sm:text-sm font-medium">
                      {countryCodes.find(c => c.code === selectedCountryCode)?.flag} {selectedCountryCode}
                    </span>
                    <ChevronDown className="ml-1 w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  </button>
                  
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 z-50 w-56 sm:w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {countryCodes.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountryCode(country.code);
                            setIsCountryDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-2 sm:px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          <span className="mr-2 text-sm sm:text-base">{country.flag}</span>
                          <span className="font-medium mr-2 text-xs sm:text-sm">{country.code}</span>
                          <span className="text-xs sm:text-sm text-gray-600">{country.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Phone Number Input */}
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="tel"
                    id="customer_phone"
                    {...register('customer_phone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{6,15}$/,
                        message: 'Please enter a valid phone number (6-15 digits)'
                      }
                    })}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon text-sm sm:text-base"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              {errors.customer_phone && (
                <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.customer_phone.message}</p>
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
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon text-sm sm:text-base"
              >
                <option value="pickup">🏪 Pickup (Ready in 15-20 minutes)</option>
                <option value="delivery">
                  🚚 Delivery (K{deliverySettings.delivery_fee_per_km}/km • {deliverySettings.max_delivery_radius_km}km max)
                </option>
              </select>
              {errors.order_type && (
                <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.order_type.message}</p>
              )}
            </div>

            {/* Restaurant Selection - Hidden for delivery, always Parirenyetwa */}
            {watchOrderType === 'pickup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location *
                </label>
                <select
                  id="restaurant_id"
                  {...register('restaurant_id', { required: 'Please select a location' })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon text-sm sm:text-base"
                >
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} - {restaurant.address}
                    </option>
                  ))}
                </select>
                {errors.restaurant_id && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.restaurant_id.message}</p>
                )}
              </div>
            )}
            
            {/* Hidden field for delivery orders - always Parirenyetwa */}
            {watchOrderType === 'delivery' && (
              <input
                type="hidden"
                {...register('restaurant_id')}
                value="2"
              />
            )}

            {/* Delivery Address - Only show if delivery is selected */}
            {watchOrderType === 'delivery' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    id="delivery_address"
                    {...addressRegister}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon text-sm sm:text-base"
                    placeholder="Enter your full delivery address including landmarks..."
                    ref={(el) => { deliveryAddressRef.current = el; addressRegister.ref(el); }}
                  />
                  {errors.delivery_address && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.delivery_address.message}</p>
                  )}
                  {watchOrderType === 'delivery' && (
                    <div className="text-xs mt-2">
                      {geocoding && <span className="text-gray-600">Pinning address…</span>}
                      {!geocoding && addressPinned && userLocation && (
                        <span className="text-green-700">✅ Address pinned: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}</span>
                      )}
                      {!geocoding && !addressPinned && watchDeliveryAddress && (
                        <span className="text-gray-500">{geocodeError || 'Tip: add road, area and city for better accuracy.'}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Location Input */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📍 Your Location (for delivery fee calculation)
                  </label>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                      >
                        {locationLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                            <span className="hidden sm:inline">Getting Location...</span>
                            <span className="sm:hidden">Getting...</span>
                          </>
                        ) : (
                          <>
                            <span>📱</span>
                            <span className="hidden sm:inline">Use My Current Location</span>
                            <span className="sm:hidden">Current Location</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const addr = (deliveryAddressRef.current?.value || '').trim();
                          if (!addr) return;
                          setGeocoding(true);
                          const coords = await geocodeAddress(addr);
                          if (coords) {
                            setUserLocation(coords);
                            setAddressPinned(true);
                            setGeocodeError(null);
                            const currentRestaurant = restaurants.find(r => r.id === watchRestaurantId);
                            if (currentRestaurant?.latitude && currentRestaurant?.longitude) {
                              const dist = calculateDistance(
                                coords.lat, coords.lng,
                                currentRestaurant.latitude, currentRestaurant.longitude
                              );
                              setDistance(Math.round(dist * 10) / 10);
                              setCalculatedDeliveryFee(Math.ceil(dist * (currentRestaurant.delivery_fee_per_km || 10)));
                            }
                          } else {
                            setAddressPinned(false);
                            setGeocodeError('Address not found. Try a nearby landmark.');
                          }
                          setGeocoding(false);
                        }}
                        className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 text-xs sm:text-sm hover:bg-gray-50"
                      >
                        Pin Address
                      </button>
                    </div>

                    {userLocation && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                        <div className="text-xs sm:text-sm text-green-800">
                          ✅ Location detected: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                        </div>
                        {distance > 0 && (
                          <div className="text-xs sm:text-sm text-green-700 mt-1">
                            📏 Distance: {distance}km • 💰 Delivery Fee: K{calculatedDeliveryFee}
                          </div>
                        )}
                        {distance > deliverySettings.max_delivery_radius_km && (
                          <div className="text-xs sm:text-sm text-red-600 mt-1">
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
                <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <textarea
                  id="special_instructions"
                  {...register('special_instructions')}
                  rows={3}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon text-sm sm:text-base"
                  placeholder="Any special requests or dietary restrictions..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-deep-maroon text-light-cream py-3 px-4 sm:px-6 rounded-lg hover:bg-burgundy transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Order Summary</h2>
          
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-base sm:text-lg">{item.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Qty: {item.quantity} {item.grams ? `(${item.grams}g per packet)` : 'item(s)'}
                    </p>
                  </div>
                  <span className="font-bold text-deep-maroon text-base sm:text-lg">
                    K{item.totalPrice.toFixed(0)}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 sm:p-3 rounded border">
                  {item.grams ? (
                    // Dynamic pricing breakdown
                    <div className="space-y-1">
                      <p className="font-medium text-gray-800">Order Total Breakdown:</p>
                      <p>• Price: K{(item.menuItem.price / item.grams).toFixed(2)} per gram</p>
                      <p>• Weight: {item.grams}g × {item.quantity} packet{item.quantity > 1 ? 's' : ''}</p>
                      <p>• Item cost: {item.grams}g × {item.quantity} × K{(item.menuItem.price / item.grams).toFixed(2)} = K{item.itemTotal.toFixed(0)}</p>
                      {item.packagingPrice > 0 && (
                        <p>• Packaging: K{item.menuItem.packaging_price?.toFixed(0) || '0'} × {item.quantity} = K{item.packagingPrice.toFixed(0)}</p>
                      )}
                      <p className="font-medium text-deep-maroon">• Total: K{item.totalPrice.toFixed(0)}</p>
                    </div>
                  ) : (
                    // Regular pricing breakdown
                    <div className="space-y-1">
                      <p className="font-medium text-gray-800">Order Total Breakdown:</p>
                      <p>• Base price: K{item.menuItem.price.toFixed(0)} each</p>
                      <p>• Quantity: {item.quantity} item{item.quantity > 1 ? 's' : ''}</p>
                      <p>• Item cost: {item.quantity} × K{item.menuItem.price.toFixed(0)} = K{item.itemTotal.toFixed(0)}</p>
                      {item.packagingPrice > 0 && (
                        <p>• Packaging: K{item.menuItem.packaging_price?.toFixed(0) || '0'} × {item.quantity} = K{item.packagingPrice.toFixed(0)}</p>
                      )}
                      <p className="font-medium text-deep-maroon">• Total: K{item.totalPrice.toFixed(0)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 sm:pt-4 space-y-1 sm:space-y-2">
            {/* Detailed breakdown */}
            {(() => {
              const itemsTotal = cartItems.reduce((total, item) => total + item.itemTotal, 0);
              const packagingTotal = cartItems.reduce((total, item) => total + item.packagingPrice, 0);
              const subtotal = itemsTotal + packagingTotal;
              
              return (
                <>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Items Total:</span>
                    <span className="text-gray-600">K{itemsTotal.toFixed(0)}</span>
                  </div>
                  {packagingTotal > 0 && (
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-600">Packaging:</span>
                      <span className="text-gray-600">K{packagingTotal.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-medium text-sm sm:text-base">
                    <span>Subtotal:</span>
                    <span>K{subtotal.toFixed(0)}</span>
                  </div>
                </>
              );
            })()}
            {watchOrderType === 'delivery' && (
              <div className="flex justify-between items-center text-xs sm:text-sm">
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
            <div className="flex justify-between items-center text-base sm:text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-deep-maroon">
                K{(getCartTotal() + (watchOrderType === 'delivery' ? calculatedDeliveryFee : 0)).toFixed(0)}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
