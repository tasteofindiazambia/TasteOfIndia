import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react';
// import { useRestaurant } from '../context/RestaurantContext';

const Footer: React.FC = () => {
  // const { } = useRestaurant(); // Not currently using restaurant data
  return (
    <footer className="bg-[#532734] text-[#F5F5DC] w-full">
      <div className="w-full px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="mb-6">
              {/* Desktop/Tablet Logo */}
              <img 
                src="/wordmark.png" 
                alt="Taste of India" 
                className="hidden md:block h-10 w-auto object-contain filter brightness-0 invert"
              />
              {/* Mobile Logo */}
              <img 
                src="/wordmark-mobile.png" 
                alt="Taste of India" 
                className="block md:hidden h-8 w-auto object-contain filter brightness-0 invert"
              />
            </div>
            <p className="text-[#F5F5DC] leading-relaxed mb-6">
              Where evenings come alive. Join our warm, friendly community celebrating 
              diversity and authentic flavors in the heart of Lusaka.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/p/Taste-of-India-61554487411311/" target="_blank" rel="noopener noreferrer" className="p-2 text-[#F5F5DC] hover:text-[#D2691E] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/tasteofindia_lsk/" target="_blank" rel="noopener noreferrer" className="p-2 text-[#F5F5DC] hover:text-[#D2691E] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-[#F5F5DC] mb-6 tracking-wide uppercase">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-[#F5F5DC] hover:text-[#D2691E] transition-colors text-sm font-medium">
                  Menu
                </a>
              </li>
              <li>
                <a href="/locations" className="text-[#F5F5DC] hover:text-[#D2691E] transition-colors text-sm font-medium">
                  Locations
                </a>
              </li>
              <li>
                <a href="/private-events" className="text-[#F5F5DC] hover:text-[#D2691E] transition-colors text-sm font-medium">
                  Private Events
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display text-lg font-semibold text-[#F5F5DC] mb-6 tracking-wide uppercase">
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#D2691E] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#F5F5DC] text-sm leading-relaxed font-medium">
                    Manda Hill, Lusaka
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#D2691E] mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <div>
                    <p className="text-[#F5F5DC] text-sm font-medium">
                      +260 773 219 999
                    </p>
                    <p className="text-[#D2691E] text-xs">
                      WhatsApp/Chat
                    </p>
                  </div>
                  <div>
                    <p className="text-[#F5F5DC] text-sm font-medium">
                      +260 774 219 999
                    </p>
                    <p className="text-[#D2691E] text-xs">
                      Reservations & Inquiries
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#D2691E] flex-shrink-0" />
                <p className="text-[#F5F5DC] text-sm font-medium">
                  taste.of.india.zambia@gmail.com
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-[#D2691E] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#F5F5DC] text-sm font-medium">
                    Mon-Sun: 11:00 AM - 10:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-display text-lg font-semibold text-[#F5F5DC] mb-6 tracking-wide uppercase">
              Connect
            </h3>
            <p className="text-[#F5F5DC] text-sm leading-relaxed mb-4">
              Follow us for special offers, new menu items, and exclusive events.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/p/Taste-of-India-61554487411311/" target="_blank" rel="noopener noreferrer" className="p-2 text-[#F5F5DC] hover:text-[#D2691E] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/tasteofindia_lsk/" target="_blank" rel="noopener noreferrer" className="p-2 text-[#F5F5DC] hover:text-[#D2691E] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#F5F5DC]/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-[#F5F5DC] text-sm font-medium">
              © 2024 Taste of India. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-[#F5F5DC] hover:text-[#D2691E] transition-colors text-sm font-medium">
                Privacy Policy
              </a>
              <a href="#" className="text-[#F5F5DC] hover:text-[#D2691E] transition-colors text-sm font-medium">
                Terms of Service
              </a>
              <a href="#" className="text-[#F5F5DC] hover:text-[#D2691E] transition-colors text-sm font-medium">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;