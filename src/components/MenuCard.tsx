import React, { useState } from 'react';
import { MenuItem } from '../types';
import { Plus, Minus, Clock, Flame } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    setQuantity(1);
  };

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'popular':
        return 'bg-yellow-400 text-black';
      case 'hot':
        return 'bg-red-500 text-white';
      case 'new addition':
        return 'bg-green-500 text-white';
      case 'trending':
        return 'bg-purple-500 text-white';
      case 'vegetarian':
        return 'bg-green-100 text-green-800';
      case 'spicy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Tags Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className={`px-2 py-1 rounded-full text-xs font-semibold ${getTagColor(tag)}`}
            >
              {tag === 'Hot' && <Flame className="inline h-3 w-3 mr-1" />}
              {tag}
            </span>
          ))}
        </div>

        {/* Preparation Time */}
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>{item.preparationTime}m</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-orange-600">₹{item.price}</span>
          {!item.available && (
            <span className="text-red-500 text-sm font-medium">Out of Stock</span>
          )}
        </div>

        {/* Quantity Selector and Add to Cart */}
        {item.available && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-medium text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCard;