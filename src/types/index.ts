export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'drinks' | 'sweets';
  tags: string[];
  image: string;
  available: boolean;
  preparationTime: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface CouponCode {
  code: string;
  discount: number;
  minOrderValue: number;
  validUntil: string;
  usageLimit: number;
  currentUsage: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  tableNumber: string;
  notes: string;
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  timestamp: string;
}