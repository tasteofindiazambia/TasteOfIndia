import React, { useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number, grams?: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  const { cartItems } = useCart();
  
  // Check if item is already in cart
  const cartItem = cartItems.find(cartItem => cartItem.menuItem?.id === item.id);
  const isInCart = !!cartItem;
  
  const isDynamicPricing = item.dynamic_pricing || item.pricing_type === 'per_gram';

  const handleCardClick = useCallback(() => {
    if (!isInCart) {
      // Add one item directly to cart
      onAddToCart(item, 1, isDynamicPricing ? 100 : undefined);
    }
  }, [onAddToCart, item, isDynamicPricing, isInCart]);

  const handleIncrementCartQuantity = useCallback(() => {
    if (cartItem) {
      onAddToCart(item, 1, isDynamicPricing ? 100 : undefined);
    }
  }, [onAddToCart, item, isDynamicPricing, cartItem]);

  const handleDecrementCartQuantity = useCallback(() => {
    if (cartItem && cartItem.quantity > 1) {
      // Remove one item
      onAddToCart(item, -1, isDynamicPricing ? 100 : undefined);
    }
  }, [onAddToCart, item, isDynamicPricing, cartItem]);

  const calculatePrice = useCallback(() => {
    if (isDynamicPricing && cartItem) {
      const grams = cartItem.grams || 100;
      const quantity = cartItem.quantity || 1;
      return (item.price * grams * quantity) + (item.packaging_price || 0) * quantity;
    }
    return item.price * (cartItem?.quantity || 1);
  }, [item.price, item.packaging_price, isDynamicPricing, cartItem]);

  return (
    <div 
      className={`card-floating overflow-hidden group transition-all duration-200 ${
        !item.available ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'
      }`}
      onClick={item.available ? handleCardClick : undefined}
    >
      {/* Item Image */}
      <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-lg group-hover:scale-110 transition-transform duration-300">No Image</span>
          </div>
        )}
        
        {/* Availability Badge */}
        {!item.available && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
            Out of Stock
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-charcoal mb-3 group-hover:text-deep-maroon transition-colors">{item.name}</h3>
        <p className="text-warm-gray text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {isDynamicPricing ? (
              <>
                <span className="text-sm text-warm-gray">K{item.price.toFixed(2)}/gram</span>
                {isInCart && (
                  <span className="text-xl font-bold text-deep-maroon">
                    K{calculatePrice().toFixed(0)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-2xl font-bold text-deep-maroon">
                K{item.price.toFixed(0)}
              </span>
            )}
            {item.packaging_price && item.packaging_price > 0 && (
              <span className="text-xs text-gray-500">
                + K{item.packaging_price.toFixed(0)} packaging
              </span>
            )}
          </div>
          
          {item.available ? (
            <div className="flex items-center space-x-2">
              {isInCart ? (
                /* Show quantity controls when item is in cart */
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDecrementCartQuantity();
                    }}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-deep-maroon to-burgundy text-white flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-deep-maroon min-w-[2rem] text-center">
                    {cartItem?.quantity || 0}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIncrementCartQuantity();
                    }}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-deep-maroon to-burgundy text-white flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Show add hint when item is not in cart */
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Click to add</div>
                  <div className="text-xs text-gray-400">Tap anywhere</div>
                </div>
              )}
            </div>
          ) : (
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
