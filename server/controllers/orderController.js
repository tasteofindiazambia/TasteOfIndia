import Database from '../models/database.js';

const db = new Database();

export const getAllOrders = async (req, res) => {
  try {
    const { restaurantId, status } = req.query;
    
    let sql = 'SELECT * FROM orders WHERE 1=1';
    let params = [];
    
    if (restaurantId) {
      sql += ' AND restaurant_id = ?';
      params.push(restaurantId);
    }
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const orders = await db.query(sql, params);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { customer_name, customer_phone, items, total, restaurant_id, special_instructions } = req.body;
    
    const result = await db.run(
      'INSERT INTO orders (customer_name, customer_phone, items, total, restaurant_id, special_instructions) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_name, customer_phone, JSON.stringify(items), total, restaurant_id, special_instructions]
    );
    
    res.status(201).json({ id: result.id, message: 'Order created successfully' });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['received', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await db.run(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Fetch updated order
    const updatedOrder = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.run('DELETE FROM orders WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
