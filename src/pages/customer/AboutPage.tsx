import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Users, Heart } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-cream">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-deep-maroon to-burgundy">
        <div className="w-full px-6 lg:px-8 text-center">
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-light-cream mb-6">
            Our Story
          </h1>
          <p className="font-accent text-xl text-light-cream/90 max-w-3xl mx-auto leading-relaxed">
            A place where cultures meet, traditions are honored, and every meal becomes a celebration of community.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-warm-white">
        <div className="w-full px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-4xl font-semibold text-charcoal mb-6">
                Where Evenings Come Alive
              </h2>
              <p className="text-warm-gray leading-relaxed mb-6">
                Taste of India is more than a restaurant—it's a gathering place inspired by the classic Indian verandah. 
                We offer wholesome, mid-range Indian cuisine in a welcoming space where friends become family and every 
                evening feels special.
              </p>
              <p className="text-warm-gray leading-relaxed mb-8">
                Our second location brings the beloved flavors you know with the warm hospitality that makes everyone 
                feel at home. We celebrate the beautiful blend of Indian warmth and Zambian hospitality, creating a 
                space where everyone feels welcome.
              </p>
              <Link 
                to="/menu/1" 
                className="btn-primary bg-deep-maroon text-light-cream px-8 py-4 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-burgundy hover:shadow-lg inline-block"
              >
                Explore Our Menu
              </Link>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-cover bg-center rounded-lg shadow-2xl"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
                }}
              ></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-warm-pink rounded-full flex items-center justify-center shadow-lg">
                <Utensils className="w-12 h-12 text-light-cream" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-pattern">
        <div className="w-full px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-charcoal mb-4">
              Our Values
            </h2>
            <p className="font-accent text-xl text-warm-gray">
              What makes us special
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
              <p className="text-warm-gray leading-relaxed">
                Traditional recipes with fresh, imported spices. Every dish tells a story of Indian heritage, 
                prepared with love and served with pride in our welcoming verandah-inspired space.
              </p>
            </div>

            {/* Community Gathering */}
            <div className="card-elegant p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-warm-pink to-rose rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-light-cream" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-charcoal mb-4">
                Community Gathering
              </h3>
              <p className="text-warm-gray leading-relaxed">
                Flexible spaces for intimate conversations and group celebrations. Whether it's a family dinner, 
                business meeting, or special occasion, we create the perfect atmosphere for connection.
              </p>
            </div>

            {/* Cultural Exchange */}
            <div className="card-elegant p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-gold to-warm-pink rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-light-cream" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-charcoal mb-4">
                Cultural Exchange
              </h3>
              <p className="text-warm-gray leading-relaxed">
                Where Indian warmth meets Zambian hospitality. We celebrate the beautiful blend of cultures, 
                creating a space where everyone feels at home and every meal becomes a celebration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-warm-white">
        <div className="w-full px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-charcoal mb-4">
              Meet Our Team
            </h2>
            <p className="font-accent text-xl text-warm-gray">
              The people behind the magic
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-elegant p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-deep-maroon to-burgundy rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-light-cream font-display font-bold text-2xl">C</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-charcoal mb-2">Chef Priya</h3>
              <p className="text-warm-gray text-sm">Head Chef</p>
              <p className="text-warm-gray text-sm mt-2">
                Bringing authentic Indian flavors to Lusaka with 15 years of culinary expertise.
              </p>
            </div>

            <div className="card-elegant p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-warm-pink to-rose rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-light-cream font-display font-bold text-2xl">R</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-charcoal mb-2">Rajesh</h3>
              <p className="text-warm-gray text-sm">Restaurant Manager</p>
              <p className="text-warm-gray text-sm mt-2">
                Ensuring every guest feels welcomed and every experience is memorable.
              </p>
            </div>

            <div className="card-elegant p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gold to-warm-pink rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-light-cream font-display font-bold text-2xl">A</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-charcoal mb-2">Aisha</h3>
              <p className="text-warm-gray text-sm">Service Manager</p>
              <p className="text-warm-gray text-sm mt-2">
                Creating warm, friendly service that makes every visit feel like coming home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
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
              <span>ORDER NOW</span>
            </Link>
            <Link 
              to="/menu/1" 
              className="bg-[#F5F5DC] text-[#532734] border-2 border-[#F5F5DC] hover:bg-[#532734] hover:text-[#F5F5DC] px-8 py-4 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>ORDER NOW</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
