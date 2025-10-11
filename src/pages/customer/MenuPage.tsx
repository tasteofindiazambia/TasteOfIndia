import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import { MenuItem, Category, CartItem } from '../../types';
import { restaurantService } from '../../services/restaurantService';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { useRestaurant } from '../../context/RestaurantContext';
import MenuItemCard from '../../components/MenuItemCard';

const MenuPage: React.FC = () => {
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const { restaurants, setSelectedRestaurant } = useRestaurant();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Always use Parirenyetwa (restaurant_id: 2) since both restaurants share the same menu
  const restaurantId = 2;

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        setMenuItems([]); // Clear previous items to prevent flickering
        setCategories([]); // Clear previous categories
        setFilteredItems([]); // Clear filtered items
        
        const [menuData, categoriesData] = await Promise.all([
          restaurantService.getMenu(restaurantId),
          restaurantService.getCategories(restaurantId)
        ]);
        
        setMenuItems(menuData);
        setCategories(categoriesData);
        setFilteredItems(menuData);
        
        // Set Parirenyetwa as the selected restaurant in context
        const currentRestaurant = restaurants.find(r => r.id === restaurantId);
        if (currentRestaurant) {
          setSelectedRestaurant(currentRestaurant);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch menu');
        setMenuItems([]);
        setCategories([]);
        setFilteredItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [restaurants, setSelectedRestaurant]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let filtered = [...menuItems]; // Create a copy to avoid mutations

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category_id === parseInt(selectedCategory));
    }

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, debouncedSearchQuery]);

  const handleAddToCart = useCallback((menuItem: MenuItem, quantity: number = 1, grams?: number, pricingDetails?: {
    itemTotal: number;
    packagingPrice: number;
    totalPrice: number;
  }) => {
    const isDynamicPricing = menuItem.dynamic_pricing || menuItem.pricing_type === 'per_gram';
    
    // Use provided pricing details or calculate them
    let itemTotal: number;
    let packagingPrice: number;
    let totalPrice: number;
    
    if (pricingDetails) {
      itemTotal = pricingDetails.itemTotal;
      packagingPrice = pricingDetails.packagingPrice;
      totalPrice = pricingDetails.totalPrice;
    } else {
      // Fallback calculation for backward compatibility
      itemTotal = menuItem.price * quantity;
      if (isDynamicPricing && grams) {
        itemTotal = menuItem.price * grams * quantity;
      }
      packagingPrice = (menuItem.packaging_price || 0) * quantity;
      totalPrice = itemTotal + packagingPrice;
    }
    
    const cartItem: CartItem = {
      id: Date.now() + Math.random(), // Unique ID for cart item
      name: menuItem.name,
      price: menuItem.price, // Base item price
      quantity,
      grams: isDynamicPricing ? grams : undefined,
      menuItem,
      itemTotal,
      packagingPrice,
      totalPrice
    };
    
    addToCart(cartItem);
    
    const message = isDynamicPricing && grams 
      ? `${grams}g × ${quantity} ${menuItem.name} added to cart!`
      : `${quantity} ${menuItem.name} added to cart!`;
      
    showNotification({
      type: 'success',
      message
    });
  }, [addToCart, showNotification]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 pb-40">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Menu</h1>
        
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              id="menu_search"
              name="menu_search"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              id="category_filter"
              name="category_filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-deep-maroon text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id.toString())}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category.id.toString()
                  ? 'bg-deep-maroon text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No menu items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={`${item.id}-${item.restaurant_id || 'default'}`}
              item={item}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPage;
