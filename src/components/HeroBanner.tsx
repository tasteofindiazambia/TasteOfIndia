import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onAddToCart: (itemId: string, couponCode?: string) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ onAddToCart }) => {
  const handlePaniPuriOffer = () => {
    onAddToCart('panipuri', 'PANIPURI6');
  };

  return (
    <div className="relative bg-gradient-to-r from-orange-500 to-red-600 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold mb-4">
              NEW OFFER
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Group of 6?<br />
              Get Pani Puri for<br />
              <span className="text-yellow-300">40% OFF!</span>
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Perfect for sharing! 6 pieces of our famous Pani Puri with authentic flavors.
            </p>
            <button
              onClick={handlePaniPuriOffer}
              className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors flex items-center space-x-2 group"
            >
              <span>Add to Cart - ₹72 (was ₹120)</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-sm mt-3 opacity-75">
              Coupon code "PANIPURI6" automatically applied
            </p>
          </div>
          
          <div className="relative">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
              <img
                src="https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Pani Puri Special Offer"
                className="w-full h-64 object-cover rounded-lg shadow-2xl"
              />
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold">Pani Puri Special</div>
                <div className="text-yellow-300">6 pieces • 40% OFF</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;