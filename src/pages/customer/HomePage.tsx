import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Users, Calendar } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

const HomePage: React.FC = () => {
  const { loading } = useRestaurant();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-scroll slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sample slide data - will be replaced with actual images later
  const slides = [
    {
      id: 1,
      type: "menu",
      title: "Taste of India",
      subtitle: "Where Evenings Come Alive",
      description: "Experience authentic Indian flavors in the heart of Lusaka",
      backgroundImages: ["buffet_TOI.jpeg", "Dhokla_TOI.jpeg", "KajuKatli_TOI.jpeg", "Laddoo_TOI.jpeg"],
      buttonText: "View Menu",
      buttonLink: "/menu/1"
    },
    {
      id: 2,
      type: "location",
      title: "Rhodespark Location",
      subtitle: "Plot 611, Parirenyetwa Rd",
      description: "Our flagship restaurant in the heart of Rhodespark, offering an authentic Indian dining experience with warm hospitality and traditional flavors.",
      backgroundImage: "hero-image.png", // Placeholder until you provide location images
      buttonText: "Get Directions",
      buttonLink: "https://maps.google.com/?q=Plot+611,+Parirenyetwa+Rd,+Rhodespark,+Lusaka"
    },
    {
      id: 3,
      type: "location",
      title: "Manda Hill Location",
      subtitle: "Great East Rd, Lusaka",
      description: "Conveniently located in Manda Hill shopping center, bringing the same authentic Indian cuisine and exceptional service to the heart of the city.",
      backgroundImage: "hero-image.png", // Placeholder until you provide location images
      buttonText: "Get Directions",
      buttonLink: "https://maps.google.com/?q=Manda+Hill,+Great+East+Rd,+Lusaka"
    },
    {
      id: 4,
      type: "reservations",
      title: "Venue Booking & Events",
      subtitle: "Reservations & Art Classes",
      description: "Book our beautiful venue for special occasions, corporate events, or join our cultural art classes. Create unforgettable memories with us.",
      backgroundImages: ["Reservations_TOI.jpeg", "VenueBookingArtClass_TOI.jpeg"],
      buttonText: "Make Reservation",
      buttonLink: "https://wa.me/260774219999?text=Hi! I would like to make a reservation or book your venue for an event."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spice"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section - Auto-scrolling Image Slider */}
      <section className="relative h-screen overflow-hidden bg-gradient-to-br from-deep-maroon via-primary to-burgundy">
        {/* Slider Container */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Slide Background */}
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: slide.type === 'menu' 
                    ? `linear-gradient(rgba(83, 39, 52, 0.8), rgba(83, 39, 52, 0.8)), url('/${slide.backgroundImages[0]}')`
                    : slide.type === 'reservations'
                    ? `linear-gradient(rgba(83, 39, 52, 0.8), rgba(83, 39, 52, 0.8)), url('/${slide.backgroundImages[0]}')`
                    : `linear-gradient(rgba(83, 39, 52, 0.7), rgba(83, 39, 52, 0.7)), url('/${slide.backgroundImage}')`
                }}
              >
                {/* Food Collage Overlay for Menu Slide */}
                {slide.type === 'menu' && (
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 right-10 w-32 h-32 rounded-full overflow-hidden">
                      <img src={`/${slide.backgroundImages[1]}`} alt="Dhokla" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full overflow-hidden">
                      <img src={`/${slide.backgroundImages[2]}`} alt="Kaju Katli" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-1/2 right-20 w-20 h-20 rounded-full overflow-hidden">
                      <img src={`/${slide.backgroundImages[3]}`} alt="Laddoo" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {/* Slide Content */}
                <div className="flex items-center justify-center h-full px-4 relative z-10">
                  <div className="text-center text-white max-w-4xl w-full">
                    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 animate-slide-in-up leading-tight">
                      {slide.title}
                    </h1>
                    <h2 className="font-accent text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 sm:mb-6 text-light-cream animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                      {slide.subtitle}
                    </h2>
                    <p className="font-accent text-base sm:text-lg md:text-xl text-light-cream/90 mb-6 sm:mb-8 animate-slide-in-up px-2" style={{ animationDelay: '0.4s' }}>
                      {slide.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slide-in-up px-4" style={{ animationDelay: '0.6s' }}>
                      {slide.type === 'menu' ? (
                        <>
                          <Link
                            to={slide.buttonLink}
                            className="btn-primary bg-gradient-to-r from-warm-pink to-rose text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl text-sm sm:text-base"
                          >
                            {slide.buttonText}
                          </Link>
                          <Link
                            to="/menu/1"
                            className="btn-ghost border-2 border-light-cream/30 text-light-cream hover:bg-light-cream/10 hover:text-light-cream px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-md text-sm sm:text-base"
                          >
                            Order Now
                          </Link>
                        </>
                      ) : slide.type === 'location' ? (
                        <a
                          href={slide.buttonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary bg-gradient-to-r from-warm-pink to-rose text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl text-sm sm:text-base"
                        >
                          {slide.buttonText}
                        </a>
                      ) : (
                        <a
                          href={slide.buttonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary bg-gradient-to-r from-warm-pink to-rose text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl text-sm sm:text-base"
                        >
                          {slide.buttonText}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-warm-pink scale-125' 
                  : 'bg-light-cream/50 hover:bg-light-cream/75'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + 4) % 4)}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
        >
          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % 4)}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
        >
          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-surface to-warm-beige relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern opacity-30"></div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16 animate-slide-in-up">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal mb-3 sm:mb-4">
              A Place Where Cultures Meet
            </h2>
            <p className="font-accent text-lg sm:text-xl text-warm-gray mb-6 sm:mb-8">
              Authentic Indian flavors, Zambian warmth
            </p>
            <p className="max-w-3xl mx-auto text-warm-gray leading-relaxed text-base sm:text-lg px-4">
              Taste of India is more than a restaurant—it's a gathering place inspired by the classic Indian verandah. 
              We offer wholesome, mid-range Indian cuisine in a welcoming space where friends become family and every evening feels special.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Authentic Flavors */}
            <div className="card-floating p-6 sm:p-8 text-center group animate-slide-in-left">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-deep-maroon to-burgundy rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-light-cream" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-charcoal mb-3 sm:mb-4">
                Authentic Flavors
              </h3>
              <p className="text-warm-gray leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Traditional recipes with fresh, imported spices. Every dish tells a story of Indian heritage, 
                prepared with love and served with pride in our welcoming verandah-inspired space.
              </p>
              <Link 
                to="/menu/1" 
                className="btn-primary inline-block text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
              >
                LEARN MORE
              </Link>
            </div>

            {/* Community Gathering */}
            <div className="card-floating p-6 sm:p-8 text-center group animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-warm-pink to-rose rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-light-cream" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-charcoal mb-3 sm:mb-4">
                Community Gathering
              </h3>
              <p className="text-warm-gray leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Flexible spaces for intimate conversations and group celebrations. Whether it's a family dinner, 
                business meeting, or special occasion, we create the perfect atmosphere for connection.
              </p>
              <Link 
                to="/menu/1" 
                className="btn-primary inline-block text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
              >
                ORDER NOW
              </Link>
            </div>

            {/* Cultural Exchange */}
            <div className="card-floating p-6 sm:p-8 text-center group animate-slide-in-right">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gold to-warm-pink rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-light-cream" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-charcoal mb-3 sm:mb-4">
                Cultural Exchange
              </h3>
              <p className="text-warm-gray leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Where Indian warmth meets Zambian hospitality. We celebrate the beautiful blend of cultures, 
                creating a space where everyone feels at home and every meal becomes a celebration.
              </p>
              <Link 
                to="/about" 
                className="btn-primary inline-block text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
              >
                LEARN MORE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Highlights */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-warm-white to-surface relative">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 animate-slide-in-up">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal mb-3 sm:mb-4">
              Savor the Tradition
            </h2>
            <p className="font-accent text-lg sm:text-xl text-warm-gray">
              From evening snacks to hearty meals, every dish tells a story
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Appetizers */}
            <div className="card-elegant p-4 sm:p-6 text-center group animate-scale-in">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-deep-maroon to-burgundy rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-light-cream" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-charcoal mb-2 sm:mb-3">
                APPETIZERS
              </h3>
              <p className="text-warm-gray text-xs sm:text-sm leading-relaxed">
                Crispy samosas with fresh chutneys, pakoras, and traditional Indian starters that awaken your taste buds.
              </p>
            </div>

            {/* Main Courses */}
            <div className="card-elegant p-4 sm:p-6 text-center group animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-warm-pink to-rose rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-light-cream" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-charcoal mb-2 sm:mb-3">
                MAIN COURSES
              </h3>
              <p className="text-warm-gray text-xs sm:text-sm leading-relaxed">
                Aromatic biryanis, rich curries, and traditional Indian dishes prepared with authentic spices and love.
              </p>
            </div>

            {/* Beverages */}
            <div className="card-elegant p-4 sm:p-6 text-center group animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gold to-warm-pink rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-light-cream" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-charcoal mb-2 sm:mb-3">
                BEVERAGES
              </h3>
              <p className="text-warm-gray text-xs sm:text-sm leading-relaxed">
                Traditional chai, fresh lassis, and refreshing drinks that perfectly complement your meal.
              </p>
            </div>

            {/* Desserts */}
            <div className="card-elegant p-4 sm:p-6 text-center group animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-burgundy to-deep-maroon rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-light-cream" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-charcoal mb-2 sm:mb-3">
                DESSERTS
              </h3>
              <p className="text-warm-gray text-xs sm:text-sm leading-relaxed">
                Sweet endings with authentic Indian desserts that bring your dining experience to a perfect close.
              </p>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-12 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <Link 
              to="/menu/1" 
              className="btn-primary inline-block text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
            >
              VIEW FULL MENU
            </Link>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-deep-maroon via-primary to-burgundy relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern opacity-20"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-light-cream mb-4 sm:mb-6 animate-slide-in-up">
            More Than a Meal
          </h2>
          <p className="font-accent text-lg sm:text-xl text-light-cream/90 mb-6 sm:mb-8 leading-relaxed animate-slide-in-up px-4" style={{ animationDelay: '0.2s' }}>
            Every visit is an occasion to connect. Experience our family-friendly atmosphere, 
            perfect for celebrations and casual dinners. Join our cultural events and special evenings.
          </p>
          <div className="card-glass p-6 sm:p-8 mb-6 sm:mb-8 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <p className="font-accent text-base sm:text-lg text-light-cream italic">
              "Where everyone feels at home - this is what genuine hospitality feels like."
            </p>
            <p className="text-light-cream/80 mt-2 text-sm sm:text-base">- Our valued guest</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slide-in-up px-4" style={{ animationDelay: '0.6s' }}>
            <Link 
              to="/menu/1" 
              className="btn-primary bg-gradient-to-r from-warm-pink to-rose text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Utensils className="w-4 h-4" />
              <span>ORDER NOW</span>
            </Link>
            <Link 
              to="/menu/1" 
              className="btn-ghost border-2 border-light-cream/30 text-light-cream hover:bg-light-cream/10 hover:text-light-cream px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-md flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Utensils className="w-4 h-4" />
              <span>EXPLORE OUR MENU</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;