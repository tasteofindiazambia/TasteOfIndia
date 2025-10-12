// Restaurant Types
export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  image?: string;
  // Delivery/location fields (present in API/DB)
  latitude?: number;
  longitude?: number;
  delivery_fee_per_km?: number;
  delivery_time_minutes?: number;
  min_delivery_order?: number;
  max_delivery_radius_km?: number;
}

// Menu Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  restaurant_id: number;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: number;
  item_id?: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  image_prompt?: string;
  category_id: number;
  item_family?: string;
  tags?: string | string[];
  available: boolean; // Main availability field
  preparation_time?: number;
  restaurant_id?: number;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  category_name?: string;
  // Additional fields for menu items
  featured?: boolean;
  spice_level?: string;
  pieces_count?: number;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  // Dynamic pricing fields
  dynamic_pricing?: boolean;
  packaging_price?: number;
  listing_preference?: string;
  pricing_type?: 'fixed' | 'per_gram';
  // Legacy field for compatibility
  availability_status?: number;
}

// Order Types
export interface CartItem {
  id: number;
  name: string;
  price: number; // Base item price
  quantity: number;
  grams?: number; // For per-gram items
  specialInstructions?: string;
  menuItem: MenuItem;
  // Detailed pricing breakdown
  itemTotal: number; // price * quantity (or price * grams * quantity for dynamic pricing)
  packagingPrice: number; // packaging_price * quantity
  totalPrice: number; // itemTotal + packagingPrice
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  items: CartItem[]; // Always array of CartItem
  total: number;
  total_amount?: number; // Backend field name
  order_number?: string;
  status: 'preparing' | 'ready for pickup' | 'delivered';
  restaurant_id: number;
  created_at: string;
  special_instructions?: string;
  // Additional order properties
  order_type?: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_fee?: number;
  delivery_distance_km?: number;
  delivery_time_estimate?: number;
  estimated_preparation_time?: number;
  order_token?: string;
  order_items?: any[]; // For backend compatibility
}


// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Form Types
export interface OrderFormData {
  customer_name: string;
  customer_phone: string;
  restaurant_id: number;
  special_instructions?: string;
  items: Array<{
    menu_item_id: number;
    quantity: number;
    unit_price: number;
    special_instructions?: string;
  }>;
  order_type?: string;
  payment_method?: string;
}


// Admin Types
export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  todayReservations: number;
}

export interface OrderStatusUpdate {
  orderId: number;
  status: Order['status'];
  estimatedTime?: number;
}
