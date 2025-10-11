import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';

const HeaderNoIcons: React.FC = () => {
  const { getCartItemCount, setIsCartOpen } = useCart();
  const { selectedRestaurant } = useRestaurant();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-deep-maroon text-light-cream py-1 sm:py-2 text-center text-xs tracking-wider w-full">
        <p className="px-2 sm:px-4">Where Evenings Come Alive • Welcome to the feeling of India in Manda Hill • Fresh, Authentic, Welcoming</p>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img 
                  src="/logo.png" 
                  alt="Taste of India" 
                  className="h-8 sm:h-10 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden text-lg sm:text-2xl font-bold text-deep-maroon ml-2">
                  🍛 Taste of India
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              <Link to="/" className="text-gray-700 hover:text-deep-maroon font-medium transition-colors text-sm sm:text-base">
                Home
              </Link>
              <Link to="/menu/1" className="text-gray-700 hover:text-deep-maroon font-medium transition-colors text-sm sm:text-base">
                Menu
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-deep-maroon font-medium transition-colors text-sm sm:text-base">
                About
              </Link>
            </nav>

            {/* Right side - Cart and Location */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Location Selector */}
              <div className="hidden sm:flex items-center text-xs sm:text-sm text-gray-600">
                <span className="mr-1">📍</span>
                <span>{selectedRestaurant?.name || 'Select Location'}</span>
              </div>

              {/* Cart Button */}
              <button
                onClick={handleCartClick}
                className="relative bg-deep-maroon text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-burgundy transition-colors flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              >
                <span>🛒</span>
                <span className="hidden sm:inline">Cart</span>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-warm-pink text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 sm:p-2 text-gray-700 hover:text-deep-maroon text-lg sm:text-xl"
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-3 sm:py-4">
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-deep-maroon font-medium transition-colors text-sm sm:text-base py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/menu/1" 
                  className="text-gray-700 hover:text-deep-maroon font-medium transition-colors text-sm sm:text-base py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-700 hover:text-deep-maroon font-medium transition-colors text-sm sm:text-base py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                
                {/* Mobile Location */}
                <div className="flex items-center text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-200">
                  <span className="mr-1">📍</span>
                  <span>{selectedRestaurant?.name || 'Select Location'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default HeaderNoIcons;
