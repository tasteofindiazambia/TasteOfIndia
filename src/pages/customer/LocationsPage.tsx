import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Mail, Utensils, Users } from 'lucide-react';

const LocationsPage: React.FC = () => {
  const locations = [
    {
      id: 1,
      name: "TASTE OF INDIA - MANDA HILL",
      address: "Manda Hill Shopping Centre, Lusaka, Zambia",
      phone: "+260 211 234 567",
      email: "manda@tasteofindia.co.zm",
      hours: "11:00 AM to 10:00 PM",
      dressCode: "Smart Casual",
      cuisine: "Indian",
      description: "Experience the warmth of India's authentic flavors in Zambia's Golden City at Taste of India Manda Hill, where unforgettable sensory feasts await. This elegant dining space features our signature verandah-inspired atmosphere with traditional Indian hospitality.",
      features: ["Full Menu", "Private Dining", "Takeaway", "Delivery", "Outdoor Seating"],
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      status: "Open"
    },
    {
      id: 2,
      name: "TASTE OF INDIA - EAST PARK",
      address: "East Park Mall, Great East Road, Lusaka, Zambia",
      phone: "+260 211 345 678",
      email: "eastpark@tasteofindia.co.zm",
      hours: "11:00 AM to 10:00 PM",
      dressCode: "Smart Casual",
      cuisine: "Indian",
      description: "Our second location bringing the same authentic Indian flavors and warm Zambian hospitality to East Park. This modern dining space combines traditional Indian cuisine with contemporary comfort, creating the perfect gathering place for friends and family.",
      features: ["Full Menu", "Private Dining", "Takeaway", "Delivery", "Family Friendly"],
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      status: "Open"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-12 bg-white">
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 font-serif">
            Visit Our Verandahs
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Two welcoming locations in Lusaka where authentic Indian flavors meet warm Zambian hospitality.
          </p>
        </div>
      </section>

      {/* Locations Section - Elegant Compact Layout */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <div className="space-y-16">
            {locations.map((location) => (
              <div key={location.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Hero Image - Left Side (50% width) */}
                  <div className="lg:w-1/2">
                    <div 
                      className="w-full h-[400px] lg:h-[450px] bg-cover bg-center"
                      style={{
                        backgroundImage: `url('/hero-image.png')`
                      }}
                    ></div>
                  </div>

                  {/* Content - Right Side (50% width) */}
                  <div className="lg:w-1/2 p-6 lg:p-8">
                    {/* Restaurant Name */}
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-serif">
                      {location.name}
                    </h2>
                    
                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6 text-base">
                      {location.description}
                    </p>

                    {/* Info Sections - Compact Layout */}
                    <div className="space-y-4">
                      {/* Timings */}
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">TIMINGS</h3>
                          <p className="text-gray-600 text-sm">{location.hours}</p>
                        </div>
                      </div>

                      {/* Cuisine */}
                      <div className="flex items-center space-x-3">
                        <Utensils className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">CUISINE</h3>
                          <p className="text-gray-600 text-sm">{location.cuisine}</p>
                        </div>
                      </div>

                      {/* Dress Code */}
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">DRESS CODE</h3>
                          <p className="text-gray-600 text-sm">{location.dressCode}</p>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-2">CONTACT</h3>
                          <div className="space-y-1">
                            <p className="text-gray-600 text-sm">{location.address}</p>
                            <div className="flex items-center space-x-2">
                              <Mail className="w-3 h-3 text-gray-500" />
                              <p className="text-gray-600 text-sm">{location.email}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-3 h-3 text-gray-500" />
                              <p className="text-gray-600 text-sm">{location.phone}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-8 lg:px-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-3 font-serif">
              Find Us in Lusaka
            </h2>
            <p className="text-lg text-gray-600">
              Conveniently located for your dining pleasure
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl">
            <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Interactive Map Coming Soon</p>
                <p className="text-gray-500 text-sm mt-1">
                  Manda Hill Shopping Centre, Lusaka, Zambia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4 font-serif">
            Questions About Our Locations?
          </h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            We're here to help you find the perfect dining experience. Contact us for reservations, 
            directions, or any questions about our locations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/contact" 
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 font-semibold transition-all duration-300 text-center rounded-lg"
            >
              CONTACT US
            </Link>
            <Link 
              to="/reservation" 
              className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-3 font-semibold transition-all duration-300 text-center rounded-lg"
            >
              MAKE RESERVATION
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LocationsPage;
