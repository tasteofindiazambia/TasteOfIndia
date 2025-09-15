import '@testing-library/jest-dom';
import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// Test configuration
export const TEST_CONFIG = {
  API_BASE_URL: 'http://localhost:3001',
  DB_PATH: './database/test-restaurant.db',
  FRONTEND_URL: 'http://localhost:3000'
};

// Mock fetch for tests
global.fetch = jest.fn();

// Database setup for testing
let testDb;

beforeAll(async () => {
  // Create test database
  testDb = new sqlite3.Database(TEST_CONFIG.DB_PATH);
  
  // Initialize test data
  await initializeTestData();
});

afterAll(async () => {
  // Cleanup test database
  if (testDb) {
    await promisify(testDb.close.bind(testDb))();
  }
});

beforeEach(() => {
  // Reset fetch mock before each test
  fetch.mockClear();
});

// Helper function to initialize test data
async function initializeTestData() {
  const run = promisify(testDb.run.bind(testDb));
  
  try {
    // Create test tables
    await run(`
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
      )
    `);

    await run(`
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
      )
    `);

    await run(`
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
      )
    `);

    await run(`
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
      )
    `);

    await run(`
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
      )
    `);

    await run(`
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
      )
    `);

    // Insert test data
    await run(`
      INSERT OR IGNORE INTO restaurants (id, name, address, phone, email, hours) VALUES
      (1, 'Test Restaurant - Manda Hill', 'Test Address, Lusaka', '+260 97 123 4567', 'test@tasteofindia.co.zm', '{"monday": "11:00-22:00"}')
    `);

    await run(`
      INSERT OR IGNORE INTO categories (id, name, description, restaurant_id, display_order) VALUES
      (1, 'Test Appetizers', 'Test appetizers category', 1, 1),
      (2, 'Test Main Courses', 'Test main courses category', 1, 2)
    `);

    await run(`
      INSERT OR IGNORE INTO menu_items (id, name, description, price, category_id, restaurant_id, available, featured) VALUES
      (1, 'Test Samosa', 'Test samosa description', 8.00, 1, 1, 1, 1),
      (2, 'Test Biryani', 'Test biryani description', 25.00, 2, 1, 1, 1)
    `);

    console.log('✅ Test database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing test database:', error);
  }
}

// Export test utilities
export { testDb };
