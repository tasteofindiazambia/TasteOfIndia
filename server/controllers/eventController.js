import Database from '../models/database.js';

const db = new Database();

export const getAllEvents = async (req, res) => {
  try {
    const { location, category, featured, status } = req.query;
    
    let sql = 'SELECT * FROM events WHERE 1=1';
    let params = [];
    
    if (location) {
      sql += ' AND location = ?';
      params.push(location);
    }
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    if (featured !== undefined) {
      sql += ' AND featured = ?';
      params.push(featured === 'true' ? 1 : 0);
    }
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY date, time';
    
    const events = await db.query(sql, params);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, location, location_id, date, time, duration, price, max_attendees, image_url, category, featured, status } = req.body;
    
    const result = await db.run(
      'INSERT INTO events (title, description, location, location_id, date, time, duration, price, max_attendees, image_url, category, featured, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, location, location_id, date, time, duration, price, max_attendees, image_url, category, featured ? 1 : 0, status || 'upcoming']
    );
    
    res.status(201).json({ id: result.id, message: 'Event created successfully' });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, location_id, date, time, duration, price, max_attendees, image_url, category, featured, status } = req.body;
    
    const result = await db.run(
      'UPDATE events SET title = ?, description = ?, location = ?, location_id = ?, date = ?, time = ?, duration = ?, price = ?, max_attendees = ?, image_url = ?, category = ?, featured = ?, status = ? WHERE id = ?',
      [title, description, location, location_id, date, time, duration, price, max_attendees, image_url, category, featured ? 1 : 0, status, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.run('DELETE FROM events WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

export const toggleEventFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await db.get('SELECT featured FROM events WHERE id = ?', [id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const newFeatured = event.featured ? 0 : 1;
    await db.run('UPDATE events SET featured = ? WHERE id = ?', [newFeatured, id]);
    
    res.json({ message: 'Event featured status updated', featured: newFeatured });
  } catch (error) {
    console.error('Error toggling event featured status:', error);
    res.status(500).json({ error: 'Failed to update event featured status' });
  }
};

export const updateEventAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_attendees } = req.body;
    
    const result = await db.run(
      'UPDATE events SET current_attendees = ? WHERE id = ?',
      [current_attendees, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event attendees updated successfully' });
  } catch (error) {
    console.error('Error updating event attendees:', error);
    res.status(500).json({ error: 'Failed to update event attendees' });
  }
};
