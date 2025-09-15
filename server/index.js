import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Initialize SQLite database
const db = new sqlite3.Database('./restaurant.db');

// Create tables
db.serialize(() => {
  // Restaurants table
  db.run(`CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    hours TEXT NOT NULL,
    image TEXT
  )`);

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    restaurant_id INTEGER,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
  )`);

  // Menu items table
  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
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
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'received',
    restaurant_id INTEGER,
    special_instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
  )`);

  // Reservations table
  db.run(`CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    date_time DATETIME NOT NULL,
    party_size INTEGER NOT NULL,
    restaurant_id INTEGER,
    status TEXT DEFAULT 'confirmed',
    special_requests TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
  )`);

  // Insert sample data
  insertSampleData();
});

function insertSampleData() {
  // Check if data already exists
  db.get("SELECT COUNT(*) as count FROM restaurants", (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    
    if (row.count > 0) {
      console.log('Sample data already exists');
      return;
    }

    console.log('Inserting sample data...');

    // Insert restaurants
    const restaurants = [
      {
        name: 'Taste of India - Lusaka',
        address: 'Lusaka Central Business District, Zambia',
        phone: '+260 211 123456',
        hours: 'Mon-Sun: 11:00 AM - 10:00 PM'
      },
      {
        name: 'Taste of India - Manda Hill',
        address: 'Manda Hill Shopping Centre, Lusaka, Zambia',
        phone: '+260 211 789012',
        hours: 'Mon-Sun: 11:00 AM - 10:00 PM'
      }
    ];

    restaurants.forEach(restaurant => {
      db.run(
        "INSERT INTO restaurants (name, address, phone, hours) VALUES (?, ?, ?, ?)",
        [restaurant.name, restaurant.address, restaurant.phone, restaurant.hours]
      );
    });

    // Insert categories based on CSV data
    const categories = [
      { name: 'food', restaurant_id: 1 },
      { name: 'drinks', restaurant_id: 1 },
      { name: 'sweets', restaurant_id: 1 },
      { name: 'food', restaurant_id: 2 },
      { name: 'drinks', restaurant_id: 2 },
      { name: 'sweets', restaurant_id: 2 }
    ];

    categories.forEach(category => {
      db.run(
        "INSERT INTO categories (name, restaurant_id) VALUES (?, ?)",
        [category.name, category.restaurant_id]
      );
    });

    // Insert menu items
    const menuItems = [
      // Appetizers
      { name: 'Samosas', description: 'Crispy pastries filled with spiced potatoes and peas', price: 6.99, category_id: 1, available: 1 },
      { name: 'Pakoras', description: 'Mixed vegetable fritters with mint chutney', price: 7.99, category_id: 1, available: 1 },
      { name: 'Chicken Tikka', description: 'Tender chicken marinated in yogurt and spices', price: 12.99, category_id: 1, available: 1 },
      
      // Main Course
      { name: 'Butter Chicken', description: 'Creamy tomato curry with tender chicken pieces', price: 16.99, category_id: 2, available: 1 },
      { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 18.99, category_id: 2, available: 1 },
      { name: 'Dal Makhani', description: 'Rich black lentils cooked with cream and butter', price: 14.99, category_id: 2, available: 1 },
      { name: 'Palak Paneer', description: 'Fresh spinach curry with cottage cheese', price: 15.99, category_id: 2, available: 1 },
      
      // Desserts
      { name: 'Gulab Jamun', description: 'Sweet milk dumplings in rose syrup', price: 5.99, category_id: 3, available: 1 },
      { name: 'Kheer', description: 'Traditional rice pudding with nuts and cardamom', price: 4.99, category_id: 3, available: 1 },
      
      // Beverages
      { name: 'Mango Lassi', description: 'Sweet yogurt drink with mango', price: 4.99, category_id: 4, available: 1 },
      { name: 'Masala Chai', description: 'Spiced tea with milk', price: 3.99, category_id: 4, available: 1 }
    ];

    menuItems.forEach(item => {
      db.run(
        "INSERT INTO menu_items (name, description, price, category_id, availability_status) VALUES (?, ?, ?, ?, ?)",
        [item.name, item.description, item.price, item.category_id, 1]
      );
    });

    // Duplicate menu items for restaurant 2
    const menuItems2 = [
      // Appetizers
      { name: 'Samosas', description: 'Crispy pastries filled with spiced potatoes and peas', price: 6.99, category_id: 5, available: 1 },
      { name: 'Pakoras', description: 'Mixed vegetable fritters with mint chutney', price: 7.99, category_id: 5, available: 1 },
      { name: 'Chicken Tikka', description: 'Tender chicken marinated in yogurt and spices', price: 12.99, category_id: 5, available: 1 },
      
      // Main Course
      { name: 'Butter Chicken', description: 'Creamy tomato curry with tender chicken pieces', price: 16.99, category_id: 6, available: 1 },
      { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 18.99, category_id: 6, available: 1 },
      { name: 'Dal Makhani', description: 'Rich black lentils cooked with cream and butter', price: 14.99, category_id: 6, available: 1 },
      { name: 'Palak Paneer', description: 'Fresh spinach curry with cottage cheese', price: 15.99, category_id: 6, available: 1 },
      
      // Desserts
      { name: 'Gulab Jamun', description: 'Sweet milk dumplings in rose syrup', price: 5.99, category_id: 7, available: 1 },
      { name: 'Kheer', description: 'Traditional rice pudding with nuts and cardamom', price: 4.99, category_id: 7, available: 1 },
      
      // Beverages
      { name: 'Mango Lassi', description: 'Sweet yogurt drink with mango', price: 4.99, category_id: 8, available: 1 },
      { name: 'Masala Chai', description: 'Spiced tea with milk', price: 3.99, category_id: 8, available: 1 }
    ];

    menuItems2.forEach(item => {
      db.run(
        "INSERT INTO menu_items (name, description, price, category_id, availability_status) VALUES (?, ?, ?, ?, ?)",
        [item.name, item.description, item.price, item.category_id, 1]
      );
    });

    console.log('Sample data inserted successfully');
  });
}

// API Routes

// Create new restaurant location
app.post('/api/restaurants', (req, res) => {
  const { name, address, phone, hours } = req.body;
  
  db.run(
    "INSERT INTO restaurants (name, address, phone, hours) VALUES (?, ?, ?, ?)",
    [name, address, phone, hours],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const restaurantId = this.lastID;
      
      // Create default categories for the new restaurant
      const defaultCategories = ['food', 'drinks', 'sweets'];
      defaultCategories.forEach(categoryName => {
        db.run(
          "INSERT INTO categories (name, restaurant_id) VALUES (?, ?)",
          [categoryName, restaurantId]
        );
      });
      
      // Return the created restaurant
      db.get("SELECT * FROM restaurants WHERE id = ?", [restaurantId], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

// Update restaurant
app.put('/api/restaurants/:id', (req, res) => {
  const id = req.params.id;
  const { name, address, phone, hours } = req.body;
  
  db.run(
    "UPDATE restaurants SET name = ?, address = ?, phone = ?, hours = ? WHERE id = ?",
    [name, address, phone, hours, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }
      
      // Return updated restaurant
      db.get("SELECT * FROM restaurants WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// Delete restaurant
app.delete('/api/restaurants/:id', (req, res) => {
  const id = req.params.id;
  
  db.run("DELETE FROM restaurants WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    
    res.json({ message: 'Restaurant deleted successfully' });
  });
});

// Upload CSV menu for restaurant
app.post('/api/restaurants/:id/upload-menu', upload.single('csvFile'), (req, res) => {
  const restaurantId = req.params.id;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }
  
  const results = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Process CSV data
      processCSVData(restaurantId, results, (err, result) => {
        // Clean up uploaded file
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
        
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({
          message: 'Menu uploaded successfully',
          itemsProcessed: result.itemsProcessed,
          itemsUpdated: result.itemsUpdated,
          itemsCreated: result.itemsCreated
        });
      });
    })
    .on('error', (err) => {
      // Clean up uploaded file
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
      
      res.status(500).json({ error: 'Error parsing CSV file' });
    });
});

// Function to process CSV data
function processCSVData(restaurantId, csvData, callback) {
  let itemsProcessed = 0;
  let itemsUpdated = 0;
  let itemsCreated = 0;
  let errors = [];
  
  const processNextItem = (index) => {
    if (index >= csvData.length) {
      callback(null, { itemsProcessed, itemsUpdated, itemsCreated, errors });
      return;
    }
    
    const item = csvData[index];
    itemsProcessed++;
    
    // Get or create category
    db.get("SELECT id FROM categories WHERE name = ? AND restaurant_id = ?", 
           [item.ItemFamily, restaurantId], (err, category) => {
      if (err) {
        errors.push(`Error finding category for ${item.ItemName}: ${err.message}`);
        processNextItem(index + 1);
        return;
      }
      
      if (!category) {
        // Create new category
        db.run("INSERT INTO categories (name, restaurant_id) VALUES (?, ?)", 
               [item.ItemFamily, restaurantId], function(catErr) {
          if (catErr) {
            errors.push(`Error creating category for ${item.ItemName}: ${catErr.message}`);
            processNextItem(index + 1);
            return;
          }
          
          const categoryId = this.lastID;
          insertOrUpdateMenuItem(item, restaurantId, categoryId, index);
        });
      } else {
        insertOrUpdateMenuItem(item, restaurantId, category.id, index);
      }
    });
  };
  
  const insertOrUpdateMenuItem = (item, restaurantId, categoryId, index) => {
    const price = item.ItemPrice === 'X' ? 0 : parseFloat(item.ItemPrice) || 0;
    const availability = item.AvailabilityStatus === 'TRUE';
    const preparationTime = item.PreparationTime ? parseInt(item.PreparationTime) : null;
    
    // Check if item already exists
    db.get("SELECT id FROM menu_items WHERE item_id = ? AND restaurant_id = ?", 
           [item.ItemID, restaurantId], (err, existingItem) => {
      if (err) {
        errors.push(`Error checking existing item ${item.ItemName}: ${err.message}`);
        processNextItem(index + 1);
        return;
      }
      
      if (existingItem) {
        // Update existing item
        db.run(`UPDATE menu_items SET 
                name = ?, description = ?, price = ?, image_url = ?, image_prompt = ?,
                category_id = ?, item_family = ?, tags = ?, availability_status = ?,
                preparation_time = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
               [item.ItemName, item.ItemDescription, price, item.ImageUrl, item.ImagePrompt,
                categoryId, item.ItemFamily, item.Tags, availability, preparationTime, existingItem.id],
               function(updateErr) {
          if (updateErr) {
            errors.push(`Error updating ${item.ItemName}: ${updateErr.message}`);
          } else {
            itemsUpdated++;
          }
          processNextItem(index + 1);
        });
      } else {
        // Insert new item
        db.run(`INSERT INTO menu_items 
                (item_id, name, description, price, image_url, image_prompt, category_id, 
                 item_family, tags, availability_status, preparation_time, restaurant_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
               [item.ItemID, item.ItemName, item.ItemDescription, price, item.ImageUrl, item.ImagePrompt,
                categoryId, item.ItemFamily, item.Tags, availability, preparationTime, restaurantId],
               function(insertErr) {
          if (insertErr) {
            errors.push(`Error inserting ${item.ItemName}: ${insertErr.message}`);
          } else {
            itemsCreated++;
          }
          processNextItem(index + 1);
        });
      }
    });
  };
  
  processNextItem(0);
}

// Get all restaurants
app.get('/api/restaurants', (req, res) => {
  db.all("SELECT * FROM restaurants", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get restaurant by ID
app.get('/api/restaurants/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM restaurants WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    res.json(row);
  });
});

// Get categories for a restaurant
app.get('/api/categories/:restaurantId', (req, res) => {
  const restaurantId = req.params.restaurantId;
  db.all("SELECT * FROM categories WHERE restaurant_id = ?", [restaurantId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get menu for a restaurant
app.get('/api/menu/:restaurantId', (req, res) => {
  const restaurantId = req.params.restaurantId;
  const query = `
    SELECT mi.*, c.name as category_name 
    FROM menu_items mi 
    JOIN categories c ON mi.category_id = c.id 
    WHERE c.restaurant_id = ? 
    ORDER BY c.name, mi.name
  `;
  
  db.all(query, [restaurantId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Search menu items
app.get('/api/menu/:restaurantId/search', (req, res) => {
  const restaurantId = req.params.restaurantId;
  const query = req.query.q;
  
  if (!query) {
    res.json([]);
    return;
  }
  
  const searchQuery = `
    SELECT mi.*, c.name as category_name 
    FROM menu_items mi 
    JOIN categories c ON mi.category_id = c.id 
    WHERE c.restaurant_id = ? 
    AND (mi.name LIKE ? OR mi.description LIKE ?)
    ORDER BY c.name, mi.name
  `;
  
  const searchTerm = `%${query}%`;
  db.all(searchQuery, [restaurantId, searchTerm, searchTerm], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create order
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_phone, items, total, restaurant_id, special_instructions } = req.body;
  
  const itemsJson = JSON.stringify(items);
  
  db.run(
    "INSERT INTO orders (customer_name, customer_phone, items, total, restaurant_id, special_instructions) VALUES (?, ?, ?, ?, ?, ?)",
    [customer_name, customer_phone, itemsJson, total, restaurant_id, special_instructions],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Return the created order
      db.get("SELECT * FROM orders WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

// Get all orders
app.get('/api/orders', (req, res) => {
  const { restaurant_id, status } = req.query;
  let query = "SELECT * FROM orders";
  let params = [];
  
  if (restaurant_id || status) {
    const conditions = [];
    if (restaurant_id) {
      conditions.push("restaurant_id = ?");
      params.push(restaurant_id);
    }
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    query += " WHERE " + conditions.join(" AND ");
  }
  
  query += " ORDER BY created_at DESC";
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM orders WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(row);
  });
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  
  db.run(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      // Return updated order
      db.get("SELECT * FROM orders WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// Create reservation
app.post('/api/reservations', (req, res) => {
  const { customer_name, customer_phone, date_time, party_size, restaurant_id, special_requests } = req.body;
  
  db.run(
    "INSERT INTO reservations (customer_name, customer_phone, date_time, party_size, restaurant_id, special_requests) VALUES (?, ?, ?, ?, ?, ?)",
    [customer_name, customer_phone, date_time, party_size, restaurant_id, special_requests],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Return the created reservation
      db.get("SELECT * FROM reservations WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

// Get all reservations
app.get('/api/reservations', (req, res) => {
  const { restaurant_id, start_date, end_date } = req.query;
  let query = "SELECT * FROM reservations";
  let params = [];
  
  if (restaurant_id || start_date || end_date) {
    const conditions = [];
    if (restaurant_id) {
      conditions.push("restaurant_id = ?");
      params.push(restaurant_id);
    }
    if (start_date) {
      conditions.push("date_time >= ?");
      params.push(start_date);
    }
    if (end_date) {
      conditions.push("date_time <= ?");
      params.push(end_date);
    }
    query += " WHERE " + conditions.join(" AND ");
  }
  
  query += " ORDER BY date_time ASC";
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get reservation by ID
app.get('/api/reservations/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM reservations WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }
    res.json(row);
  });
});

// Update reservation status
app.put('/api/reservations/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  
  db.run(
    "UPDATE reservations SET status = ? WHERE id = ?",
    [status, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Reservation not found' });
        return;
      }
      
      // Return updated reservation
      db.get("SELECT * FROM reservations WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
