import React from 'react';
import { Instagram, Facebook, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold text-orange-400 mb-4">Taste of India</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Authentic Indian cuisine crafted with love and traditional recipes. 
              Experience the rich flavors and aromatic spices that make our dishes special.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#menu" className="text-gray-300 hover:text-orange-400 transition-colors">Menu</a></li>
              <li><a href="#about" className="text-gray-300 hover:text-orange-400 transition-colors">About Us</a></li>
              <li><a href="#contact" className="text-gray-300 hover:text-orange-400 transition-colors">Contact</a></li>
              <li><a href="#blog" className="text-gray-300 hover:text-orange-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-orange-400" />
                <span className="text-gray-300">+91 9999292992</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-orange-400" />
                <span className="text-gray-300">Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/tasteofindia"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/tasteofindia"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Taste of India. Made with ❤️ from Taste of India. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;