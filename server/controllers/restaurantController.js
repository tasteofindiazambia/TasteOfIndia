import Database from '../models/database.js';

const db = Database;

export const getAllRestaurants = async (req, res) => {
  try {
    const { is_active } = req.query;
    
    let sql = 'SELECT * FROM restaurants WHERE 1=1';
    let params = [];
    
    // Only filter by is_active if explicitly provided in query
    if (is_active !== undefined) {
      sql += ' AND is_active = ?';
      // Convert string 'true'/'false' to 1/0, default to active (1) if not specified
      params.push(is_active === 'false' ? 0 : 1);
    }
    
    sql += ' ORDER BY name';
    
    const restaurants = await db.all(sql, params);
    
    // Parse hours JSON for each restaurant
    const processedRestaurants = restaurants.map(restaurant => ({
      ...restaurant,
      hours: restaurant.hours ? JSON.parse(restaurant.hours) : {}
    }));
    
    res.json(processedRestaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await db.get(
      'SELECT * FROM restaurants WHERE id = ? AND is_active = 1', 
      [id]
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Parse hours JSON
    restaurant.hours = restaurant.hours ? JSON.parse(restaurant.hours) : {};
    
    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
};

export const createRestaurant = async (req, res) => {
  try {
    const { name, address, phone, email, hours } = req.body;
    
    // Validate required fields
    if (!name || !address || !phone || !hours) {
      return res.status(400).json({ 
        error: 'Name, address, phone, and hours are required' 
      });
    }
    
    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }
    
    // Validate and stringify hours
    let hoursString;
    if (typeof hours === 'object') {
      hoursString = JSON.stringify(hours);
    } else if (typeof hours === 'string') {
      try {
        JSON.parse(hours); // Validate it's valid JSON
        hoursString = hours;
      } catch {
        return res.status(400).json({ error: 'Hours must be valid JSON object' });
      }
    } else {
      return res.status(400).json({ error: 'Hours must be an object or JSON string' });
    }
    
    const result = await db.run(
      'INSERT INTO restaurants (name, address, phone, email, hours) VALUES (?, ?, ?, ?, ?)',
      [name, address, phone, email || null, hoursString]
    );
    
    // Return created restaurant
    const createdRestaurant = await db.get(
      'SELECT * FROM restaurants WHERE id = ?',
      [result.id]
    );
    
    createdRestaurant.hours = JSON.parse(createdRestaurant.hours);
    
    res.status(201).json({
      success: true,
      restaurant: createdRestaurant,
      message: 'Restaurant created successfully'
    });
    
  } catch (error) {
    console.error('Error creating restaurant:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: 'Restaurant with this information already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create restaurant' });
    }
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email, hours, is_active } = req.body;
    
    // Check if restaurant exists
    const existingRestaurant = await db.get('SELECT id FROM restaurants WHERE id = ?', [id]);
    if (!existingRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Validate phone if provided
    if (phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }
    }
    
    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }
    
    // Validate and stringify hours if provided
    let hoursString = null;
    if (hours !== undefined) {
      if (typeof hours === 'object') {
        hoursString = JSON.stringify(hours);
      } else if (typeof hours === 'string') {
        try {
          JSON.parse(hours); // Validate it's valid JSON
          hoursString = hours;
        } catch {
          return res.status(400).json({ error: 'Hours must be valid JSON object' });
        }
      } else {
        return res.status(400).json({ error: 'Hours must be an object or JSON string' });
      }
    }
    
    const result = await db.run(`
      UPDATE restaurants SET 
        name = COALESCE(?, name),
        address = COALESCE(?, address),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        hours = COALESCE(?, hours),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, address, phone, email, hoursString,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    ]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Return updated restaurant
    const updatedRestaurant = await db.get('SELECT * FROM restaurants WHERE id = ?', [id]);
    updatedRestaurant.hours = JSON.parse(updatedRestaurant.hours);
    
    res.json({
      success: true,
      restaurant: updatedRestaurant,
      message: 'Restaurant updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if restaurant has active orders or reservations
    const activeOrders = await db.get(
      "SELECT COUNT(*) as count FROM orders WHERE restaurant_id = ? AND status NOT IN ('completed', 'cancelled')",
      [id]
    );
    
    const activeReservations = await db.get(
      "SELECT COUNT(*) as count FROM reservations WHERE restaurant_id = ? AND status NOT IN ('completed', 'cancelled')",
      [id]
    );
    
    if (activeOrders.count > 0 || activeReservations.count > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete restaurant with active orders or reservations. Please complete or cancel them first.' 
      });
    }
    
    const result = await db.run('DELETE FROM restaurants WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
};

// Get restaurant statistics (admin)
export const getRestaurantStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_from, date_to } = req.query;
    
    // Check if restaurant exists
    const restaurant = await db.get('SELECT id, name FROM restaurants WHERE id = ?', [id]);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Set date range (default to last 30 days)
    const fromDate = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = date_to || new Date().toISOString().split('T')[0];
    
    // Get order statistics
    const orderStats = await db.get(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders 
      WHERE restaurant_id = ? AND DATE(created_at) BETWEEN ? AND ?
    `, [id, fromDate, toDate]);
    
    // Get reservation statistics
    const reservationStats = await db.get(`
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_reservations,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_reservations,
        SUM(party_size) as total_guests
      FROM reservations 
      WHERE restaurant_id = ? AND DATE(date_time) BETWEEN ? AND ?
    `, [id, fromDate, toDate]);
    
    // Get popular menu items
    const popularItems = await db.all(`
      SELECT 
        mi.name,
        mi.price,
        SUM(oi.quantity) as total_ordered,
        SUM(oi.total_price) as total_revenue,
        COUNT(DISTINCT o.id) as order_count
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.restaurant_id = ? AND DATE(o.created_at) BETWEEN ? AND ?
      GROUP BY mi.id, mi.name, mi.price
      ORDER BY total_ordered DESC
      LIMIT 10
    `, [id, fromDate, toDate]);
    
    res.json({
      restaurant: restaurant,
      date_range: { from: fromDate, to: toDate },
      orders: orderStats,
      reservations: reservationStats,
      popular_items: popularItems
    });
    
  } catch (error) {
    console.error('Error fetching restaurant stats:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant statistics' });
  }
};