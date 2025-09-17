import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, MapPin, Phone, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';

const Header: React.FC = () => {
  const { getCartItemCount, setIsCartOpen } = useCart();
  const { selectedRestaurant } = useRestaurant();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-deep-maroon text-light-cream py-2 text-center text-xs tracking-wider w-full">
        <p>Where Evenings Come Alive • Welcome to the feeling of India in Manda Hill • Fresh, Authentic, Welcoming</p>
      </div>
      
      {/* Main Header */}
      <header className="bg-warm-white border-b border-gray-100 sticky top-0 z-50 w-full">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              {/* Desktop/Tablet Logo */}
              <img 
                src="/wordmark.png" 
                alt="Taste of India" 
                className="hidden md:block h-12 w-auto object-contain"
              />
              {/* Mobile Logo */}
              <img 
                src="/wordmark-mobile.png" 
                alt="Taste of India" 
                className="block md:hidden h-10 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <nav className="flex items-center space-x-8">
                <Link to="/" className="text-charcoal hover:text-deep-maroon transition-colors font-medium tracking-wide text-sm uppercase">
                  Home
                </Link>
                <Link to="/menu/1" className="text-charcoal hover:text-deep-maroon transition-colors font-medium tracking-wide text-sm uppercase">
                  Menu
                </Link>
                <Link to="/reservation" className="text-charcoal hover:text-deep-maroon transition-colors font-medium tracking-wide text-sm uppercase">
                  Reservations
                </Link>
                <Link to="/locations" className="text-charcoal hover:text-deep-maroon transition-colors font-medium tracking-wide text-sm uppercase">
                  Locations
                </Link>
                <Link to="/about" className="text-charcoal hover:text-deep-maroon transition-colors font-medium tracking-wide text-sm uppercase">
                  About
                </Link>
                <Link to="/admin" className="text-deep-maroon hover:text-maroon transition-colors font-medium tracking-wide text-sm uppercase border border-deep-maroon px-3 py-1 rounded">
                  Admin
                </Link>
              </nav>
            </div>

            {/* Cart Icon - Far Right */}
            <div className="hidden lg:flex">
              <button 
                onClick={handleCartClick}
                className="relative p-2 text-charcoal hover:text-deep-maroon transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-deep-maroon text-light-cream text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-charcoal hover:text-spice transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-warm-white border-t border-gray-100">
            <div className="px-6 py-4 space-y-4">
              {/* Restaurant Info */}
              {selectedRestaurant && (
                <div className="flex items-center space-x-4 text-sm text-warm-gray pb-4 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedRestaurant.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{selectedRestaurant.phone}</span>
                  </div>
                </div>
              )}
              
              {/* Mobile Navigation Links */}
              <nav className="space-y-3">
                <Link 
                  to="/" 
                  className="block text-charcoal hover:text-deep-maroon transition-colors font-medium tracking-wide text-sm uppercase py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/menu/1" 
                  className="block text-charcoal hover:text-deep-maroon transition-colors font-medium tracking-wide text-sm uppercase py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link 
                  to="/reservation" 
                  className="block text-charcoal hover:text-deep-maroon transition-colors font-medium tracking-wide text-sm uppercase py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Reservations
                </Link>
                <Link 
                  to="/locations" 
                  className="block text-charcoal hover:text-deep-maroon transition-colors font-medium tracking-wide text-sm uppercase py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Locations
                </Link>
                <Link 
                  to="/about" 
                  className="block text-charcoal hover:text-deep-maroon transition-colors font-medium tracking-wide text-sm uppercase py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/admin" 
                  className="block text-deep-maroon hover:text-maroon transition-colors font-medium tracking-wide text-sm uppercase py-2 border border-deep-maroon px-3 py-2 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              </nav>
              
              {/* Mobile Cart Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button 
                  onClick={handleCartClick}
                  className="relative p-2 text-charcoal hover:text-deep-maroon transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-deep-maroon text-light-cream text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;