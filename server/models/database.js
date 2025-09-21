import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    try {
      // Create database connection with proper path
      const dbPath = path.join(__dirname, '../../database/restaurant.db');
      this.db = new sqlite3.Database(dbPath);
      
      // Enable foreign key constraints and WAL mode for better performance
      await this.run('PRAGMA foreign_keys = ON');
      await this.run('PRAGMA journal_mode = WAL');
      await this.run('PRAGMA synchronous = NORMAL');
      await this.run('PRAGMA cache_size = 1000');
      
      // Create tables with proper schema
      await this.createTables();
      
      // Insert initial data if needed
      await this.insertInitialData();
      
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    // Drop tables in reverse dependency order if they exist (for clean restart)
    const dropQueries = [
      'DROP TABLE IF EXISTS order_items',
      'DROP TABLE IF EXISTS orders', 
      'DROP TABLE IF EXISTS reservations',
      'DROP TABLE IF EXISTS menu_items',
      'DROP TABLE IF EXISTS categories',
      'DROP TABLE IF EXISTS customers',
      'DROP TABLE IF EXISTS admin_users',
      'DROP TABLE IF EXISTS restaurants'
    ];

    for (const query of dropQueries) {
      await this.run(query);
    }

    // Create tables with consistent, proper schema
    const createQueries = [
      // Restaurants table
      `CREATE TABLE restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        hours TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        delivery_fee_per_km DECIMAL(10,2) DEFAULT 10.00,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        max_delivery_radius_km INTEGER DEFAULT 15,
        min_delivery_order DECIMAL(10,2) DEFAULT 25.00,
        delivery_time_minutes INTEGER DEFAULT 30,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Categories table
      `CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        restaurant_id INTEGER NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )`,

      // Menu items table - COMPREHENSIVE SCHEMA
      `CREATE TABLE menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER NOT NULL,
        restaurant_id INTEGER NOT NULL,
        image_url VARCHAR(500),
        available BOOLEAN DEFAULT 1,
        featured BOOLEAN DEFAULT 0,
        tags TEXT, -- Comma-separated tags
        spice_level VARCHAR(20) DEFAULT 'mild',
        pieces_count INTEGER,
        preparation_time INTEGER DEFAULT 15, -- in minutes
        is_vegetarian BOOLEAN DEFAULT 0,
        is_vegan BOOLEAN DEFAULT 0,
        is_gluten_free BOOLEAN DEFAULT 0,
        dynamic_pricing BOOLEAN DEFAULT 0, -- For per-gram pricing on sweets
        packaging_price DECIMAL(10,2) DEFAULT 0,
        listing_preference VARCHAR(10) DEFAULT 'mid', -- high, mid, low
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )`,

      // Customers table
      `CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        total_orders INTEGER DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0.00,
        average_order_value DECIMAL(10,2) DEFAULT 0.00,
        last_order_date DATETIME,
        loyalty_points INTEGER DEFAULT 0,
        preferred_contact_method VARCHAR(20) DEFAULT 'whatsapp',
        notes TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(phone),
        UNIQUE(email)
      )`,

      // Orders table - COMPREHENSIVE SCHEMA
      `CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        order_token VARCHAR(64) UNIQUE, -- Secure token for customer access
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(100),
        restaurant_id INTEGER NOT NULL,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )`,

      // Order items table
      `CREATE TABLE order_items (
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
      )`,

      // Reservations table - UNIFIED SCHEMA
      `CREATE TABLE reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_number VARCHAR(20) UNIQUE NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(100),
        restaurant_id INTEGER NOT NULL,
        date_time DATETIME NOT NULL,
        party_size INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        table_preference VARCHAR(100),
        dietary_requirements TEXT,
        special_requests TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )`,

      // Admin users table - with proper password hashing
      `CREATE TABLE admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        role VARCHAR(20) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT 1,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    // Execute all create queries
    for (const query of createQueries) {
      await this.run(query);
    }

    // Create indexes for better performance
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available)',
      'CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_reservations_restaurant ON reservations(restaurant_id)',
      'CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date_time)',
      'CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)',
      'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)',
      'CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)'
    ];

    for (const query of indexQueries) {
      await this.run(query);
    }
  }

  async insertInitialData() {
    // Check if data already exists
    const restaurantCount = await this.get('SELECT COUNT(*) as count FROM restaurants');
    if (restaurantCount && restaurantCount.count > 0) {
      console.log('Initial data already exists, skipping...');
      return;
    }

    console.log('Inserting initial data...');

    // Insert sample restaurants
    const restaurants = [
      {
        name: 'Taste of India - Manda Hill',
        address: 'Manda Hill Shopping Centre, Lusaka',
        phone: '+260 97 123 4567',
        email: 'manda@tasteofindia.co.zm',
        hours: JSON.stringify({
          monday: '11:00-22:00',
          tuesday: '11:00-22:00', 
          wednesday: '11:00-22:00',
          thursday: '11:00-22:00',
          friday: '11:00-23:00',
          saturday: '11:00-23:00',
          sunday: '11:00-21:00'
        }),
        delivery_fee_per_km: 10.00,
        latitude: -15.3875, // Manda Hill Mall coordinates
        longitude: 28.3228,
        max_delivery_radius_km: 15,
        min_delivery_order: 25.00,
        delivery_time_minutes: 30
      },
      {
        name: 'Taste of India - Parirenyetwa',
        address: 'Parirenyetwa Rd, Lusaka 10101, Zambia',
        phone: '+260 77 3219999',
        email: 'parirenyetwa@tasteofindia.co.zm',
        hours: JSON.stringify({
          monday: '11:00-22:00',
          tuesday: '11:00-22:00',
          wednesday: '11:00-22:00',
          thursday: '11:00-22:00',
          friday: '11:00-23:00',
          saturday: '11:00-23:00',
          sunday: '11:00-21:00'
        }),
        delivery_fee_per_km: 12.00,
        latitude: -15.4067, // Parirenyetwa area coordinates
        longitude: 28.2833,
        max_delivery_radius_km: 12,
        min_delivery_order: 20.00,
        delivery_time_minutes: 25
      }
    ];

    for (const restaurant of restaurants) {
      await this.run(
        `INSERT INTO restaurants (
          name, address, phone, email, hours, 
          delivery_fee_per_km, latitude, longitude, 
          max_delivery_radius_km, min_delivery_order, delivery_time_minutes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          restaurant.name, restaurant.address, restaurant.phone, restaurant.email, restaurant.hours,
          restaurant.delivery_fee_per_km, restaurant.latitude, restaurant.longitude,
          restaurant.max_delivery_radius_km, restaurant.min_delivery_order, restaurant.delivery_time_minutes
        ]
      );
    }

    // Insert categories for both restaurants
    const categories = [
      { name: 'Appetizers', description: 'Start your meal with our delicious appetizers', restaurant_id: 1, display_order: 1 },
      { name: 'Main Courses', description: 'Hearty main dishes to satisfy your hunger', restaurant_id: 1, display_order: 2 },
      { name: 'Beverages', description: 'Refreshing drinks to complement your meal', restaurant_id: 1, display_order: 3 },
      { name: 'Desserts', description: 'Sweet endings to your dining experience', restaurant_id: 1, display_order: 4 },
      { name: 'Appetizers', description: 'Start your meal with our delicious appetizers', restaurant_id: 2, display_order: 1 },
      { name: 'Main Courses', description: 'Hearty main dishes to satisfy your hunger', restaurant_id: 2, display_order: 2 },
      { name: 'Beverages', description: 'Refreshing drinks to complement your meal', restaurant_id: 2, display_order: 3 },
      { name: 'Desserts', description: 'Sweet endings to your dining experience', restaurant_id: 2, display_order: 4 }
    ];

    for (const category of categories) {
      await this.run(
        'INSERT INTO categories (name, description, restaurant_id, display_order) VALUES (?, ?, ?, ?)',
        [category.name, category.description, category.restaurant_id, category.display_order]
      );
    }

    // Insert comprehensive sample menu items
    const menuItems = [
      // APPETIZERS - High Priority
      {
        name: 'Samosas',
        description: 'Crispy triangular pastries filled with spiced potatoes and peas',
        price: 8.00,
        category_id: 1,
        restaurant_id: 1,
        image_url: '/images/samosas.jpg',
        available: 1,
        featured: 1,
        tags: 'popular,vegetarian,fried,crunchy,sharable',
        spice_level: 'mild',
        pieces_count: 2,
        preparation_time: 15,
        is_vegetarian: 1,
        dynamic_pricing: 0,
        packaging_price: 2.00,
        listing_preference: 'high'
      },
      {
        name: 'Chicken Tikka',
        description: 'Tender marinated chicken pieces grilled to perfection',
        price: 18.00,
        category_id: 1,
        restaurant_id: 1,
        image_url: '/images/chicken-tikka.jpg',
        available: 1,
        featured: 1,
        tags: 'popular,chicken,grilled,protein,spicy',
        spice_level: 'medium',
        pieces_count: 6,
        preparation_time: 20,
        is_vegetarian: 0,
        dynamic_pricing: 0,
        packaging_price: 2.50,
        listing_preference: 'high'
      },

      // MAIN COURSES - High Priority
      {
        name: 'Chicken Biryani',
        description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices',
        price: 25.00,
        category_id: 2,
        restaurant_id: 1,
        image_url: '/images/chicken-biryani.jpg',
        available: 1,
        featured: 1,
        tags: 'popular,rice,chicken,aromatic,filling',
        spice_level: 'medium',
        pieces_count: 1,
        preparation_time: 25,
        is_vegetarian: 0,
        dynamic_pricing: 0,
        packaging_price: 3.00,
        listing_preference: 'high'
      },
      {
        name: 'Butter Chicken',
        description: 'Tender chicken in a rich tomato and cream sauce',
        price: 22.00,
        category_id: 2,
        restaurant_id: 1,
        image_url: '/images/butter-chicken.jpg',
        available: 1,
        featured: 1,
        tags: 'popular,chicken,creamy,rich,comfort',
        spice_level: 'mild',
        pieces_count: 1,
        preparation_time: 20,
        is_vegetarian: 0,
        dynamic_pricing: 0,
        packaging_price: 2.50,
        listing_preference: 'high'
      },
      {
        name: 'Dal Makhani',
        description: 'Creamy black lentils slow-cooked with butter and spices',
        price: 16.00,
        category_id: 2,
        restaurant_id: 1,
        image_url: '/images/dal-makhani.jpg',
        available: 1,
        featured: 0,
        tags: 'vegetarian,creamy,protein,comfort,healthy',
        spice_level: 'mild',
        pieces_count: 1,
        preparation_time: 30,
        is_vegetarian: 1,
        dynamic_pricing: 0,
        packaging_price: 2.00,
        listing_preference: 'mid'
      },

      // SWEETS - Dynamic Pricing
      {
        name: 'Gulab Jamun',
        description: 'Soft milk dumplings soaked in rose-flavored syrup',
        price: 2.50, // per piece
        category_id: 4,
        restaurant_id: 1,
        image_url: '/images/gulab-jamun.jpg',
        available: 1,
        featured: 0,
        tags: 'sweet,soft,syrupy,traditional,dessert',
        spice_level: 'mild',
        pieces_count: null, // User selects quantity
        preparation_time: 10,
        is_vegetarian: 1,
        dynamic_pricing: 0, // Per piece pricing
        packaging_price: 1.50,
        listing_preference: 'mid'
      },
      {
        name: 'Kaju Katli',
        description: 'Premium cashew fudge with silver leaf',
        price: 0.80, // per gram
        category_id: 4,
        restaurant_id: 1,
        image_url: '/images/kaju-katli.jpg',
        available: 1,
        featured: 0,
        tags: 'sweet,premium,cashew,rich,traditional',
        spice_level: 'mild',
        pieces_count: null, // Weight-based
        preparation_time: 5,
        is_vegetarian: 1,
        dynamic_pricing: 1, // Per gram pricing
        packaging_price: 2.00,
        listing_preference: 'low'
      },
      {
        name: 'Rasgulla',
        description: 'Spongy cottage cheese balls in sugar syrup',
        price: 0.60, // per gram  
        category_id: 4,
        restaurant_id: 1,
        image_url: '/images/rasgulla.jpg',
        available: 1,
        featured: 0,
        tags: 'sweet,spongy,light,syrupy,traditional',
        spice_level: 'mild',
        pieces_count: null,
        preparation_time: 8,
        is_vegetarian: 1,
        dynamic_pricing: 1, // Per gram pricing
        packaging_price: 1.50,
        listing_preference: 'low'
      },

      // BEVERAGES - Mid Priority
      {
        name: 'Mango Lassi',
        description: 'Refreshing yogurt drink with sweet mango',
        price: 6.00,
        category_id: 3,
        restaurant_id: 1,
        image_url: '/images/mango-lassi.jpg',
        available: 1,
        featured: 0,
        tags: 'drink,sweet,refreshing,mango,creamy',
        spice_level: 'mild',
        pieces_count: 1,
        preparation_time: 5,
        is_vegetarian: 1,
        dynamic_pricing: 0,
        packaging_price: 1.00,
        listing_preference: 'mid'
      },
      {
        name: 'Masala Chai',
        description: 'Traditional spiced tea with milk and aromatic spices',
        price: 4.00,
        category_id: 3,
        restaurant_id: 1,
        image_url: '/images/masala-chai.jpg',
        available: 1,
        featured: 0,
        tags: 'drink,hot,spiced,traditional,warming',
        spice_level: 'mild',
        pieces_count: 1,
        preparation_time: 8,
        is_vegetarian: 1,
        dynamic_pricing: 0,
        packaging_price: 0.50,
        listing_preference: 'mid'
      }
    ];

    for (const item of menuItems) {
      await this.run(`
        INSERT INTO menu_items (
          name, description, price, category_id, restaurant_id, image_url,
          available, featured, tags, spice_level, pieces_count, preparation_time,
          is_vegetarian, dynamic_pricing, packaging_price, listing_preference
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.name, item.description, item.price, item.category_id, item.restaurant_id,
        item.image_url, item.available, item.featured, item.tags, item.spice_level,
        item.pieces_count, item.preparation_time, item.is_vegetarian, 
        item.dynamic_pricing, item.packaging_price, item.listing_preference
      ]);
    }

    // Create default admin user with hashed password
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    await this.run(
      'INSERT INTO admin_users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
      ['admin', hashedPassword, 'admin@tasteofindia.co.zm', 'admin']
    );

    console.log('✅ Initial data inserted successfully');
    console.log('📧 Default admin credentials: admin / admin123');
  }

  // Promisified database methods
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Database run error:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Database get error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database all error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Transaction support
  async transaction(queries) {
    await this.run('BEGIN TRANSACTION');
    try {
      const results = [];
      for (const { sql, params } of queries) {
        const result = await this.run(sql, params);
        results.push(result);
      }
      await this.run('COMMIT');
      return results;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  // Graceful shutdown
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

// Export singleton instance
export default new Database();