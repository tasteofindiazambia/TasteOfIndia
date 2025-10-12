-- Create hero_slides table for admin-managed hero section
CREATE TABLE IF NOT EXISTS hero_slides (
  id SERIAL PRIMARY KEY,
  slide_order INTEGER NOT NULL,
  slide_type VARCHAR(20) NOT NULL CHECK (slide_type IN ('menu', 'location', 'reservations', 'custom')),
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(200),
  description TEXT,
  background_image_url VARCHAR(500),
  background_images JSONB, -- For multiple images (like food collage)
  button_text VARCHAR(100),
  button_link VARCHAR(500),
  button_type VARCHAR(20) DEFAULT 'internal' CHECK (button_type IN ('internal', 'external', 'whatsapp')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for slide ordering
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON hero_slides(slide_order);

-- Create index for active slides
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON hero_slides(is_active);

-- Insert default slides data
INSERT INTO hero_slides (slide_order, slide_type, title, subtitle, description, background_image_url, background_images, button_text, button_link, button_type, is_active) VALUES
(1, 'menu', 'Taste of India', 'Where Evenings Come Alive', 'Experience authentic Indian flavors in the heart of Lusaka', 'buffet_TOI.jpeg', '["Dhokla_TOI.jpeg", "KajuKatli_TOI.jpeg", "Laddoo_TOI.jpeg"]', 'View Menu', '/menu/1', 'internal', true),
(2, 'location', 'Rhodespark Location', 'Plot 611, Parirenyetwa Rd', 'Our flagship restaurant in the heart of Rhodespark, offering an authentic Indian dining experience with warm hospitality and traditional flavors.', 'hero-image.png', null, 'Get Directions', 'https://maps.google.com/?q=Plot+611,+Parirenyetwa+Rd,+Rhodespark,+Lusaka', 'external', true),
(3, 'location', 'Manda Hill Location', 'Great East Rd, Lusaka', 'Conveniently located in Manda Hill shopping center, bringing the same authentic Indian cuisine and exceptional service to the heart of the city.', 'hero-image.png', null, 'Get Directions', 'https://maps.google.com/?q=Manda+Hill,+Great+East+Rd,+Lusaka', 'external', true),
(4, 'reservations', 'Venue Booking & Events', 'Reservations & Art Classes', 'Book our beautiful venue for special occasions, corporate events, or join our cultural art classes. Create unforgettable memories with us.', 'Reservations_TOI.jpeg', '["VenueBookingArtClass_TOI.jpeg"]', 'Make Reservation', 'https://wa.me/260774219999?text=Hi! I would like to make a reservation or book your venue for an event.', 'whatsapp', true);

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin can manage hero slides" ON hero_slides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'owner'
    )
  );

-- Create policy for public read access
CREATE POLICY "Public can view active hero slides" ON hero_slides
  FOR SELECT USING (is_active = true);
