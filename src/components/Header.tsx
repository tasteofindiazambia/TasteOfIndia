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
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 w-full shadow-sm">
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
                <Link to="/" className="text-charcoal hover:text-deep-maroon transition-all duration-300 font-semibold tracking-wide text-sm uppercase hover:scale-105">
                  Home
                </Link>
                <Link to="/menu/1" className="text-charcoal hover:text-deep-maroon transition-all duration-300 font-semibold tracking-wide text-sm uppercase hover:scale-105">
                  Menu
                </Link>
                <Link to="/reservation" className="text-charcoal hover:text-deep-maroon transition-all duration-300 font-semibold tracking-wide text-sm uppercase hover:scale-105">
                  Reservations
                </Link>
                <Link to="/locations" className="text-charcoal hover:text-deep-maroon transition-all duration-300 font-semibold tracking-wide text-sm uppercase hover:scale-105">
                  Locations
                </Link>
                <Link to="/about" className="text-charcoal hover:text-deep-maroon transition-all duration-300 font-semibold tracking-wide text-sm uppercase hover:scale-105">
                  About
                </Link>
                <Link to="/admin" className="text-deep-maroon hover:text-burgundy transition-all duration-300 font-semibold tracking-wide text-sm uppercase border-2 border-deep-maroon px-4 py-2 rounded-xl hover:bg-deep-maroon hover:text-white hover:scale-105">
                  Admin
                </Link>
              </nav>
            </div>

            {/* Cart Icon - Far Right */}
            <div className="hidden lg:flex">
              <button 
                onClick={handleCartClick}
                className="relative p-3 text-charcoal hover:text-deep-maroon transition-all duration-300 hover:scale-110 rounded-xl hover:bg-gray-100"
              >
                <ShoppingCart className="w-6 h-6" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-deep-maroon to-burgundy text-light-cream text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse-slow">
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 text-charcoal hover:text-deep-maroon transition-all duration-300 hover:scale-110 rounded-xl hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
            <div className="px-6 py-6 space-y-4 animate-slide-in-up">
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
              <nav className="space-y-2">
                <Link 
                  to="/" 
                  className="block text-charcoal hover:text-deep-maroon transition-all duration-300 font-semibold tracking-wide text-sm uppercase py-3 px-4 rounded-xl hover:bg-gray-100 hover:scale-105"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/menu/1" 
                  className="block text-charcoal hover:text-deep-maroon transition-all duration-300 font-semibold tracking-wide text-sm uppercase py-3 px-4 rounded-xl hover:bg-gray-100 hover:scale-105"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link 
                  to="/reservation" 
                  className="block text-charcoal hover:text-deep-maroon transition-all duration-300 font-semibold tracking-wide text-sm uppercase py-3 px-4 rounded-xl hover:bg-gray-100 hover:scale-105"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Reservations
                </Link>
                <Link 
                  to="/locations" 
                  className="block text-charcoal hover:text-deep-maroon transition-all duration-300 font-semibold tracking-wide text-sm uppercase py-3 px-4 rounded-xl hover:bg-gray-100 hover:scale-105"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Locations
                </Link>
                <Link 
                  to="/about" 
                  className="block text-charcoal hover:text-deep-maroon transition-all duration-300 font-semibold tracking-wide text-sm uppercase py-3 px-4 rounded-xl hover:bg-gray-100 hover:scale-105"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/admin" 
                  className="block text-deep-maroon hover:text-burgundy transition-all duration-300 font-semibold tracking-wide text-sm uppercase py-3 px-4 rounded-xl border-2 border-deep-maroon hover:bg-deep-maroon hover:text-white hover:scale-105"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              </nav>
              
              {/* Mobile Cart Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200/50">
                <button 
                  onClick={handleCartClick}
                  className="relative p-3 text-charcoal hover:text-deep-maroon transition-all duration-300 hover:scale-110 rounded-xl hover:bg-gray-100"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-deep-maroon to-burgundy text-light-cream text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse-slow">
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