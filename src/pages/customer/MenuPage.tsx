import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin } from 'lucide-react';
import { MenuItem, Category, CartItem } from '../../types';
import { restaurantService } from '../../services/restaurantService';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { useRestaurant } from '../../context/RestaurantContext';
import MenuItemCard from '../../components/MenuItemCard';

const MenuPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const { restaurants, setSelectedRestaurant } = useRestaurant();
  const navigate = useNavigate();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLocationChange = (newRestaurantId: string) => {
    navigate(`/menu/${newRestaurantId}`);
  };

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        setMenuItems([]); // Clear previous items to prevent flickering
        setCategories([]); // Clear previous categories
        setFilteredItems([]); // Clear filtered items
        
        const [menuData, categoriesData] = await Promise.all([
          restaurantService.getMenu(parseInt(restaurantId)),
          restaurantService.getCategories(parseInt(restaurantId))
        ]);
        
        setMenuItems(menuData);
        setCategories(categoriesData);
        setFilteredItems(menuData);
        
        // Update selected restaurant in context
        const currentRestaurant = restaurants.find(r => r.id === parseInt(restaurantId));
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
  }, [restaurantId]); // Remove restaurants and setSelectedRestaurant dependencies to prevent unnecessary re-renders

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

  const handleAddToCart = useCallback((menuItem: MenuItem, quantity: number = 1) => {
    const cartItem: CartItem = {
      id: Date.now(), // Temporary ID for cart item
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      menuItem
    };
    addToCart(cartItem);
    showNotification({
      type: 'success',
      message: `${quantity} ${menuItem.name} added to cart!`
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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Menu</h1>
        
        {/* Location Selector */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              id="restaurant_location"
              name="restaurant_location"
              value={restaurantId || ''}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon appearance-none bg-white"
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id.toString()}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
