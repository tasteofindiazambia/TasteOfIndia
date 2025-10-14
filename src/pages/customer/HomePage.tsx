import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Users, Calendar } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import apiService from '../../services/api';

interface HeroSlide {
  id: number;
  slide_order: number;
  slide_type: 'menu' | 'location' | 'reservations' | 'custom';
  title: string;
  subtitle?: string;
  description?: string;
  background_image_url?: string;
  background_images?: string[];
  button_text?: string;
  button_link?: string;
  button_type: 'internal' | 'external' | 'whatsapp';
  is_active: boolean;
}

const HomePage: React.FC = () => {
  const { loading } = useRestaurant();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [slidesLoading, setSlidesLoading] = useState(true);

  // Fetch hero slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        console.log('🔄 [HomePage] Fetching hero slides...');
        const response = await apiService.request('/hero-slides');
        console.log('✅ [HomePage] Hero slides fetched:', response);
        setSlides(response);
        setSlidesLoading(false);
      } catch (error) {
        console.error('❌ [HomePage] Error fetching hero slides:', error);
        // Fallback to empty array if API fails
        setSlides([]);
        setSlidesLoading(false);
      }
    };

    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(fetchSlides, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll slides every 5 seconds
  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading || slidesLoading) {
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
                  backgroundColor: '#5C2F37', // Maroon fallback color
                  backgroundImage: (() => {
                    console.log(`🖼️ [HomePage] Processing slide ${slide.id}:`, {
                      slide_type: slide.slide_type,
                      background_image_url: slide.background_image_url,
                      background_images: slide.background_images,
                      title: slide.title
                    });

                    // For menu slides, use background_images if available
                    if (slide.slide_type === 'menu' && slide.background_images && slide.background_images.length > 0) {
                      const baseUrl = window.location.origin;
                      const imageUrl = `${baseUrl}/${slide.background_images[0]}`;
                      // Add 40% opacity maroon gradient overlay for better text readability
                      const bgUrl = `linear-gradient(rgba(92, 47, 55, 0.4), rgba(92, 47, 55, 0.4)), url('${imageUrl}')`;
                      console.log(`🖼️ [HomePage] Menu slide (ID: ${slide.id}) background URL: ${bgUrl}`);
                      console.log(`🖼️ [HomePage] Menu slide image URL: ${imageUrl}`);
                      return bgUrl;
                    }
                    
                    // For reservations slides, use background_images if available
                    if (slide.slide_type === 'reservations' && slide.background_images && slide.background_images.length > 0) {
                      const baseUrl = window.location.origin;
                      const imageUrl = `${baseUrl}/${slide.background_images[0]}`;
                      // Add 40% opacity maroon gradient overlay for better text readability
                      const bgUrl = `linear-gradient(rgba(92, 47, 55, 0.4), rgba(92, 47, 55, 0.4)), url('${imageUrl}')`;
                      console.log(`🖼️ [HomePage] Reservations slide (ID: ${slide.id}) background URL: ${bgUrl}`);
                      console.log(`🖼️ [HomePage] Reservations slide image URL: ${imageUrl}`);
                      return bgUrl;
                    }
                    
                    // For other slides or fallback, use background_image_url
                    if (slide.background_image_url) {
                      // Check if it's a full URL, base64, or a filename
                      if (slide.background_image_url.startsWith('http')) {
                        // External URL
                        const bgUrl = `linear-gradient(rgba(92, 47, 55, 0.4), rgba(92, 47, 55, 0.4)), url('${slide.background_image_url}')`;
                        console.log(`🖼️ [HomePage] External URL slide (ID: ${slide.id}) background URL: ${bgUrl}`);
                        console.log(`🖼️ [HomePage] External URL: ${slide.background_image_url}`);
                        return bgUrl;
                      } else if (slide.background_image_url.startsWith('data:image')) {
                        // Base64 image
                        const bgUrl = `linear-gradient(rgba(92, 47, 55, 0.4), rgba(92, 47, 55, 0.4)), url('${slide.background_image_url}')`;
                        console.log(`🖼️ [HomePage] Base64 image slide (ID: ${slide.id}) background URL: ${bgUrl.substring(0, 100)}...`);
                        return bgUrl;
                      } else {
                        // Local filename (legacy)
                        const baseUrl = window.location.origin;
                        const imageUrl = `${baseUrl}/${slide.background_image_url}`;
                        const bgUrl = `linear-gradient(rgba(92, 47, 55, 0.4), rgba(92, 47, 55, 0.4)), url('${imageUrl}')`;
                        console.log(`🖼️ [HomePage] Local file slide (ID: ${slide.id}) background URL: ${bgUrl}`);
                        console.log(`🖼️ [HomePage] Local file URL: ${imageUrl}`);
                        return bgUrl;
                      }
                    }
                    
                    // Fallback to maroon color when no image is provided
                    const maroonColor = '#5C2F37'; // Maroon color
                    console.log(`🖼️ [HomePage] Slide (ID: ${slide.id}) using maroon fallback (no image): ${maroonColor}`);
                    return maroonColor;
                  })()
                }}
              >
                {/* Debug: Test if background image is applied */}
                {process.env.NODE_ENV === 'development' && (
                  <div 
                    className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded z-50"
                    style={{ fontSize: '10px' }}
                  >
                    Debug: Slide {slide.id} - {slide.background_image_url || 'No image URL'}
                  </div>
                )}
                
                {/* Food Collage Overlay for Menu Slide */}
                {slide.slide_type === 'menu' && slide.background_images && slide.background_images.length > 1 && (
                  <div className="absolute inset-0 opacity-20">
                    {slide.background_images[1] && (
                      <div className="absolute top-10 right-10 w-32 h-32 rounded-full overflow-hidden">
                        <img 
                          src={`${window.location.origin}/${slide.background_images[1]}`} 
                          alt="Food item" 
                          className="w-full h-full object-cover"
                          onLoad={() => console.log(`✅ [HomePage] Food collage image 1 loaded: ${window.location.origin}/${slide.background_images?.[1]}`)}
                          onError={(e) => console.error(`❌ [HomePage] Food collage image 1 failed to load: ${window.location.origin}/${slide.background_images?.[1]}`, e)}
                        />
                      </div>
                    )}
                    {slide.background_images[2] && (
                      <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full overflow-hidden">
                        <img 
                          src={`${window.location.origin}/${slide.background_images[2]}`} 
                          alt="Food item" 
                          className="w-full h-full object-cover"
                          onLoad={() => console.log(`✅ [HomePage] Food collage image 2 loaded: ${window.location.origin}/${slide.background_images?.[2]}`)}
                          onError={(e) => console.error(`❌ [HomePage] Food collage image 2 failed to load: ${window.location.origin}/${slide.background_images?.[2]}`, e)}
                        />
                      </div>
                    )}
                    {slide.background_images[3] && (
                      <div className="absolute top-1/2 right-20 w-20 h-20 rounded-full overflow-hidden">
                        <img 
                          src={`${window.location.origin}/${slide.background_images[3]}`} 
                          alt="Food item" 
                          className="w-full h-full object-cover"
                          onLoad={() => console.log(`✅ [HomePage] Food collage image 3 loaded: ${window.location.origin}/${slide.background_images?.[3]}`)}
                          onError={(e) => console.error(`❌ [HomePage] Food collage image 3 failed to load: ${window.location.origin}/${slide.background_images?.[3]}`, e)}
                        />
                      </div>
                    )}
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
                    {slide.button_text && slide.button_link && (
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slide-in-up px-4" style={{ animationDelay: '0.6s' }}>
                        {slide.button_type === 'internal' ? (
                      <Link
                            to={slide.button_link}
                            className="btn-primary bg-gradient-to-r from-warm-pink to-rose text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl text-sm sm:text-base"
                      >
                            {slide.button_text}
                      </Link>
                        ) : (
                          <a
                            href={slide.button_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary bg-gradient-to-r from-warm-pink to-rose text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl text-sm sm:text-base"
                          >
                            {slide.button_text}
                          </a>
                        )}
                        {slide.slide_type === 'menu' && (
                      <Link
                            to="/menu/1"
                            className="btn-ghost border-2 border-light-cream/30 text-light-cream hover:bg-light-cream/10 hover:text-light-cream px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-md text-sm sm:text-base"
                      >
                            Order Now
                      </Link>
                        )}
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
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
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 z-20 pointer-events-auto"
        >
          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          aria-label="Next slide"
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 z-20 pointer-events-auto"
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

      {/* Facebook Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-deep-maroon to-burgundy relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-light-cream mb-4 sm:mb-6 animate-slide-in-up">
            Keep up with new dishes and promos
          </h2>
          <p className="font-accent text-lg sm:text-xl text-light-cream/90 mb-6 sm:mb-8 leading-relaxed animate-slide-in-up px-4" style={{ animationDelay: '0.2s' }}>
            Follow us on Facebook for the latest menu updates, special promotions, and behind-the-scenes content from our kitchen.
          </p>
          <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <a 
              href="https://www.facebook.com/p/Taste-of-India-61554487411311/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-white text-deep-maroon px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl text-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Follow us on Facebook</span>
            </a>
          </div>
        </div>
      </section>

      {/* End of main content */}
    </div>
  );
};

export default HomePage;