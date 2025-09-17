import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Mail, Utensils, Users } from 'lucide-react';

const LocationsPage: React.FC = () => {
  const locations = [
    {
      id: 1,
      name: "TASTE OF INDIA - MANDA HILL",
      address: "Manda Hill Shopping Mall, Great East Rd, Lusaka 10101, Zambia",
      phone: "+260 77 4219999",
      email: "manda@tasteofindia.co.zm",
      hours: "Open 24 hours",
      dressCode: "Smart Casual",
      cuisine: "Indian",
      description: "Experience the warmth of India's authentic flavors in Zambia's Golden City at Taste of India Manda Hill, where unforgettable sensory feasts await. This elegant dining space features our signature verandah-inspired atmosphere with traditional Indian hospitality.",
      features: ["Full Menu", "Private Dining", "Takeaway", "Delivery", "24/7 Service"],
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      status: "Open",
      rating: "4.8",
      reviews: "4 reviews"
    },
    {
      id: 2,
      name: "TASTE OF INDIA - PARIRENYETWA",
      address: "Parirenyetwa Rd, Lusaka 10101, Zambia",
      phone: "+260 77 3219999",
      email: "parirenyetwa@tasteofindia.co.zm",
      hours: "11:00 AM to 10:00 PM",
      dressCode: "Smart Casual",
      cuisine: "Indian",
      description: "Our flagship location bringing authentic Indian flavors and warm Zambian hospitality to the heart of Lusaka. This modern dining space combines traditional Indian cuisine with contemporary comfort, creating the perfect gathering place for friends and family.",
      features: ["Full Menu", "Private Dining", "Takeaway", "Delivery", "Family Friendly"],
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      status: "Open",
      rating: "4.1",
      reviews: "46 reviews"
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
              <div key={location.id} className="space-y-8">
                {/* Main Location Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    {/* Hero Image - Left Side (50% width) */}
                    <div className="lg:w-1/2">
                      <div 
                        className="w-full h-[500px] lg:h-[600px] bg-cover bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url('/hero-image.png')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center center'
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

                {/* Gallery Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif text-center">
                    Gallery
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Gallery Images with Primary Color Frames */}
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <div 
                          className="aspect-square rounded-lg overflow-hidden border-4 transition-all duration-300 group-hover:scale-105"
                          style={{
                            borderColor: index % 2 === 0 ? '#532734' : '#A0522D',
                            backgroundImage: `url('/hero-image.png')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="w-full h-full bg-gradient-to-br from-transparent to-black/20 flex items-end">
                            <div className="p-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              View Image
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-3 font-serif">
              Find Us in Lusaka
            </h2>
            <p className="text-lg text-gray-600">
              Two convenient locations for your dining pleasure
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl">
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.5!2d28.3!3d-15.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1941f4c8a8b8b8b8%3A0x8b8b8b8b8b8b8b8b!2sTaste%20of%20India%20Manda%20Hill%2C%20Lusaka%2C%20Zambia!5e0!3m2!1sen!2szm!4v1640995200000!5m2!1sen!2szm"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Taste of India Locations in Lusaka"
              ></iframe>
            </div>
            
            {/* Map Instructions */}
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 text-center">
                <strong>💡 Tip:</strong> Search for "Taste of India" in the map above to see both our locations marked with red pins!
              </p>
            </div>
            
            {/* Location Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 text-deep-maroon mr-2" />
                  Manda Hill Location
                </h3>
                <p className="text-gray-600 text-sm">
                  Manda Hill Shopping Mall<br />
                  Great East Rd, Lusaka 10101, Zambia
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Open 24 hours • ⭐ 4.8 (4 reviews)
                </p>
                <a 
                  href="https://www.google.com/maps/search/Taste+of+India+Manda+Hill,+Lusaka,+Zambia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-2 text-deep-maroon hover:text-burgundy text-xs font-medium transition-colors"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  View on Google Maps
                </a>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 text-deep-maroon mr-2" />
                  Parirenyetwa Location
                </h3>
                <p className="text-gray-600 text-sm">
                  Parirenyetwa Rd<br />
                  Lusaka 10101, Zambia
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Open: 11:00 AM - 10:00 PM • ⭐ 4.1 (46 reviews)
                </p>
                <a 
                  href="https://www.google.com/maps/search/Taste+of+India+Parirenyetwa+Rd,+Lusaka,+Zambia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-2 text-deep-maroon hover:text-burgundy text-xs font-medium transition-colors"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  View on Google Maps
                </a>
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
