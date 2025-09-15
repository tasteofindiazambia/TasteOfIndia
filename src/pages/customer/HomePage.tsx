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
      title: "Welcome to Taste of India",
      subtitle: "Where Evenings Come Alive",
      description: "Experience authentic Indian flavors in the heart of Lusaka"
    },
    {
      id: 2,
      title: "Authentic Indian Cuisine",
      subtitle: "Fresh, Traditional, Delicious",
      description: "From fragrant biryanis to crispy samosas, every dish tells a story"
    },
    {
      id: 3,
      title: "Warm Zambian Hospitality",
      subtitle: "A Place for Everyone",
      description: "Join our community where friends become family"
    },
    {
      id: 4,
      title: "Gather. Savor. Connect.",
      subtitle: "Your Verandah Awaits",
      description: "Create memories over shared meals and meaningful conversations"
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
      <section className="relative h-screen overflow-hidden" style={{ backgroundColor: '#532734' }}>
        {/* Slider Container */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Slide Background - using hero image */}
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `linear-gradient(rgba(83, 39, 52, 0.7), rgba(83, 39, 52, 0.7)), url('/hero-image.png')`
                }}
              >
                {/* Slide Content */}
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white px-6 lg:px-8 max-w-4xl">
                    <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fade-in">
                      {slide.title}
                    </h1>
                    <h2 className="font-accent text-xl md:text-2xl lg:text-3xl mb-6 text-light-cream animate-fade-in-delay">
                      {slide.subtitle}
                    </h2>
                    <p className="font-accent text-lg md:text-xl text-light-cream/90 mb-8 animate-fade-in-delay-2">
                      {slide.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-3">
                      <Link
                        to="/menu/1"
                        className="bg-warm-pink hover:bg-rose text-white px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        View Menu
                      </Link>
                      <Link
                        to="/reservation"
                        className="border-2 border-light-cream text-light-cream hover:bg-light-cream hover:text-deep-maroon px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
                      >
                        Make Reservation
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
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
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % 4)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* About Section */}
      <section className="py-20 bg-pattern">
        <div className="w-full px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-charcoal mb-4">
              A Place Where Cultures Meet
            </h2>
            <p className="font-accent text-xl text-warm-gray mb-8">
              Authentic Indian flavors, Zambian warmth
            </p>
            <p className="max-w-3xl mx-auto text-warm-gray leading-relaxed">
              Taste of India is more than a restaurant—it's a gathering place inspired by the classic Indian verandah. 
              We offer wholesome, mid-range Indian cuisine in a welcoming space where friends become family and every evening feels special.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Authentic Flavors */}
            <div className="card-elegant p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-deep-maroon to-burgundy rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Utensils className="w-8 h-8 text-light-cream" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-charcoal mb-4">
                Authentic Flavors
              </h3>
              <p className="text-warm-gray leading-relaxed mb-6">
                Traditional recipes with fresh, imported spices. Every dish tells a story of Indian heritage, 
                prepared with love and served with pride in our welcoming verandah-inspired space.
              </p>
              <Link 
                to="/menu/1" 
                className="btn-primary bg-deep-maroon text-light-cream px-6 py-3 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-burgundy hover:shadow-lg inline-block"
              >
                LEARN MORE
              </Link>
            </div>

            {/* Community Gathering */}
            <div className="card-elegant p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-warm-pink to-rose rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-light-cream" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-charcoal mb-4">
                Community Gathering
              </h3>
              <p className="text-warm-gray leading-relaxed mb-6">
                Flexible spaces for intimate conversations and group celebrations. Whether it's a family dinner, 
                business meeting, or special occasion, we create the perfect atmosphere for connection.
              </p>
              <Link 
                to="/reservation" 
                className="btn-primary bg-deep-maroon text-light-cream px-6 py-3 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-burgundy hover:shadow-lg inline-block"
              >
                LEARN MORE
              </Link>
            </div>

            {/* Cultural Exchange */}
            <div className="card-elegant p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-gold to-warm-pink rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-light-cream" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-charcoal mb-4">
                Cultural Exchange
              </h3>
              <p className="text-warm-gray leading-relaxed mb-6">
                Where Indian warmth meets Zambian hospitality. We celebrate the beautiful blend of cultures, 
                creating a space where everyone feels at home and every meal becomes a celebration.
              </p>
              <Link 
                to="/about" 
                className="btn-primary bg-deep-maroon text-light-cream px-6 py-3 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-burgundy hover:shadow-lg inline-block"
              >
                LEARN MORE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Highlights */}
      <section className="py-20 bg-warm-white">
        <div className="w-full px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-charcoal mb-4">
              Savor the Tradition
            </h2>
            <p className="font-accent text-xl text-warm-gray">
              From evening snacks to hearty meals, every dish tells a story
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Appetizers */}
            <div className="card-elegant p-6 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-deep-maroon to-burgundy rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-6 h-6 text-light-cream" />
              </div>
              <h3 className="font-display text-lg font-semibold text-charcoal mb-3">
                APPETIZERS
              </h3>
              <p className="text-warm-gray text-sm leading-relaxed">
                Crispy samosas with fresh chutneys, pakoras, and traditional Indian starters that awaken your taste buds.
              </p>
            </div>

            {/* Main Courses */}
            <div className="card-elegant p-6 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-warm-pink to-rose rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-6 h-6 text-light-cream" />
              </div>
              <h3 className="font-display text-lg font-semibold text-charcoal mb-3">
                MAIN COURSES
              </h3>
              <p className="text-warm-gray text-sm leading-relaxed">
                Aromatic biryanis, rich curries, and traditional Indian dishes prepared with authentic spices and love.
              </p>
            </div>

            {/* Beverages */}
            <div className="card-elegant p-6 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-warm-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-6 h-6 text-light-cream" />
              </div>
              <h3 className="font-display text-lg font-semibold text-charcoal mb-3">
                BEVERAGES
              </h3>
              <p className="text-warm-gray text-sm leading-relaxed">
                Traditional chai, fresh lassis, and refreshing drinks that perfectly complement your meal.
              </p>
            </div>

            {/* Desserts */}
            <div className="card-elegant p-6 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-burgundy to-deep-maroon rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-6 h-6 text-light-cream" />
              </div>
              <h3 className="font-display text-lg font-semibold text-charcoal mb-3">
                DESSERTS
              </h3>
              <p className="text-warm-gray text-sm leading-relaxed">
                Sweet endings with authentic Indian desserts that bring your dining experience to a perfect close.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/menu/1" 
              className="btn-primary bg-deep-maroon text-light-cream px-8 py-4 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-burgundy hover:shadow-lg inline-block"
            >
              VIEW FULL MENU
            </Link>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 bg-deep-maroon">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-semibold text-light-cream mb-6">
            More Than a Meal
          </h2>
          <p className="font-accent text-xl text-light-cream/90 mb-8 leading-relaxed">
            Every visit is an occasion to connect. Experience our family-friendly atmosphere, 
            perfect for celebrations and casual dinners. Join our cultural events and special evenings.
          </p>
          <div className="bg-light-cream/10 p-8 rounded-lg mb-8">
            <p className="font-accent text-lg text-light-cream italic">
              "Where everyone feels at home - this is what genuine hospitality feels like."
            </p>
            <p className="text-light-cream/80 mt-2">- Our valued guest</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/reservation" 
              className="btn-primary bg-warm-pink text-light-cream px-8 py-4 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-rose hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>BOOK A TABLE</span>
            </Link>
            <Link 
              to="/menu/1" 
              className="btn-secondary border-2 border-light-cream text-light-cream hover:bg-light-cream hover:text-deep-maroon px-8 py-4 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 flex items-center justify-center space-x-2"
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