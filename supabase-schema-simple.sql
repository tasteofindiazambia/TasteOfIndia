-- 🍛 Taste of India - Supabase Database Schema
-- Copy and paste this entire file into Supabase SQL Editor and click RUN

-- 🏢 Restaurants/Locations table with delivery settings
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    hours JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    delivery_fee_per_km DECIMAL(10,2) DEFAULT 10.00,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    max_delivery_radius_km INTEGER DEFAULT 15,
    min_delivery_order DECIMAL(10,2) DEFAULT 25.00,
    delivery_time_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📂 Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🍽️ Menu items table with dynamic pricing
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    image_url VARCHAR(500),
    available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    tags TEXT, -- Comma-separated tags
    spice_level VARCHAR(20) DEFAULT 'mild',
    pieces_count INTEGER,
    preparation_time INTEGER DEFAULT 15,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    dynamic_pricing BOOLEAN DEFAULT false, -- For per-gram pricing on sweets
    packaging_price DECIMAL(10,2) DEFAULT 0,
    listing_preference VARCHAR(10) DEFAULT 'mid', -- high, mid, low
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 👥 Customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    location VARCHAR(100),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    last_order_date TIMESTAMP WITH TIME ZONE,
    favorite_items JSONB DEFAULT '[]',
    dietary_requirements JSONB DEFAULT '[]',
    birthday DATE,
    anniversary DATE,
    loyalty_points INTEGER DEFAULT 0,
    preferred_contact_method VARCHAR(20) DEFAULT 'whatsapp',
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📦 Orders table with delivery and security features
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    order_token VARCHAR(64) UNIQUE, -- Secure token for customer access
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    order_type VARCHAR(20) DEFAULT 'pickup', -- pickup, delivery
    payment_method VARCHAR(20) DEFAULT 'cash',
    special_instructions TEXT,
    estimated_preparation_time INTEGER DEFAULT 20,
    delivery_address TEXT, -- For delivery orders
    delivery_time_estimate INTEGER, -- Additional time for delivery
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    delivery_latitude DECIMAL(10,8), -- Customer location for delivery
    delivery_longitude DECIMAL(11,8), -- Customer location for delivery
    delivery_distance_km DECIMAL(5,2), -- Distance from restaurant
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🛒 Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🍽️ Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    reservation_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    party_size INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    occasion VARCHAR(100),
    table_preference VARCHAR(100),
    dietary_requirements TEXT,
    confirmation_method VARCHAR(20) DEFAULT 'whatsapp',
    special_requests TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 Analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    total_reservations INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    peak_hour VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🚀 Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_token ON orders(order_token);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 🏢 Insert sample restaurants with delivery settings
INSERT INTO restaurants (id, name, address, phone, email, hours, delivery_fee_per_km, latitude, longitude, max_delivery_radius_km, min_delivery_order, delivery_time_minutes) VALUES
(1, 'Taste of India - Manda Hill', 'Manda Hill Shopping Centre, Lusaka', '+260 97 123 4567', 'manda@tasteofindia.co.zm', '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "11:00-21:00"}', 10.00, -15.3875, 28.3228, 15, 25.00, 30),
(2, 'Taste of India - Parirenyetwa', 'Parirenyetwa Rd, Lusaka 10101, Zambia', '+260 77 3219999', 'parirenyetwa@tasteofindia.co.zm', '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "11:00-21:00"}', 12.00, -15.4067, 28.2833, 12, 20.00, 25)
ON CONFLICT (id) DO NOTHING;

-- 📂 Insert categories
INSERT INTO categories (id, name, description, restaurant_id, display_order) VALUES
(1, 'Appetizers', 'Start your meal with our delicious appetizers', 1, 1),
(2, 'Main Courses', 'Hearty main dishes to satisfy your hunger', 1, 2),
(3, 'Beverages', 'Refreshing drinks to complement your meal', 1, 3),
(4, 'Desserts', 'Sweet endings to your dining experience', 1, 4),
(5, 'Appetizers', 'Start your meal with our delicious appetizers', 2, 1),
(6, 'Main Courses', 'Hearty main dishes to satisfy your hunger', 2, 2),
(7, 'Beverages', 'Refreshing drinks to complement your meal', 2, 3),
(8, 'Desserts', 'Sweet endings to your dining experience', 2, 4)
ON CONFLICT (id) DO NOTHING;

-- 🍽️ Insert comprehensive menu items with dynamic pricing
INSERT INTO menu_items (id, name, description, price, category_id, restaurant_id, image_url, available, featured, tags, spice_level, pieces_count, preparation_time, is_vegetarian, dynamic_pricing, packaging_price, listing_preference) VALUES
-- APPETIZERS - High Priority
(1, 'Samosas', 'Crispy triangular pastries filled with spiced potatoes and peas', 8.00, 1, 1, '/images/samosas.jpg', true, true, 'popular,vegetarian,fried,crunchy,sharable', 'mild', 2, 15, true, false, 2.00, 'high'),
(2, 'Chicken Tikka', 'Tender marinated chicken pieces grilled to perfection', 18.00, 1, 1, '/images/chicken-tikka.jpg', true, true, 'popular,chicken,grilled,protein,spicy', 'medium', 6, 20, false, false, 2.50, 'high'),
(3, 'Paneer Tikka', 'Grilled cottage cheese cubes with bell peppers and onions', 16.00, 1, 1, '/images/paneer-tikka.jpg', true, false, 'vegetarian,grilled,protein,healthy,colorful', 'medium', 8, 18, true, false, 2.00, 'mid'),

-- MAIN COURSES - High Priority  
(4, 'Butter Chicken', 'Tender chicken in a rich tomato and cream sauce', 22.00, 2, 1, '/images/butter-chicken.jpg', true, true, 'popular,chicken,creamy,rich,comfort', 'mild', 1, 25, false, false, 3.00, 'high'),
(5, 'Chicken Biryani', 'Fragrant basmati rice with tender chicken and aromatic spices', 28.00, 2, 1, '/images/chicken-biryani.jpg', true, true, 'popular,rice,chicken,aromatic,hearty', 'medium', 1, 30, false, false, 3.50, 'high'),
(6, 'Dal Makhani', 'Creamy black lentils slow-cooked with butter and spices', 18.00, 2, 1, '/images/dal-makhani.jpg', true, false, 'vegetarian,creamy,comfort,protein,traditional', 'mild', 1, 20, true, false, 2.50, 'mid'),

-- DESSERTS - Per-gram pricing
(7, 'Kaju Katli', 'Premium cashew fudge with silver leaf', 0.80, 4, 1, '/images/kaju-katli.jpg', true, false, 'sweet,premium,cashew,rich,traditional', 'mild', null, 5, true, true, 2.00, 'low'),
(8, 'Rasgulla', 'Spongy cottage cheese balls in sugar syrup', 0.60, 4, 1, '/images/rasgulla.jpg', true, false, 'sweet,spongy,light,syrupy,traditional', 'mild', null, 8, true, true, 1.50, 'low'),

-- BEVERAGES - Mid Priority
(9, 'Mango Lassi', 'Refreshing yogurt drink with sweet mango', 8.00, 3, 1, '/images/mango-lassi.jpg', true, false, 'drink,sweet,refreshing,yogurt,fruity', 'mild', 1, 5, true, false, 1.00, 'mid'),
(10, 'Masala Chai', 'Traditional spiced tea with milk and aromatic spices', 5.00, 3, 1, '/images/masala-chai.jpg', true, false, 'drink,hot,spiced,traditional,warming', 'mild', 1, 8, true, false, 0.50, 'mid')
ON CONFLICT (id) DO NOTHING;

-- 🔒 Enable Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- 🌐 Create policies for public access
CREATE POLICY "Allow public read access" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON reservations FOR INSERT WITH CHECK (true);

-- 🔐 Additional policies for order access
CREATE POLICY "Allow public read orders by token" ON orders FOR SELECT USING (order_token IS NOT NULL);
CREATE POLICY "Allow public read order_items" ON order_items FOR SELECT USING (true);

-- 👨‍💼 Admin policies (you may want to restrict these to authenticated admin users)
CREATE POLICY "Allow admin read all orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow admin update orders" ON orders FOR UPDATE USING (true);
