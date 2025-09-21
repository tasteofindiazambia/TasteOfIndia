import Database from '../models/database.js';

const db = Database;

// Get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const { status, search, limit = 100, offset = 0 } = req.query;
    
    let sql = 'SELECT * FROM customers WHERE 1=1';
    let params = [];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    if (search) {
      sql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sql += ' ORDER BY total_spent DESC, name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const customers = await db.all(sql, params);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// Create new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Check if customer already exists
    let existingCustomer = null;
    if (phone) {
      existingCustomer = await db.get('SELECT * FROM customers WHERE phone = ?', [phone]);
    } else if (email) {
      existingCustomer = await db.get('SELECT * FROM customers WHERE email = ?', [email]);
    }
    
    if (existingCustomer) {
      return res.status(409).json({ 
        error: 'Customer with this phone or email already exists',
        existing_customer: existingCustomer
      });
    }
    
    const result = await db.run(`
      INSERT INTO customers (name, phone, email, status, created_at, updated_at)
      VALUES (?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [name, phone || null, email || null]);
    
    // Return created customer
    const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [result.id]);
    
    res.status(201).json({
      success: true,
      customer: newCustomer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, notes, status } = req.body;
    
    // Check if customer exists
    const existingCustomer = await db.get('SELECT id FROM customers WHERE id = ?', [id]);
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check for duplicate phone/email if updating
    if (phone || email) {
      let duplicateCheck = '';
      let checkParams = [];
      
      if (phone && email) {
        duplicateCheck = 'SELECT * FROM customers WHERE (phone = ? OR email = ?) AND id != ?';
        checkParams = [phone, email, id];
      } else if (phone) {
        duplicateCheck = 'SELECT * FROM customers WHERE phone = ? AND id != ?';
        checkParams = [phone, id];
      } else if (email) {
        duplicateCheck = 'SELECT * FROM customers WHERE email = ? AND id != ?';
        checkParams = [email, id];
      }
      
      if (duplicateCheck) {
        const duplicate = await db.get(duplicateCheck, checkParams);
        if (duplicate) {
          return res.status(409).json({ error: 'Another customer with this phone or email already exists' });
        }
      }
    }
    
    const result = await db.run(`
      UPDATE customers SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        notes = COALESCE(?, notes),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, phone, email, notes, status, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Return updated customer
    const updatedCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
    
    res.json({
      success: true,
      customer: updatedCustomer,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer has active orders or reservations
    const activeOrders = await db.get(
      "SELECT COUNT(*) as count FROM orders WHERE customer_phone = (SELECT phone FROM customers WHERE id = ?) AND status NOT IN ('completed', 'cancelled')",
      [id]
    );
    
    const activeReservations = await db.get(
      "SELECT COUNT(*) as count FROM reservations WHERE customer_phone = (SELECT phone FROM customers WHERE id = ?) AND status NOT IN ('completed', 'cancelled')",
      [id]
    );
    
    if (activeOrders.count > 0 || activeReservations.count > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete customer with active orders or reservations. Please complete or cancel them first.' 
      });
    }
    
    const result = await db.run('DELETE FROM customers WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get order history
    const orderHistory = await db.all(`
      SELECT o.*, r.name as restaurant_name
      FROM orders o
      LEFT JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.customer_phone = ?
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [customer.phone]);
    
    // Get reservation history
    const reservationHistory = await db.all(`
      SELECT res.*, r.name as restaurant_name
      FROM reservations res
      LEFT JOIN restaurants r ON res.restaurant_id = r.id
      WHERE res.customer_phone = ?
      ORDER BY res.date_time DESC
      LIMIT 10
    `, [customer.phone]);
    
    res.json({
      customer,
      order_history: orderHistory,
      reservation_history: reservationHistory
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ error: 'Failed to fetch customer statistics' });
  }
};