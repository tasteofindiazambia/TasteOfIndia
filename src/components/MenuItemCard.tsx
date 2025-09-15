import React, { useState, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);

  const handleAddToCart = useCallback(() => {
    onAddToCart(item, quantity);
    setShowQuantitySelector(false);
    setQuantity(1);
  }, [onAddToCart, item, quantity]);

  const incrementQuantity = useCallback(() => {
    setQuantity(prev => prev + 1);
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity(prev => Math.max(1, prev - 1));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Item Image */}
      <div className="h-64 bg-gray-200 relative">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-lg">No Image</span>
          </div>
        )}
        
        {/* Availability Badge */}
        {(item.availability_status === 0 || item.available === false) && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
            Out of Stock
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-deep-maroon">
            K{item.price.toFixed(0)}
          </span>
          
          {item.availability_status === 1 ? (
            <div className="flex items-center space-x-2">
              {showQuantitySelector ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={decrementQuantity}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold w-8 text-center">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="bg-deep-maroon text-light-cream px-4 py-2 rounded-lg hover:bg-burgundy transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowQuantitySelector(true)}
                  className="bg-deep-maroon text-light-cream p-2 rounded-lg hover:bg-burgundy transition-colors"
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
