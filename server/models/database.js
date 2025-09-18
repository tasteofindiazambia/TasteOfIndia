import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
  constructor() {
    this.db = new sqlite3.Database('./restaurant.db');
    this.initializeTables();
  }

  initializeTables() {
    this.db.serialize(() => {
      // Restaurants table
      this.db.run(`CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        hours TEXT NOT NULL,
        image TEXT
      )`);

      // Categories table
      this.db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        restaurant_id INTEGER,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
      )`);

      // Menu items table
      this.db.run(`CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id TEXT UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_url TEXT,
        image_prompt TEXT,
        category_id INTEGER,
        item_family TEXT,
        tags TEXT,
        availability_status BOOLEAN DEFAULT 1,
        preparation_time INTEGER,
        restaurant_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
      )`);

      // Orders table
      this.db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        items TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'received',
        restaurant_id INTEGER,
        special_instructions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
      )`);

      // Reservations table
      this.db.run(`CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        party_size INTEGER NOT NULL,
        special_requests TEXT,
        status TEXT DEFAULT 'pending',
        restaurant_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
      )`);

      // Admin users table
      this.db.run(`CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Customers table
      this.db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        source TEXT NOT NULL CHECK (source IN ('order', 'contact_form', 'whatsapp')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Blogs table
      this.db.run(`CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        image_url TEXT,
        author TEXT NOT NULL,
        published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_time INTEGER DEFAULT 5,
        category TEXT NOT NULL,
        tags TEXT,
        likes INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'published'
      )`);

      // Events table
      this.db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT NOT NULL,
        location_id INTEGER,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        duration INTEGER DEFAULT 2,
        price REAL DEFAULT 0,
        max_attendees INTEGER DEFAULT 50,
        current_attendees INTEGER DEFAULT 0,
        image_url TEXT,
        category TEXT NOT NULL,
        featured BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'upcoming',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES restaurants (id)
      )`);

      // Website branding table
      this.db.run(`CREATE TABLE IF NOT EXISTS website_branding (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        logo_url TEXT,
        primary_color TEXT DEFAULT '#f97316',
        secondary_color TEXT DEFAULT '#ea580c',
        tertiary_color TEXT DEFAULT '#dc2626',
        primary_font TEXT DEFAULT 'Inter',
        secondary_font TEXT DEFAULT 'Poppins',
        tertiary_font TEXT DEFAULT 'Roboto',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Insert sample data if tables are empty
      this.insertSampleData();
    });
  }

  insertSampleData() {
    // Check if data already exists
    this.db.get("SELECT COUNT(*) as count FROM restaurants", (err, row) => {
      if (err) {
        console.error('Error checking restaurants:', err);
        return;
      }

      if (row.count === 0) {
        console.log('Inserting sample data...');
        
        // Insert sample restaurants
        const restaurants = [
          {
            name: 'Taste of India - Lusaka',
            address: '123 Independence Avenue, Lusaka, Zambia',
            phone: '+260 211 123456',
            hours: 'Mon-Sun: 10:00 AM - 10:00 PM',
            image: '/api/placeholder/400/300'
          },
          {
            name: 'Taste of India - Manda Hill',
            address: 'Manda Hill Shopping Centre, Lusaka, Zambia',
            phone: '+260 211 789012',
            hours: 'Mon-Sun: 10:00 AM - 10:00 PM',
            image: '/api/placeholder/400/300'
          }
        ];

        const restaurantStmt = this.db.prepare("INSERT INTO restaurants (name, address, phone, hours, image) VALUES (?, ?, ?, ?, ?)");
        restaurants.forEach(restaurant => {
          restaurantStmt.run([restaurant.name, restaurant.address, restaurant.phone, restaurant.hours, restaurant.image]);
        });
        restaurantStmt.finalize();

        // Insert sample categories
        const categories = [
          { name: 'drinks', description: 'Refreshing beverages', restaurant_id: 1 },
          { name: 'appetizers', description: 'Start your meal right', restaurant_id: 1 },
          { name: 'main course', description: 'Hearty main dishes', restaurant_id: 1 },
          { name: 'desserts', description: 'Sweet endings', restaurant_id: 1 },
          { name: 'drinks', description: 'Refreshing beverages', restaurant_id: 2 },
          { name: 'appetizers', description: 'Start your meal right', restaurant_id: 2 },
          { name: 'main course', description: 'Hearty main dishes', restaurant_id: 2 },
          { name: 'desserts', description: 'Sweet endings', restaurant_id: 2 }
        ];

        const categoryStmt = this.db.prepare("INSERT INTO categories (name, description, restaurant_id) VALUES (?, ?, ?)");
        categories.forEach(category => {
          categoryStmt.run([category.name, category.description, category.restaurant_id]);
        });
        categoryStmt.finalize();

        // Insert sample menu items
        const menuItems = [
          // Restaurant 1 (Lusaka) items
          { name: 'Americano', description: 'Bold and strong coffee, similar to a black coffee but with a richer flavor.', price: 50, category_id: 1, restaurant_id: 1, availability_status: 1 },
          { name: 'Cappuccino', description: '', price: 60, category_id: 1, restaurant_id: 1, availability_status: 1 },
          { name: 'Apple Juice', description: 'Crisp and sweet apple juice, a classic choice.', price: 70, category_id: 1, restaurant_id: 1, availability_status: 1 },
          { name: 'Samosa', description: 'Crispy pastry filled with spiced potatoes and peas.', price: 25, category_id: 2, restaurant_id: 1, availability_status: 1 },
          { name: 'Butter Chicken', description: 'Tender chicken in a rich, creamy tomato sauce.', price: 180, category_id: 3, restaurant_id: 1, availability_status: 1 },
          { name: 'Biryani', description: 'Fragrant basmati rice with tender meat and aromatic spices.', price: 200, category_id: 3, restaurant_id: 1, availability_status: 1 },
          { name: 'Gulab Jamun', description: 'Soft, sweet dumplings in rose-flavored syrup.', price: 80, category_id: 4, restaurant_id: 1, availability_status: 1 },
          
          // Restaurant 2 (Manda Hill) items
          { name: 'Masala Chai', description: 'Spiced tea with milk, a perfect blend of flavors.', price: 40, category_id: 5, restaurant_id: 2, availability_status: 1 },
          { name: 'Mango Lassi', description: 'Creamy yogurt drink with sweet mango.', price: 60, category_id: 5, restaurant_id: 2, availability_status: 1 },
          { name: 'Paneer Tikka', description: 'Grilled cottage cheese with aromatic spices.', price: 120, category_id: 6, restaurant_id: 2, availability_status: 1 },
          { name: 'Dal Makhani', description: 'Creamy black lentils cooked with butter and cream.', price: 150, category_id: 7, restaurant_id: 2, availability_status: 1 },
          { name: 'Ras Malai', description: 'Soft cheese dumplings in sweetened milk.', price: 90, category_id: 8, restaurant_id: 2, availability_status: 1 }
        ];

        const menuStmt = this.db.prepare("INSERT INTO menu_items (name, description, price, category_id, restaurant_id, availability_status) VALUES (?, ?, ?, ?, ?, ?)");
        menuItems.forEach(item => {
          menuStmt.run([item.name, item.description, item.price, item.category_id, item.restaurant_id, item.availability_status]);
        });
        menuStmt.finalize();

        // Insert admin user
        this.db.run("INSERT INTO admin_users (username, password) VALUES (?, ?)", ['admin', 'admin123']);

        // Insert sample blogs
        const blogs = [
          {
            title: 'Authentic Butter Chicken Recipe',
            description: 'Learn to make the perfect butter chicken with our step-by-step guide. This creamy, flavorful dish is a favorite in Indian cuisine.',
            content: 'Butter chicken, also known as murgh makhani, is a popular Indian dish that originated in Delhi. This recipe combines tender chicken pieces in a rich, creamy tomato-based sauce...',
            image_url: '/api/placeholder/400/300',
            author: 'Chef Rajesh Kumar',
            read_time: 15,
            category: 'Main Course',
            tags: 'chicken,butter,indian,curry',
            likes: 124,
            featured: 1
          },
          {
            title: 'Perfect Basmati Rice Every Time',
            description: 'Master the art of cooking fluffy, aromatic basmati rice with our foolproof method.',
            content: 'Basmati rice is known for its long grains and aromatic fragrance. Here\'s how to cook it perfectly every time...',
            image_url: '/api/placeholder/400/300',
            author: 'Chef Priya Sharma',
            read_time: 8,
            category: 'Side Dish',
            tags: 'rice,basmati,indian,side',
            likes: 89,
            featured: 0
          }
        ];

        const blogStmt = this.db.prepare("INSERT INTO blogs (title, description, content, image_url, author, read_time, category, tags, likes, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        blogs.forEach(blog => {
          blogStmt.run([blog.title, blog.description, blog.content, blog.image_url, blog.author, blog.read_time, blog.category, blog.tags, blog.likes, blog.featured]);
        });
        blogStmt.finalize();

        // Insert sample events
        const events = [
          {
            title: 'Indian Cooking Masterclass',
            description: 'Join our expert chefs for a hands-on cooking class featuring traditional Indian dishes. Learn the secrets of authentic Indian cuisine.',
            location: 'Taste of India - Lusaka',
            location_id: 1,
            date: '2025-02-15',
            time: '10:00',
            duration: 3,
            price: 50,
            max_attendees: 20,
            current_attendees: 15,
            image_url: '/api/placeholder/400/300',
            category: 'Cooking Class',
            featured: 1
          },
          {
            title: 'Spice Tasting Experience',
            description: 'Discover the world of Indian spices with our guided tasting session. Learn about different spices and their uses in Indian cooking.',
            location: 'Taste of India - Manda Hill',
            location_id: 2,
            date: '2025-02-20',
            time: '14:00',
            duration: 2,
            price: 25,
            max_attendees: 15,
            current_attendees: 8,
            image_url: '/api/placeholder/400/300',
            category: 'Tasting',
            featured: 1
          }
        ];

        const eventStmt = this.db.prepare("INSERT INTO events (title, description, location, location_id, date, time, duration, price, max_attendees, current_attendees, image_url, category, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        events.forEach(event => {
          eventStmt.run([event.title, event.description, event.location, event.location_id, event.date, event.time, event.duration, event.price, event.max_attendees, event.current_attendees, event.image_url, event.category, event.featured]);
        });
        eventStmt.finalize();

        // Insert default branding
        this.db.run("INSERT INTO website_branding (logo_url, primary_color, secondary_color, tertiary_color, primary_font, secondary_font, tertiary_font) VALUES (?, ?, ?, ?, ?, ?, ?)", 
          ['/api/placeholder/200/200', '#f97316', '#ea580c', '#dc2626', 'Inter', 'Poppins', 'Roboto']);

        console.log('Sample data inserted successfully');
      } else {
        console.log('Sample data already exists');
      }
    });
  }

  // Generic query method
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Generic run method for INSERT/UPDATE/DELETE
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  // Generic get method for single row
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  close() {
    this.db.close();
  }
}

export default Database;
