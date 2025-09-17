import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Mail, Send, MessageCircle } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-light-cream">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-deep-maroon to-burgundy">
        <div className="w-full px-6 lg:px-8 text-center">
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-light-cream mb-6">
            Get In Touch
          </h1>
          <p className="font-accent text-xl text-light-cream/90 max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you. Whether you have questions, feedback, or want to plan a special event, 
            we're here to help.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-warm-white">
        <div className="w-full px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Contact Info Cards */}
            <div className="card-elegant p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-deep-maroon to-burgundy rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-light-cream" />
              </div>
              <h3 className="font-display text-xl font-semibold text-charcoal mb-4">Visit Us</h3>
              <p className="text-warm-gray leading-relaxed">
                Manda Hill Shopping Centre<br />
                Lusaka, Zambia
              </p>
            </div>

            <div className="card-elegant p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-warm-pink to-rose rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-8 h-8 text-light-cream" />
              </div>
              <h3 className="font-display text-xl font-semibold text-charcoal mb-4">Call Us</h3>
              <p className="text-warm-gray leading-relaxed">
                +260 XX XXX XXXX<br />
                Mon-Sun: 11:00 AM - 10:00 PM
              </p>
            </div>

            <div className="card-elegant p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-gold to-warm-pink rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-8 h-8 text-light-cream" />
              </div>
              <h3 className="font-display text-xl font-semibold text-charcoal mb-4">Email Us</h3>
              <p className="text-warm-gray leading-relaxed">
                hello@tasteofindia.co.zm<br />
                We'll respond within 24 hours
              </p>
            </div>
          </div>

          {/* Contact Form and Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card-elegant p-8">
              <h2 className="font-display text-3xl font-semibold text-charcoal mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-deep-maroon transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-deep-maroon transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-deep-maroon transition-colors"
                      placeholder="+260 XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-charcoal mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-deep-maroon transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="reservation">Reservation Inquiry</option>
                      <option value="private-event">Private Event</option>
                      <option value="catering">Catering Services</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-deep-maroon transition-colors resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary bg-deep-maroon text-light-cream px-8 py-4 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-burgundy hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>SEND MESSAGE</span>
                </button>
              </form>
            </div>

            {/* Additional Information */}
            <div className="space-y-8">
              {/* Business Hours */}
              <div className="card-elegant p-8">
                <h3 className="font-display text-2xl font-semibold text-charcoal mb-6 flex items-center">
                  <Clock className="w-6 h-6 text-warm-pink mr-3" />
                  Business Hours
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-warm-gray">Monday - Sunday</span>
                    <span className="text-charcoal font-medium">11:00 AM - 10:00 PM</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-warm-gray text-sm">
                      We're open every day to serve you authentic Indian cuisine. 
                      Reservations are recommended for dinner service.
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Services */}
              <div className="card-elegant p-8">
                <h3 className="font-display text-2xl font-semibold text-charcoal mb-6 flex items-center">
                  <MessageCircle className="w-6 h-6 text-warm-pink mr-3" />
                  Special Services
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Private Events</h4>
                    <p className="text-warm-gray text-sm">
                      Host your special occasions in our elegant dining space. 
                      Perfect for birthdays, anniversaries, and corporate events.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Catering Services</h4>
                    <p className="text-warm-gray text-sm">
                      Bring our authentic flavors to your location. 
                      Available for office events, parties, and special celebrations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Takeaway & Delivery</h4>
                    <p className="text-warm-gray text-sm">
                      Enjoy our delicious food in the comfort of your home. 
                      Call us to place your order or use our delivery service.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Link 
                  to="/reservation" 
                  className="w-full btn-primary bg-warm-pink text-light-cream px-6 py-3 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-rose hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>MAKE RESERVATION</span>
                </Link>
                <Link 
                  to="/locations" 
                  className="w-full btn-secondary border-2 border-deep-maroon text-deep-maroon px-6 py-3 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-deep-maroon hover:text-light-cream flex items-center justify-center space-x-2"
                >
                  <span>VIEW LOCATIONS</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-deep-maroon">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-semibold text-light-cream mb-6">
            Ready to Experience Our Hospitality?
          </h2>
          <p className="font-accent text-xl text-light-cream/90 mb-8 leading-relaxed">
            Join us for an unforgettable dining experience where every meal celebrates community, 
            culture, and authentic Indian flavors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/menu/1" 
              className="btn-primary bg-warm-pink text-light-cream px-8 py-4 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-rose hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <span>VIEW OUR MENU</span>
            </Link>
            <Link 
              to="/reservation" 
              className="bg-[#F5F5DC] text-[#532734] border-2 border-[#F5F5DC] hover:bg-[#532734] hover:text-[#F5F5DC] px-8 py-4 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>BOOK A TABLE</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
