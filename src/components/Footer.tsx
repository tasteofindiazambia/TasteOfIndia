import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, User, MessageSquare } from 'lucide-react';
// import { useRestaurant } from '../context/RestaurantContext';

const Footer: React.FC = () => {
  // const { } = useRestaurant(); // Not currently using restaurant data
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.whatsapp,
          source: 'newsletter_subscription'
        }),
      });

      if (response.ok) {
        setSubmitMessage('Thank you for subscribing! We\'ll keep you updated.');
        setFormData({ name: '', email: '', whatsapp: '' });
        setShowSubscribeForm(false);
      } else {
        setSubmitMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(''), 5000);
    }
  };

  return (
    <footer className="bg-deep-maroon text-light-cream w-full">
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
            <p className="text-light-cream/80 leading-relaxed mb-6">
              Where evenings come alive. Join our warm, friendly community celebrating 
              diversity and authentic flavors in the heart of Lusaka.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 text-light-cream/80 hover:text-warm-pink transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 text-light-cream/80 hover:text-warm-pink transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 text-light-cream/80 hover:text-warm-pink transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-light-cream mb-6 tracking-wide uppercase">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
              <a href="/" className="text-light-cream hover:text-warm-pink transition-colors text-sm">
                Menu
              </a>
              </li>
              <li>
                <a href="/reservation" className="text-light-cream hover:text-warm-pink transition-colors text-sm">
                  Reservations
                </a>
              </li>
              <li>
                <a href="/locations" className="text-light-cream hover:text-warm-pink transition-colors text-sm">
                  Locations
                </a>
              </li>
              <li>
                <a href="/private-events" className="text-light-cream hover:text-warm-pink transition-colors text-sm">
                  Private Events
                </a>
              </li>
              <li>
                <a href="/contact" className="text-light-cream hover:text-warm-pink transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display text-lg font-semibold text-light-cream mb-6 tracking-wide uppercase">
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-warm-pink mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-light-cream/80 text-sm leading-relaxed">
                    Manda Hill, Lusaka
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-warm-pink flex-shrink-0" />
                <p className="text-light-cream/80 text-sm">
                  +91 70995 39615
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-warm-pink flex-shrink-0" />
                <p className="text-light-cream/80 text-sm">
                  hello@tasteofindia.co.zm
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-warm-pink mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-light-cream/80 text-sm">
                    Mon-Sun: 11:00 AM - 10:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display text-lg font-semibold text-light-cream mb-6 tracking-wide uppercase">
              Connect
            </h3>
            <p className="text-light-cream/80 text-sm leading-relaxed mb-4">
              Follow us for special offers, new menu items, and exclusive events.
            </p>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="p-2 text-light-cream/80 hover:text-warm-pink transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 text-light-cream/80 hover:text-warm-pink transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 text-light-cream/80 hover:text-warm-pink transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            {!showSubscribeForm ? (
              <div className="space-y-3">
                <button 
                  onClick={() => setShowSubscribeForm(true)}
                  className="w-full btn-primary bg-warm-pink text-light-cream px-4 py-3 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-rose hover:shadow-lg"
                >
                  Subscribe to Newsletter
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-cream/60" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-light-cream/10 border border-light-cream/20 rounded-none text-light-cream placeholder-light-cream/60 focus:outline-none focus:border-warm-pink transition-colors text-sm"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-cream/60" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-light-cream/10 border border-light-cream/20 rounded-none text-light-cream placeholder-light-cream/60 focus:outline-none focus:border-warm-pink transition-colors text-sm"
                  />
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-cream/60" />
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="WhatsApp number (optional)"
                    className="w-full pl-10 pr-4 py-3 bg-light-cream/10 border border-light-cream/20 rounded-none text-light-cream placeholder-light-cream/60 focus:outline-none focus:border-warm-pink transition-colors text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-warm-pink text-light-cream px-4 py-3 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-rose hover:shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowSubscribeForm(false)}
                    className="px-4 py-3 border border-light-cream/20 text-light-cream hover:bg-light-cream/10 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            
            {submitMessage && (
              <div className={`mt-3 text-sm ${submitMessage.includes('Thank you') ? 'text-green-300' : 'text-red-300'}`}>
                {submitMessage}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-light-cream/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-light-cream/80 text-sm">
              © 2024 Taste of India. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-light-cream hover:text-warm-pink transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-light-cream hover:text-warm-pink transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-light-cream hover:text-warm-pink transition-colors text-sm">
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