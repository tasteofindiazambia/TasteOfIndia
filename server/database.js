import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    try {
      // Create database connection
      this.db = new sqlite3.Database(path.join(__dirname, '../database/restaurant.db'));
      
      // Enable foreign key constraints
      await this.run('PRAGMA foreign_keys = ON');
      console.log('Foreign key constraints enables')
      
      
      // Create tables if they don't exist
      await this.createTables();
      
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
    }
  }

  async createTables() {
    const schema = `
      -- Restaurants/Locations table
      CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        hours TEXT NOT NULL,
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
        tags TEXT,
        spice_level VARCHAR(20) DEFAULT 'mild',
        pieces_count INTEGER,
        preparation_time INTEGER,
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
        favorite_items TEXT,
        dietary_requirements TEXT,
        birthday DATE,
        anniversary DATE,
        loyalty_points INTEGER DEFAULT 0,
        preferred_contact_method VARCHAR(20) DEFAULT 'whatsapp',
        notes TEXT,
        status VARCHAR(20) DEFAULT 'active',
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
        status VARCHAR(20) DEFAULT 'pending',
        order_type VARCHAR(20) DEFAULT 'dine_in',
        payment_method VARCHAR(20) DEFAULT 'cash',
        special_instructions TEXT,
        estimated_preparation_time INTEGER,
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
        status VARCHAR(20) DEFAULT 'pending',
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

      -- Analytics table
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
    `;

    await this.exec(schema);
    await this.insertSampleData();
  }

  async insertSampleData() {
    // Check if data already exists
    const restaurantCount = await this.get('SELECT COUNT(*) as count FROM restaurants');
    if (restaurantCount.count > 0) return;

    // Insert sample restaurants
    await this.run(`
      INSERT INTO restaurants (id, name, address, phone, email, hours) VALUES
      (1, 'Taste of India - Manda Hill', 'Manda Hill Shopping Centre, Lusaka', '+260 97 123 4567', 'manda@tasteofindia.co.zm', '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "11:00-21:00"}'),
      (2, 'Taste of India - Parirenyetwa', 'Parirenyetwa Rd, Lusaka 10101, Zambia', '+260 77 3219999', 'parirenyetwa@tasteofindia.co.zm', '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "11:00-21:00"}')
    `);

    // Insert sample categories
    await this.run(`
      INSERT INTO categories (id, name, description, restaurant_id, display_order) VALUES
      (1, 'Appetizers', 'Start your meal with our delicious appetizers', 1, 1),
      (2, 'Main Courses', 'Hearty main dishes to satisfy your hunger', 1, 2),
      (3, 'Beverages', 'Refreshing drinks to complement your meal', 1, 3),
      (4, 'Desserts', 'Sweet endings to your dining experience', 1, 4),
      (5, 'Appetizers', 'Start your meal with our delicious appetizers', 2, 1),
      (6, 'Main Courses', 'Hearty main dishes to satisfy your hunger', 2, 2),
      (7, 'Beverages', 'Refreshing drinks to complement your meal', 2, 3),
      (8, 'Desserts', 'Sweet endings to your dining experience', 2, 4)
    `);

    // Insert sample menu items
    await this.run(`
      INSERT INTO menu_items (id, name, description, price, category_id, restaurant_id, image_url, available, featured, tags, spice_level, pieces_count, preparation_time, is_vegetarian) VALUES
      (1, 'Samosas', 'Crispy triangular pastries filled with spiced potatoes and peas', 8.00, 1, 1, '/images/samosas.jpg', 1, 1, '["popular", "vegetarian", "fried"]', 'mild', 2, 15, 1),
      (2, 'Chicken Biryani', 'Fragrant basmati rice cooked with tender chicken and aromatic spices', 25.00, 2, 1, '/images/chicken-biryani.jpg', 1, 1, '["popular", "rice", "chicken"]', 'medium', 1, 25, 0),
      (3, 'Butter Chicken', 'Tender chicken in a rich tomato and cream sauce', 22.00, 2, 1, '/images/butter-chicken.jpg', 1, 1, '["popular", "chicken", "creamy"]', 'mild', 1, 20, 0),
      (4, 'Mango Lassi', 'Refreshing yogurt drink with sweet mango', 6.00, 3, 1, '/images/mango-lassi.jpg', 1, 0, '["drink", "sweet", "refreshing"]', 'mild', 1, 5, 1),
      (5, 'Gulab Jamun', 'Soft milk dumplings in rose-flavored syrup', 8.00, 4, 1, '/images/gulab-jamun.jpg', 1, 0, '["dessert", "sweet", "traditional"]', 'mild', 3, 10, 1)
    `);

    console.log('✅ Sample data inserted successfully');
  }

  // Promisify database methods
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default new Database();
