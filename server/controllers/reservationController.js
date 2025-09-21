import Database from '../models/database.js';

const db = Database;

export const getAllReservations = async (req, res) => {
  try {
    const { restaurant_id, status, date_from, date_to, limit = 100, offset = 0 } = req.query;
    
    let sql = `
      SELECT 
        r.*,
        res.name as restaurant_name
      FROM reservations r
      LEFT JOIN restaurants res ON r.restaurant_id = res.id
      WHERE 1=1
    `;
    let params = [];
    
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
    
    sql += ' ORDER BY r.date_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const reservations = await db.all(sql, params);
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await db.get(`
      SELECT 
        r.*,
        res.name as restaurant_name,
        res.address as restaurant_address,
        res.phone as restaurant_phone
      FROM reservations r
      LEFT JOIN restaurants res ON r.restaurant_id = res.id
      WHERE r.id = ?
    `, [id]);
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
};

export const createReservation = async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      restaurant_id,
      date_time,
      party_size,
      table_preference,
      dietary_requirements,
      special_requests
    } = req.body;
    
    // Validate required fields
    if (!customer_name || !customer_phone || !restaurant_id || !date_time || !party_size) {
      return res.status(400).json({
        error: 'Customer name, phone, restaurant ID, date/time, and party size are required'
      });
    }
    
    // Validate restaurant exists
    const restaurant = await db.get('SELECT id FROM restaurants WHERE id = ? AND is_active = 1', [restaurant_id]);
    if (!restaurant) {
      return res.status(400).json({ error: 'Invalid restaurant ID' });
    }
    
    // Validate date/time is in the future
    const reservationDate = new Date(date_time);
    if (reservationDate <= new Date()) {
      return res.status(400).json({ error: 'Reservation date/time must be in the future' });
    }
    
    // Validate party size
    if (party_size < 1 || party_size > 20) {
      return res.status(400).json({ error: 'Party size must be between 1 and 20' });
    }
    
    // Generate reservation number
    const reservationNumber = `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const result = await db.run(`
      INSERT INTO reservations (
        reservation_number, customer_name, customer_phone, customer_email,
        restaurant_id, date_time, party_size, table_preference,
        dietary_requirements, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      reservationNumber, customer_name, customer_phone, customer_email,
      restaurant_id, date_time, party_size, table_preference,
      dietary_requirements, special_requests
    ]);
    
    // Update or create customer record
    await updateCustomerRecord(customer_name, customer_phone, customer_email);
    
    // Return created reservation
    const createdReservation = await db.get(`
      SELECT 
        r.*,
        res.name as restaurant_name
      FROM reservations r
      LEFT JOIN restaurants res ON r.restaurant_id = res.id
      WHERE r.id = ?
    `, [result.id]);
    
    res.status(201).json({
      success: true,
      reservation: createdReservation,
      message: 'Reservation created successfully'
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
};

export const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Check if reservation exists
    const existingReservation = await db.get('SELECT id FROM reservations WHERE id = ?', [id]);
    if (!existingReservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    const result = await db.run(`
      UPDATE reservations SET
        status = ?,
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, notes, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    // Return updated reservation
    const updatedReservation = await db.get(`
      SELECT 
        r.*,
        res.name as restaurant_name
      FROM reservations r
      LEFT JOIN restaurants res ON r.restaurant_id = res.id
      WHERE r.id = ?
    `, [id]);
    
    res.json({
      success: true,
      reservation: updatedReservation,
      message: 'Reservation status updated successfully'
    });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ error: 'Failed to update reservation status' });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.run('DELETE FROM reservations WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
};

// Helper function to update customer record
async function updateCustomerRecord(name, phone, email) {
  try {
    // Check if customer exists
    let existingCustomer = null;
    if (phone) {
      existingCustomer = await db.get('SELECT * FROM customers WHERE phone = ?', [phone]);
    } else if (email) {
      existingCustomer = await db.get('SELECT * FROM customers WHERE email = ?', [email]);
    }
    
    if (existingCustomer) {
      // Update existing customer
      await db.run(`
        UPDATE customers SET
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [name, email, existingCustomer.id]);
    } else {
      // Create new customer
      await db.run(`
        INSERT INTO customers (name, phone, email, status)
        VALUES (?, ?, ?, 'active')
      `, [name, phone, email]);
    }
  } catch (error) {
    console.error('Error updating customer record:', error);
    // Don't throw error - reservation creation should still succeed
  }
}