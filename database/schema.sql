-- Taste of India Restaurant Database Schema
-- Complete database structure for full-stack integration

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Restaurants/Locations table
CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    hours TEXT NOT NULL, -- JSON format for operating hours
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    restaurant_id INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    image_url VARCHAR(500),
    available BOOLEAN DEFAULT 1,
    featured BOOLEAN DEFAULT 0,
    tags TEXT, -- JSON array of tags
    spice_level VARCHAR(20) DEFAULT 'mild', -- mild, medium, hot, extra_hot
    pieces_count INTEGER,
    preparation_time INTEGER, -- in minutes
    is_vegetarian BOOLEAN DEFAULT 0,
    is_vegan BOOLEAN DEFAULT 0,
    is_gluten_free BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    location VARCHAR(100),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    last_order_date DATETIME,
    favorite_items TEXT, -- JSON array
    dietary_requirements TEXT, -- JSON array
    birthday DATE,
    anniversary DATE,
    loyalty_points INTEGER DEFAULT 0,
    preferred_contact_method VARCHAR(20) DEFAULT 'whatsapp',
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, vip
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    restaurant_id INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, preparing, ready, completed, cancelled
    order_type VARCHAR(20) DEFAULT 'dine_in', -- dine_in, takeaway, delivery
    payment_method VARCHAR(20) DEFAULT 'cash', -- cash, card, mobile_money
    special_instructions TEXT,
    estimated_preparation_time INTEGER, -- in minutes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    restaurant_id INTEGER NOT NULL,
    date_time DATETIME NOT NULL,
    party_size INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, completed, no_show
    occasion VARCHAR(100),
    table_preference VARCHAR(100),
    dietary_requirements TEXT,
    confirmation_method VARCHAR(20) DEFAULT 'whatsapp',
    special_requests TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Analytics table for tracking
CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    restaurant_id INTEGER NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    total_reservations INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    peak_hour VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Insert sample data
INSERT OR IGNORE INTO restaurants (id, name, address, phone, email, hours) VALUES
(1, 'Taste of India - Manda Hill', 'Manda Hill Shopping Centre, Lusaka', '+260 97 123 4567', 'manda@tasteofindia.co.zm', '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "11:00-21:00"}'),
(2, 'Taste of India - Parirenyetwa', 'Parirenyetwa Rd, Lusaka 10101, Zambia', '+260 77 3219999', 'parirenyetwa@tasteofindia.co.zm', '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "11:00-21:00"}');

INSERT OR IGNORE INTO categories (id, name, description, restaurant_id, display_order) VALUES
(1, 'Appetizers', 'Start your meal with our delicious appetizers', 1, 1),
(2, 'Main Courses', 'Hearty main dishes to satisfy your hunger', 1, 2),
(3, 'Beverages', 'Refreshing drinks to complement your meal', 1, 3),
(4, 'Desserts', 'Sweet endings to your dining experience', 1, 4),
(5, 'Appetizers', 'Start your meal with our delicious appetizers', 2, 1),
(6, 'Main Courses', 'Hearty main dishes to satisfy your hunger', 2, 2),
(7, 'Beverages', 'Refreshing drinks to complement your meal', 2, 3),
(8, 'Desserts', 'Sweet endings to your dining experience', 2, 4);

INSERT OR IGNORE INTO menu_items (id, name, description, price, category_id, restaurant_id, image_url, available, featured, tags, spice_level, pieces_count, preparation_time, is_vegetarian) VALUES
(1, 'Samosas', 'Crispy triangular pastries filled with spiced potatoes and peas', 8.00, 1, 1, '/images/samosas.jpg', 1, 1, '["popular", "vegetarian", "fried"]', 'mild', 2, 15, 1),
(2, 'Chicken Biryani', 'Fragrant basmati rice cooked with tender chicken and aromatic spices', 25.00, 2, 1, '/images/chicken-biryani.jpg', 1, 1, '["popular", "rice", "chicken"]', 'medium', 1, 25, 0),
(3, 'Butter Chicken', 'Tender chicken in a rich tomato and cream sauce', 22.00, 2, 1, '/images/butter-chicken.jpg', 1, 1, '["popular", "chicken", "creamy"]', 'mild', 1, 20, 0),
(4, 'Mango Lassi', 'Refreshing yogurt drink with sweet mango', 6.00, 3, 1, '/images/mango-lassi.jpg', 1, 0, '["drink", "sweet", "refreshing"]', 'mild', 1, 5, 1),
(5, 'Gulab Jamun', 'Soft milk dumplings in rose-flavored syrup', 8.00, 4, 1, '/images/gulab-jamun.jpg', 1, 0, '["dessert", "sweet", "traditional"]', 'mild', 3, 10, 1);

-- Insert sample customers
INSERT OR IGNORE INTO customers (id, name, phone, email, location, total_orders, total_spent, average_order_value, last_order_date, favorite_items, dietary_requirements, birthday, loyalty_points, preferred_contact_method, notes, status) VALUES
(1, 'John Mwamba', '+260 97 123 4567', 'john.mwamba@email.com', 'Manda Hill', 15, 450.00, 30.00, '2024-01-15 19:30:00', '["Chicken Biryani", "Samosas", "Mango Lassi"]', '["No nuts"]', '1985-03-15', 1250, 'whatsapp', 'Prefers spicy food, regular customer', 'vip'),
(2, 'Sarah Chisenga', '+260 96 234 5678', 'sarah.chisenga@email.com', 'Parirenyetwa', 8, 180.00, 22.50, '2024-01-10 18:45:00', '["Butter Chicken", "Naan Bread"]', '["Vegetarian"]', '1990-07-22', 450, 'email', 'Vegetarian customer, likes mild spices', 'active'),
(3, 'Michael Banda', '+260 95 345 6789', 'michael.banda@email.com', 'Manda Hill', 3, 75.00, 25.00, '2023-12-20 20:15:00', '["Chicken Biryani"]', '[]', NULL, 150, 'sms', 'New customer, interested in family meals', 'active');

-- Insert sample orders
INSERT OR IGNORE INTO orders (id, order_number, customer_name, customer_phone, customer_email, restaurant_id, total_amount, status, order_type, payment_method, special_instructions, estimated_preparation_time, created_at) VALUES
(1, 'ORD-2024-001', 'John Mwamba', '+260 97 123 4567', 'john.mwamba@email.com', 1, 33.00, 'completed', 'dine_in', 'cash', 'Extra spicy please', 25, '2024-01-15 19:30:00'),
(2, 'ORD-2024-002', 'Sarah Chisenga', '+260 96 234 5678', 'sarah.chisenga@email.com', 2, 28.00, 'completed', 'takeaway', 'card', 'No onions', 20, '2024-01-10 18:45:00'),
(3, 'ORD-2024-003', 'Michael Banda', '+260 95 345 6789', 'michael.banda@email.com', 1, 25.00, 'preparing', 'dine_in', 'mobile_money', NULL, 25, '2024-01-20 20:15:00');

-- Insert sample order items
INSERT OR IGNORE INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, special_instructions) VALUES
(1, 1, 1, 1, 8.00, 8.00, 'Extra spicy'),
(2, 1, 2, 1, 25.00, 25.00, 'Extra spicy'),
(3, 2, 3, 1, 22.00, 22.00, 'No onions'),
(4, 2, 4, 1, 6.00, 6.00, NULL),
(5, 3, 2, 1, 25.00, 25.00, NULL);

-- Insert sample reservations
INSERT OR IGNORE INTO reservations (id, reservation_number, customer_name, customer_phone, customer_email, restaurant_id, date_time, party_size, status, occasion, table_preference, dietary_requirements, confirmation_method, special_requests, notes) VALUES
(1, 'RES-2024-001', 'John Mwamba', '+260 97 123 4567', 'john.mwamba@email.com', 1, '2024-01-25 19:00:00', 4, 'confirmed', 'Birthday', 'Window Table', 'No nuts', 'whatsapp', 'Birthday celebration', 'VIP customer'),
(2, 'RES-2024-002', 'Sarah Chisenga', '+260 96 234 5678', 'sarah.chisenga@email.com', 2, '2024-01-26 18:30:00', 2, 'pending', 'Date Night', 'Booth', 'Vegetarian', 'email', 'Anniversary dinner', 'Vegetarian customer'),
(3, 'RES-2024-003', 'Michael Banda', '+260 95 345 6789', 'michael.banda@email.com', 1, '2024-01-27 20:00:00', 6, 'confirmed', 'Family Gathering', 'Private Dining', NULL, 'sms', 'Family dinner', 'New customer');

-- Insert sample analytics
INSERT OR IGNORE INTO analytics (id, date, restaurant_id, total_orders, total_revenue, total_reservations, average_order_value, peak_hour) VALUES
(1, '2024-01-15', 1, 5, 125.00, 3, 25.00, '19:00'),
(2, '2024-01-16', 1, 8, 200.00, 4, 25.00, '20:00'),
(3, '2024-01-17', 1, 6, 150.00, 2, 25.00, '19:30'),
(4, '2024-01-15', 2, 3, 75.00, 2, 25.00, '18:30'),
(5, '2024-01-16', 2, 7, 175.00, 3, 25.00, '19:00'),
(6, '2024-01-17', 2, 4, 100.00, 1, 25.00, '20:00');
