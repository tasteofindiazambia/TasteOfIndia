import React, { useState } from 'react';
import { MenuItem } from '../types';
import MenuCard from './MenuCard';
import { Filter } from 'lucide-react';

interface MenuSectionProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({ items, onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState<'food' | 'drinks' | 'sweets'>('food');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'food' as const, name: 'Food', icon: '🍽️' },
    { id: 'drinks' as const, name: 'Drinks', icon: '🥤' },
    { id: 'sweets' as const, name: 'Sweets', icon: '🍮' }
  ];

  const allTags = Array.from(new Set(items.flatMap(item => item.tags)));

  const filteredItems = items.filter(item => {
    const categoryMatch = item.category === activeCategory;
    const tagMatch = selectedTags.length === 0 || selectedTags.some(tag => item.tags.includes(tag));
    const priceMatch = item.price >= priceRange[0] && item.price <= priceRange[1];
    return categoryMatch && tagMatch && priceMatch;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const featuredItems = items.filter(item => item.tags.includes('Popular')).slice(0, 3);
  const newItems = items.filter(item => item.tags.includes('New Addition')).slice(0, 3);
  const trendingItems = items.filter(item => item.tags.includes('Trending')).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Featured Sections */}
      <div className="mb-16">
        {/* Popular Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map(item => (
              <MenuCard key={item.id} item={item} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>

        {/* New Arrivals */}
        {newItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">New Arrivals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newItems.map(item => (
                <MenuCard key={item.id} item={item} onAddToCart={onAddToCart} />
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {trendingItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Trending Now 🔥</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingItems.map(item => (
                <MenuCard key={item.id} item={item} onAddToCart={onAddToCart} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Menu */}
      <div id="menu">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Menu</h2>
        
        {/* Category Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center space-x-2 ${
                  activeCategory === category.id
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>

          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              {/* Tags Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">₹0 - ₹{priceRange[1]}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <MenuCard key={item.id} item={item} onAddToCart={onAddToCart} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuSection;