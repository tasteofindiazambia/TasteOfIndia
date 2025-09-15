import Database from '../models/database.js';

const db = new Database();

export const getAllReservations = async (req, res) => {
  try {
    const { restaurantId, status, date } = req.query;
    
    let sql = 'SELECT * FROM reservations WHERE 1=1';
    let params = [];
    
    if (restaurantId) {
      sql += ' AND restaurant_id = ?';
      params.push(restaurantId);
    }
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    
    sql += ' ORDER BY date, time';
    
    const reservations = await db.query(sql, params);
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await db.get('SELECT * FROM reservations WHERE id = ?', [id]);
    
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
    const { customer_name, customer_phone, customer_email, date, time, party_size, special_requests, restaurant_id } = req.body;
    
    // Check for existing reservation at same time
    const existingReservation = await db.get(
      'SELECT * FROM reservations WHERE restaurant_id = ? AND date = ? AND time = ?',
      [restaurant_id, date, time]
    );
    
    if (existingReservation) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }
    
    const result = await db.run(
      'INSERT INTO reservations (customer_name, customer_phone, customer_email, date, time, party_size, special_requests, restaurant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [customer_name, customer_phone, customer_email, date, time, party_size, special_requests, restaurant_id]
    );
    
    res.status(201).json({ id: result.id, message: 'Reservation created successfully' });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, customer_phone, customer_email, date, time, party_size, special_requests, status } = req.body;
    
    const result = await db.run(
      'UPDATE reservations SET customer_name = ?, customer_phone = ?, customer_email = ?, date = ?, time = ?, party_size = ?, special_requests = ?, status = ? WHERE id = ?',
      [customer_name, customer_phone, customer_email, date, time, party_size, special_requests, status, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json({ message: 'Reservation updated successfully' });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.run('DELETE FROM reservations WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
};
