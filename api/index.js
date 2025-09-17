// Vercel serverless function for API routes
import express from 'express';
import cors from 'cors';
import db from '../server/database.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Get menu for a restaurant
app.get('/api/menu/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Get categories with menu items
    const categories = await db.all(`
      SELECT c.*, 
             json_group_array(
               json_object(
                 'id', mi.id,
                 'name', mi.name,
                 'description', mi.description,
                 'price', mi.price,
                 'image_url', mi.image_url,
                 'available', mi.available,
                 'featured', mi.featured,
                 'tags', mi.tags,
                 'spice_level', mi.spice_level,
                 'pieces_count', mi.pieces_count,
                 'preparation_time', mi.preparation_time,
                 'is_vegetarian', mi.is_vegetarian,
                 'is_vegan', mi.is_vegan,
                 'is_gluten_free', mi.is_gluten_free
               )
             ) as items
      FROM categories c
      LEFT JOIN menu_items mi ON c.id = mi.category_id AND mi.available = 1
      WHERE c.restaurant_id = ? AND c.is_active = 1
      GROUP BY c.id
      ORDER BY c.display_order, c.name
    `, [restaurantId]);

    res.json(categories);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Get menu items by category
app.get('/api/menu/:restaurantId/category/:categoryId', async (req, res) => {
  try {
    const { restaurantId, categoryId } = req.params;
    
    const items = await db.all(`
      SELECT * FROM menu_items 
      WHERE restaurant_id = ? AND category_id = ? AND available = 1
      ORDER BY featured DESC, name
    `, [restaurantId, categoryId]);

    res.json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// ==================== ORDERS API ====================

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, restaurant_id, items, total_amount, order_type, payment_method, special_instructions } = req.body;

    // Generate order number
    const order_number = `ORD-${Date.now()}`;

    // Create order
    const orderResult = await db.run(`
      INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, restaurant_id, total_amount, order_type, payment_method, special_instructions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [order_number, customer_name, customer_phone, customer_email, restaurant_id, total_amount, order_type, payment_method, special_instructions]);

    const orderId = orderResult.lastID;

    // Add order items
    for (const item of items) {
      await db.run(`
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [orderId, item.menu_item_id, item.quantity, item.unit_price, item.total_price, item.special_instructions]);
    }

    res.json({ 
      success: true, 
      order_id: orderId, 
      order_number,
      message: 'Order created successfully' 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get orders for a restaurant
app.get('/api/orders/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status, limit = 50 } = req.query;

    let query = `
      SELECT o.*, 
             json_group_array(
               json_object(
                 'id', oi.id,
                 'menu_item_id', oi.menu_item_id,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'total_price', oi.total_price,
                 'special_instructions', oi.special_instructions,
                 'item_name', mi.name
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE o.restaurant_id = ?
    `;

    const params = [restaurantId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const orders = await db.all(query, params);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
app.put('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    await db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, orderId]);

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ==================== RESERVATIONS API ====================

// Create new reservation
app.post('/api/reservations', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, restaurant_id, date_time, party_size, occasion, table_preference, dietary_requirements, special_requests } = req.body;

    // Generate reservation number
    const reservation_number = `RES-${Date.now()}`;

    const result = await db.run(`
      INSERT INTO reservations (reservation_number, customer_name, customer_phone, customer_email, restaurant_id, date_time, party_size, occasion, table_preference, dietary_requirements, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [reservation_number, customer_name, customer_phone, customer_email, restaurant_id, date_time, party_size, occasion, table_preference, dietary_requirements, special_requests]);

    res.json({ 
      success: true, 
      reservation_id: result.lastID, 
      reservation_number,
      message: 'Reservation created successfully' 
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Get reservations for a restaurant
app.get('/api/reservations/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { date, status } = req.query;

    let query = 'SELECT * FROM reservations WHERE restaurant_id = ?';
    const params = [restaurantId];

    if (date) {
      query += ' AND DATE(date_time) = ?';
      params.push(date);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY date_time DESC';

    const reservations = await db.all(query, params);
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Update reservation status
app.put('/api/reservations/:reservationId/status', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;

    await db.run('UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, reservationId]);

    res.json({ success: true, message: 'Reservation status updated' });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ error: 'Failed to update reservation status' });
  }
});

// ==================== CUSTOMERS API ====================

// Get customers for a restaurant
app.get('/api/customers/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { search, status } = req.query;

    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const customers = await db.all(query, params);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create or update customer
app.post('/api/customers', async (req, res) => {
  try {
    const { name, phone, email, location, dietary_requirements, birthday, anniversary, notes } = req.body;

    // Check if customer exists
    const existingCustomer = await db.get('SELECT * FROM customers WHERE phone = ?', [phone]);

    if (existingCustomer) {
      // Update existing customer
      await db.run(`
        UPDATE customers 
        SET name = ?, email = ?, location = ?, dietary_requirements = ?, birthday = ?, anniversary = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE phone = ?
      `, [name, email, location, JSON.stringify(dietary_requirements), birthday, anniversary, notes, phone]);

      res.json({ success: true, message: 'Customer updated successfully', customer: existingCustomer });
    } else {
      // Create new customer
      const result = await db.run(`
        INSERT INTO customers (name, phone, email, location, dietary_requirements, birthday, anniversary, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [name, phone, email, location, JSON.stringify(dietary_requirements), birthday, anniversary, notes]);

      res.json({ 
        success: true, 
        message: 'Customer created successfully', 
        customer_id: result.lastID 
      });
    }
  } catch (error) {
    console.error('Error creating/updating customer:', error);
    res.status(500).json({ error: 'Failed to create/update customer' });
  }
});

// ==================== ANALYTICS API ====================

// Get dashboard analytics
app.get('/api/admin/analytics/dashboard', async (req, res) => {
  try {
    const { restaurantId, date } = req.query;
    
    const today = date || new Date().toISOString().split('T')[0];
    
    // Get today's stats
    const todayStats = await db.get(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders 
      WHERE restaurant_id = ? AND DATE(created_at) = ?
    `, [restaurantId, today]);

    // Get reservation stats
    const reservationStats = await db.get(`
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_reservations
      FROM reservations 
      WHERE restaurant_id = ? AND DATE(date_time) = ?
    `, [restaurantId, today]);

    // Get recent orders
    const recentOrders = await db.all(`
      SELECT * FROM orders 
      WHERE restaurant_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [restaurantId]);

    res.json({
      today: todayStats,
      reservations: reservationStats,
      recent_orders: recentOrders
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default app;
