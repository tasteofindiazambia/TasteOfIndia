import React from 'react';
import { ShoppingCart, User } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  cartTotal: number;
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, cartTotal, onCartClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-orange-600">
              Taste of India
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#menu" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Our Menu
            </a>
            <a href="#mission" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Our Mission
            </a>
            <a href="#contact" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Contact
            </a>
          </nav>

          {/* Cart and User */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-orange-600 transition-colors">
              <User className="h-6 w-6" />
            </button>
            
            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">₹{cartTotal}</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;