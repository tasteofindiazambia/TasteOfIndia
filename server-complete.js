import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './server/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// ==================== RESTAURANTS API ====================

// Get all restaurants
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await db.all('SELECT * FROM restaurants WHERE is_active = 1 ORDER BY name');
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get restaurant by ID
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await db.get('SELECT * FROM restaurants WHERE id = ? AND is_active = 1', [req.params.id]);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// ==================== MENU API ====================

// Get menu items for a specific restaurant
app.get('/api/menu/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const menuItems = await db.all(`
      SELECT mi.*, c.name as category_name,
             CASE WHEN mi.available = 1 THEN 1 ELSE 0 END as availability_status
      FROM menu_items mi 
      JOIN categories c ON mi.category_id = c.id 
      WHERE mi.restaurant_id = ? AND mi.available = 1 AND c.is_active = 1
      ORDER BY c.display_order, mi.name
    `, [restaurantId]);
    
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Get all menu items (admin)
app.get('/api/admin/menu', async (req, res) => {
  try {
    const { restaurant_id, category_id, available } = req.query;
    let sql = `
      SELECT mi.*, c.name as category_name, r.name as restaurant_name,
             CASE WHEN mi.available = 1 THEN 1 ELSE 0 END as availability_status
      FROM menu_items mi 
      JOIN categories c ON mi.category_id = c.id 
      JOIN restaurants r ON mi.restaurant_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (restaurant_id) {
      sql += ' AND mi.restaurant_id = ?';
      params.push(restaurant_id);
    }
    if (category_id) {
      sql += ' AND mi.category_id = ?';
      params.push(category_id);
    }
    if (available !== undefined) {
      sql += ' AND mi.available = ?';
      params.push(available === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY r.name, c.display_order, mi.name';

    const menuItems = await db.all(sql, params);
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Create menu item
app.post('/api/admin/menu', async (req, res) => {
  try {
    const {
      name, description, price, category_id, restaurant_id, image_url,
      available, featured, tags, spice_level, pieces_count, preparation_time,
      is_vegetarian, is_vegan, is_gluten_free
    } = req.body;

    const result = await db.run(`
      INSERT INTO menu_items (
        name, description, price, category_id, restaurant_id, image_url,
        available, featured, tags, spice_level, pieces_count, preparation_time,
        is_vegetarian, is_vegan, is_gluten_free
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, description, price, category_id, restaurant_id, image_url,
      available ? 1 : 0, featured ? 1 : 0, JSON.stringify(tags || []), spice_level,
      pieces_count, preparation_time, is_vegetarian ? 1 : 0, is_vegan ? 1 : 0, is_gluten_free ? 1 : 0
    ]);

    res.status(201).json({ id: result.id, message: 'Menu item created successfully' });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
app.put('/api/admin/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, price, category_id, restaurant_id, image_url,
      available, featured, tags, spice_level, pieces_count, preparation_time,
      is_vegetarian, is_vegan, is_gluten_free
    } = req.body;

    const result = await db.run(`
      UPDATE menu_items SET
        name = ?, description = ?, price = ?, category_id = ?, restaurant_id = ?, image_url = ?,
        available = ?, featured = ?, tags = ?, spice_level = ?, pieces_count = ?, preparation_time = ?,
        is_vegetarian = ?, is_vegan = ?, is_gluten_free = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, description, price, category_id, restaurant_id, image_url,
      available ? 1 : 0, featured ? 1 : 0, JSON.stringify(tags || []), spice_level,
      pieces_count, preparation_time, is_vegetarian ? 1 : 0, is_vegan ? 1 : 0, is_gluten_free ? 1 : 0, id
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
app.delete('/api/admin/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.run('DELETE FROM menu_items WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// ==================== CATEGORIES API ====================

// Get categories for a restaurant
app.get('/api/menu-categories/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const categories = await db.all(`
      SELECT * FROM categories 
      WHERE restaurant_id = ? AND is_active = 1 
      ORDER BY display_order, name
    `, [restaurantId]);
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ==================== ORDERS API ====================

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customer_name, customer_phone, customer_email, restaurant_id,
      order_type, payment_method, special_instructions, items
    } = req.body;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;
    
    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // Create order
    const orderResult = await db.run(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, customer_email, restaurant_id,
        total_amount, order_type, payment_method, special_instructions, estimated_preparation_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber, customer_name, customer_phone, customer_email, restaurant_id,
      totalAmount, order_type, payment_method, special_instructions, 25 // Default prep time
    ]);

    const orderId = orderResult.id;

    // Create order items
    for (const item of items) {
      await db.run(`
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderId, item.menu_item_id, item.quantity, item.unit_price,
        item.quantity * item.unit_price, item.special_instructions
      ]);
    }

    // Create or update customer record
    const existingCustomer = await db.get('SELECT * FROM customers WHERE phone = ?', [customer_phone]);
    
    if (existingCustomer) {
      // Update existing customer stats
      await db.run(`
        UPDATE customers SET
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          total_orders = total_orders + 1,
          total_spent = total_spent + ?,
          average_order_value = (total_spent + ?) / (total_orders + 1),
          last_order_date = CURRENT_TIMESTAMP,
          loyalty_points = loyalty_points + ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE phone = ?
      `, [customer_name, customer_email, totalAmount, totalAmount, Math.floor(totalAmount), customer_phone]);
    } else {
      // Create new customer
      await db.run(`
        INSERT INTO customers (
          name, email, phone, source, status, total_orders, total_spent, 
          average_order_value, loyalty_points, created_at, updated_at, last_order_date
        ) VALUES (?, ?, ?, 'order', 'active', 1, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [customer_name, customer_email, customer_phone, totalAmount, totalAmount, Math.floor(totalAmount)]);
    }

    res.status(201).json({ 
      id: orderId, 
      order_number: orderNumber,
      message: 'Order created successfully' 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders (admin)
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { restaurant_id, status, date_from, date_to } = req.query;
    let sql = `
      SELECT o.*, r.name as restaurant_name,
        GROUP_CONCAT(
          mi.name || ' (x' || oi.quantity || ')', ', '
        ) as items_summary
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE 1=1
    `;
    const params = [];

    if (restaurant_id) {
      sql += ' AND o.restaurant_id = ?';
      params.push(restaurant_id);
    }
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    if (date_from) {
      sql += ' AND DATE(o.created_at) >= ?';
      params.push(date_from);
    }
    if (date_to) {
      sql += ' AND DATE(o.created_at) <= ?';
      params.push(date_to);
    }

    sql += ' GROUP BY o.id ORDER BY o.created_at DESC';

    const orders = await db.all(sql, params);
    
    // Get order items for each order
    for (let order of orders) {
      const orderItems = await db.all(`
        SELECT oi.*, mi.name, mi.description, mi.price
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      order.items = orderItems;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order by ID
app.get('/api/admin/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order details
    const order = await db.get(`
      SELECT o.*, r.name as restaurant_name
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.id = ?
    `, [id]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const orderItems = await db.all(`
      SELECT oi.*, mi.name, mi.description, mi.price
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
    `, [id]);

    res.json({
      ...order,
      items: orderItems
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
app.put('/api/admin/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimated_preparation_time } = req.body;

    const result = await db.run(`
      UPDATE orders SET 
        status = ?, 
        estimated_preparation_time = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, estimated_preparation_time, id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ==================== RESERVATIONS API ====================

// Create new reservation
app.post('/api/reservations', async (req, res) => {
  try {
    const {
      customer_name, customer_phone, customer_email, restaurant_id,
      date_time, party_size, occasion, table_preference, dietary_requirements,
      confirmation_method, special_requests
    } = req.body;

    // Generate reservation number
    const reservationNumber = `RES-${Date.now()}`;

    const result = await db.run(`
      INSERT INTO reservations (
        reservation_number, customer_name, customer_phone, customer_email, restaurant_id,
        date_time, party_size, occasion, table_preference, dietary_requirements,
        confirmation_method, special_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reservationNumber, customer_name, customer_phone, customer_email, restaurant_id,
      date_time, party_size, occasion, table_preference, dietary_requirements,
      confirmation_method, special_requests
    ]);

    res.status(201).json({ 
      reservation_id: result.id, 
      reservation_number: reservationNumber,
      message: 'Reservation created successfully' 
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Get all reservations (admin)
app.get('/api/admin/reservations', async (req, res) => {
  try {
    const { restaurant_id, status, date_from, date_to } = req.query;
    let sql = `
      SELECT r.*, res.name as restaurant_name
      FROM reservations r
      JOIN restaurants res ON r.restaurant_id = res.id
      WHERE 1=1
    `;
    const params = [];

    if (restaurant_id) {
      sql += ' AND r.restaurant_id = ?';
      params.push(restaurant_id);
    }
    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    if (date_from) {
      sql += ' AND DATE(r.date_time) >= ?';
      params.push(date_from);
    }
    if (date_to) {
      sql += ' AND DATE(r.date_time) <= ?';
      params.push(date_to);
    }

    sql += ' ORDER BY r.date_time DESC';

    const reservations = await db.all(sql, params);
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// ==================== CUSTOMERS API ====================

// Get all customers (admin)
app.get('/api/admin/customers', async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY total_spent DESC, name';

    const customers = await db.all(sql, params);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create customer (for newsletter subscription and order tracking)
app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, source = 'unknown' } = req.body;

    // Check if customer already exists
    let existingCustomer = null;
    if (email) {
      existingCustomer = await db.get('SELECT * FROM customers WHERE email = ?', [email]);
    } else if (phone) {
      existingCustomer = await db.get('SELECT * FROM customers WHERE phone = ?', [phone]);
    }

    if (existingCustomer) {
      // Update existing customer with new information
      await db.run(`
        UPDATE customers SET
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          source = COALESCE(?, source),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [name, email, phone, source, existingCustomer.id]);
      
      res.json({ 
        id: existingCustomer.id,
        message: 'Customer updated successfully',
        isNew: false
      });
    } else {
      // Create new customer
      const result = await db.run(`
        INSERT INTO customers (name, email, phone, source, status, total_spent, loyalty_points, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'active', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [name, email, phone, source]);

      res.status(201).json({ 
        id: result.lastID,
        message: 'Customer created successfully',
        isNew: true
      });
    }
  } catch (error) {
    console.error('Error creating/updating customer:', error);
    res.status(500).json({ error: 'Failed to create/update customer' });
  }
});

// ==================== BLOGS API ====================

// Get all blogs (admin)
app.get('/api/blogs', async (req, res) => {
  try {
    // For now, return sample blog data since we don't have a blogs table yet
    const sampleBlogs = [
      {
        id: 1,
        title: 'Welcome to Taste of India',
        content: 'Discover the authentic flavors of India...',
        author: 'Admin',
        category: 'News',
        status: 'published',
        published_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        title: 'New Menu Items Available',
        content: 'We are excited to introduce new dishes...',
        author: 'Chef',
        category: 'Menu',
        status: 'published',
        published_at: '2024-01-10T14:30:00Z',
        created_at: '2024-01-10T14:30:00Z'
      }
    ];
    
    res.json(sampleBlogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// ==================== ANALYTICS API ====================

// Get dashboard analytics
app.get('/api/admin/analytics/dashboard', async (req, res) => {
  try {
    const { restaurant_id, date_from, date_to } = req.query;
    
    // Get date range
    const fromDate = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = date_to || new Date().toISOString().split('T')[0];

    let whereClause = 'WHERE DATE(created_at) BETWEEN ? AND ?';
    const params = [fromDate, toDate];

    if (restaurant_id) {
      whereClause += ' AND restaurant_id = ?';
      params.push(restaurant_id);
    }

    // Get order statistics
    const orderStats = await db.get(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders
      FROM orders 
      ${whereClause}
    `, params);

    // Get reservation statistics
    const reservationStats = await db.get(`
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_reservations
      FROM reservations 
      ${whereClause}
    `, params);

    // Get popular items
    const popularItems = await db.all(`
      SELECT 
        mi.name,
        mi.price,
        SUM(oi.quantity) as total_ordered,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) BETWEEN ? AND ?
      ${restaurant_id ? 'AND o.restaurant_id = ?' : ''}
      GROUP BY mi.id, mi.name, mi.price
      ORDER BY total_ordered DESC
      LIMIT 10
    `, params);

    res.json({
      orderStats,
      reservationStats,
      popularItems,
      dateRange: { from: fromDate, to: toDate }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🏪 Restaurants: http://localhost:${PORT}/api/restaurants`);
  console.log(`📋 Menu API: http://localhost:${PORT}/api/menu/1`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/admin/analytics/dashboard`);
});

export default app;
