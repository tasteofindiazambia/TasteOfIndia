import Database from '../models/database.js';
import crypto from 'crypto';

const db = Database;

export const getAllOrders = async (req, res) => {
  try {
    const { restaurant_id, status, limit = 50, offset = 0 } = req.query;
    
    let sql = `
      SELECT 
        o.*,
        r.name as restaurant_name,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN restaurants r ON o.restaurant_id = r.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    let params = [];
    
    if (restaurant_id) {
      sql += ' AND o.restaurant_id = ?';
      params.push(restaurant_id);
    }
    
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    
    sql += `
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));
    
    const orders = await db.all(sql, params);
    
    // Get order items for each order
    for (let order of orders) {
      const orderItems = await db.all(`
        SELECT 
          oi.*,
          mi.name as menu_item_name,
          mi.description as menu_item_description,
          mi.price as menu_item_price,
          mi.packaging_price as packaging_price
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      order.items = orderItems;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order with restaurant info
    const order = await db.get(`
      SELECT 
        o.*,
        r.name as restaurant_name,
        r.address as restaurant_address,
        r.phone as restaurant_phone
      FROM orders o
      LEFT JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.id = ?
    `, [id]);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get order items
    const orderItems = await db.all(`
      SELECT 
        oi.*,
        mi.name as menu_item_name,
        mi.description as menu_item_description,
        mi.price as menu_item_price,
        mi.image_url as menu_item_image,
        mi.packaging_price as packaging_price,
        c.name as category_name
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE oi.order_id = ?
    `, [id]);
    
    order.items = orderItems;
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const getOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Get order with restaurant info using token
    const order = await db.get(`
      SELECT 
        o.*,
        r.name as restaurant_name,
        r.address as restaurant_address,
        r.phone as restaurant_phone
      FROM orders o
      LEFT JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.order_token = ?
    `, [token]);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get order items with enhanced details
    const orderItems = await db.all(`
      SELECT 
        oi.*,
        mi.name as menu_item_name,
        mi.description as menu_item_description,
        mi.price as menu_item_price,
        mi.image_url as menu_item_image,
        mi.spice_level,
        mi.preparation_time,
        mi.tags,
        mi.dynamic_pricing,
        mi.packaging_price,
        c.name as category_name
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE oi.order_id = ?
    `, [order.id]);
    
    order.items = orderItems;
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { 
      customer_name, 
      customer_phone, 
      customer_email,
      restaurant_id,
      items,
      order_type = 'pickup',
      payment_method = 'cash',
      special_instructions,
      delivery_address,
      delivery_latitude,
      delivery_longitude,
      delivery_distance_km,
      delivery_fee = 0
    } = req.body;
    
    // Validate required fields
    if (!customer_name || !customer_phone || !restaurant_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Customer name, phone, restaurant ID, and items are required' 
      });
    }

    // Validate delivery address if order type is delivery
    if (order_type === 'delivery' && !delivery_address) {
      return res.status(400).json({ 
        error: 'Delivery address is required for delivery orders' 
      });
    }
    
    // Validate restaurant exists and get delivery settings
    const restaurant = await db.get(`
      SELECT id, delivery_fee_per_km, delivery_time_minutes, min_delivery_order, 
             max_delivery_radius_km, latitude, longitude
      FROM restaurants 
      WHERE id = ? AND is_active = 1
    `, [restaurant_id]);
    if (!restaurant) {
      return res.status(400).json({ error: 'Invalid restaurant ID' });
    }

    // Check minimum delivery order
    if (order_type === 'delivery' && restaurant.min_delivery_order) {
      // We'll calculate total first, then check
    }
    
    // Calculate total and validate menu items
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const item of items) {
      if (!item.menu_item_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ 
          error: 'Each item must have menu_item_id and positive quantity' 
        });
      }
      
      // Validate menu item exists and is available
      const menuItem = await db.get(`
        SELECT id, name, price, available 
        FROM menu_items 
        WHERE id = ? AND restaurant_id = ?
      `, [item.menu_item_id, restaurant_id]);
      
      if (!menuItem) {
        return res.status(400).json({ 
          error: `Menu item ${item.menu_item_id} not found` 
        });
      }
      
      if (!menuItem.available) {
        return res.status(400).json({ 
          error: `Menu item "${menuItem.name}" is not available` 
        });
      }
      
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      
      validatedItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: menuItem.price,
        total_price: itemTotal,
        special_instructions: item.special_instructions || null
      });
    }
    
    // Check minimum delivery order before adding delivery fee
    if (order_type === 'delivery' && restaurant.min_delivery_order && totalAmount < restaurant.min_delivery_order) {
      return res.status(400).json({ 
        error: `Minimum delivery order is K${restaurant.min_delivery_order.toFixed(0)}` 
      });
    }

    // Calculate final delivery fee based on distance
    let finalDeliveryFee = 0;
    if (order_type === 'delivery') {
      // Validate delivery location data
      if (!delivery_latitude || !delivery_longitude || !delivery_distance_km) {
        return res.status(400).json({ 
          error: 'Delivery location and distance are required for delivery orders' 
        });
      }
      
      // Check delivery radius
      if (delivery_distance_km > restaurant.max_delivery_radius_km) {
        return res.status(400).json({ 
          error: `Delivery location is outside our ${restaurant.max_delivery_radius_km}km delivery radius` 
        });
      }
      
      // Calculate fee: distance × rate per km, rounded up
      finalDeliveryFee = Math.ceil(delivery_distance_km * (restaurant.delivery_fee_per_km || 10));
      totalAmount += finalDeliveryFee;
    }
    
    // Generate secure order token and order number
    const orderToken = crypto.randomBytes(32).toString('hex');
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Calculate preparation time based on menu items (maximum prep time)
    let maxPrepTime = 0;
    for (const item of validatedItems) {
      const menuItem = await db.get(`
        SELECT preparation_time FROM menu_items WHERE id = ?
      `, [item.menu_item_id]);
      
      if (menuItem && menuItem.preparation_time > maxPrepTime) {
        maxPrepTime = menuItem.preparation_time;
      }
    }
    
    const prepTime = maxPrepTime || 20; // Default 20 minutes if no prep time found
    const deliveryTime = order_type === 'delivery' 
      ? (restaurant.delivery_time_minutes || 30) // Use restaurant setting or default 30 minutes
      : 0;
    
    
    // Log order creation for monitoring
    console.log(`Creating order: ${orderNumber} for ${customer_name} (${order_type})`);
    
    // Use transaction to ensure data consistency
    const queries = [
      {
        sql: `INSERT INTO orders (
          order_number, customer_name, customer_phone, customer_email, 
          restaurant_id, total_amount, status, order_type, payment_method, 
          special_instructions, estimated_preparation_time, delivery_address, 
          delivery_time_estimate, delivery_fee, order_token,
          delivery_latitude, delivery_longitude, delivery_distance_km
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [
          orderNumber, customer_name, customer_phone, customer_email,
          restaurant_id, totalAmount, 'pending', order_type, payment_method,
          special_instructions, prepTime, delivery_address, deliveryTime, finalDeliveryFee, orderToken,
          delivery_latitude, delivery_longitude, delivery_distance_km
        ]
      }
    ];
    
    const results = await db.transaction(queries);
    const orderId = results[0].id;
    
    // Insert order items
    for (const item of validatedItems) {
      await db.run(`
        INSERT INTO order_items (
          order_id, menu_item_id, quantity, unit_price, total_price, special_instructions
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderId, item.menu_item_id, item.quantity, 
        item.unit_price, item.total_price, item.special_instructions
      ]);
    }
    
    // Update or create customer record
    await updateCustomerRecord(customer_name, customer_phone, customer_email, totalAmount);
    
    // Return created order
    const createdOrder = await db.get(`
      SELECT 
        o.*,
        r.name as restaurant_name
      FROM orders o
      LEFT JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.id = ?
    `, [orderId]);
    
    res.status(201).json({
      success: true,
      order: createdOrder,
      message: 'Order created successfully'
    });
    
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimated_preparation_time } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Check if order exists
    const existingOrder = await db.get('SELECT id FROM orders WHERE id = ?', [id]);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update order
    const result = await db.run(`
      UPDATE orders SET 
        status = ?, 
        estimated_preparation_time = COALESCE(?, estimated_preparation_time),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, estimated_preparation_time, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Return updated order
    const updatedOrder = await db.get(`
      SELECT 
        o.*,
        r.name as restaurant_name
      FROM orders o
      LEFT JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.id = ?
    `, [id]);
    
    res.json({
      success: true,
      order: updatedOrder,
      message: 'Order status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if order exists
    const existingOrder = await db.get('SELECT id FROM orders WHERE id = ?', [id]);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Delete order (order_items will be deleted automatically due to CASCADE)
    const result = await db.run('DELETE FROM orders WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

// Helper function to update customer record
async function updateCustomerRecord(name, phone, email, orderAmount) {
  try {
    // Check if customer exists (by phone or email)
    let existingCustomer = null;
    if (phone) {
      existingCustomer = await db.get('SELECT * FROM customers WHERE phone = ?', [phone]);
    } else if (email) {
      existingCustomer = await db.get('SELECT * FROM customers WHERE email = ?', [email]);
    }
    
    if (existingCustomer) {
      // Update existing customer
      const newTotalOrders = existingCustomer.total_orders + 1;
      const newTotalSpent = existingCustomer.total_spent + orderAmount;
      const newAverageOrderValue = newTotalSpent / newTotalOrders;
      const newLoyaltyPoints = existingCustomer.loyalty_points + Math.floor(orderAmount);
      
      await db.run(`
        UPDATE customers SET
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          total_orders = ?,
          total_spent = ?,
          average_order_value = ?,
          last_order_date = CURRENT_TIMESTAMP,
          loyalty_points = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [name, email, newTotalOrders, newTotalSpent, newAverageOrderValue, newLoyaltyPoints, existingCustomer.id]);
    } else {
      // Create new customer
      await db.run(`
        INSERT INTO customers (
          name, phone, email, total_orders, total_spent, 
          average_order_value, loyalty_points, last_order_date
        ) VALUES (?, ?, ?, 1, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [name, phone, email, orderAmount, orderAmount, Math.floor(orderAmount)]);
    }
  } catch (error) {
    console.error('Error updating customer record:', error);
    // Don't throw error - order creation should still succeed
  }
}