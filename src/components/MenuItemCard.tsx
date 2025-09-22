import React, { useState, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number, grams?: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [grams, setGrams] = useState(100); // Default 100g for dynamic pricing items
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  
  const isDynamicPricing = item.dynamic_pricing || item.pricing_type === 'per_gram';

  const handleAddToCart = useCallback(() => {
    onAddToCart(item, quantity, isDynamicPricing ? grams : undefined);
    setShowQuantitySelector(false);
    setQuantity(1);
    setGrams(100);
  }, [onAddToCart, item, quantity, grams, isDynamicPricing]);

  const incrementQuantity = useCallback(() => {
    setQuantity(prev => prev + 1);
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity(prev => Math.max(1, prev - 1));
  }, []);

  const incrementGrams = useCallback(() => {
    setGrams(prev => prev + 50); // Increment by 50g
  }, []);

  const decrementGrams = useCallback(() => {
    setGrams(prev => Math.max(50, prev - 50)); // Minimum 50g
  }, []);

  const calculatePrice = useCallback(() => {
    if (isDynamicPricing) {
      return (item.price * grams * quantity) + (item.packaging_price || 0) * quantity;
    }
    return item.price * quantity;
  }, [item.price, item.packaging_price, grams, quantity, isDynamicPricing]);

  return (
    <div className="card-floating overflow-hidden group">
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
                {showQuantitySelector && (
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
              {showQuantitySelector ? (
                <div className="flex flex-col space-y-2">
                  {isDynamicPricing ? (
                    <>
                      {/* Grams selector */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 w-12">Grams:</span>
                        <button
                          onClick={decrementGrams}
                          className="w-6 h-6 rounded-full bg-gradient-to-r from-deep-maroon to-burgundy text-white flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={grams}
                          onChange={(e) => setGrams(Math.max(50, parseInt(e.target.value) || 50))}
                          className="w-16 text-center text-sm border-2 border-deep-maroon/20 rounded-lg px-2 py-1 focus:border-deep-maroon focus:outline-none transition-colors"
                          min="50"
                          step="50"
                        />
                        <button
                          onClick={incrementGrams}
                          className="w-6 h-6 rounded-full bg-gradient-to-r from-deep-maroon to-burgundy text-white flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-gray-600">g</span>
                      </div>
                      {/* Quantity selector for packages */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 w-12">Qty:</span>
                        <button
                          onClick={decrementQuantity}
                          className="w-6 h-6 rounded-full bg-gradient-to-r from-deep-maroon to-burgundy text-white flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-8 text-center text-sm text-deep-maroon">{quantity}</span>
                        <button
                          onClick={incrementQuantity}
                          className="w-6 h-6 rounded-full bg-gradient-to-r from-deep-maroon to-burgundy text-white flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Regular quantity selector */
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={decrementQuantity}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-deep-maroon to-burgundy text-white flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold w-8 text-center text-deep-maroon">{quantity}</span>
                      <button
                        onClick={incrementQuantity}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-deep-maroon to-burgundy text-white flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleAddToCart}
                    className="btn-primary px-6 py-3 text-sm font-semibold"
                  >
                    Add to Cart
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowQuantitySelector(true)}
                  className="btn-primary p-3 rounded-2xl hover:scale-110 transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                </button>
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
