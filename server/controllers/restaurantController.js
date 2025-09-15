import Database from '../models/database.js';

const db = new Database();

export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await db.query('SELECT * FROM restaurants');
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await db.get('SELECT * FROM restaurants WHERE id = ?', [id]);
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
};

export const createRestaurant = async (req, res) => {
  try {
    const { name, address, phone, hours, image } = req.body;
    
    const result = await db.run(
      'INSERT INTO restaurants (name, address, phone, hours, image) VALUES (?, ?, ?, ?, ?)',
      [name, address, phone, hours, image]
    );
    
    res.status(201).json({ id: result.id, message: 'Restaurant created successfully' });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, hours, image } = req.body;
    
    const result = await db.run(
      'UPDATE restaurants SET name = ?, address = ?, phone = ?, hours = ?, image = ? WHERE id = ?',
      [name, address, phone, hours, image, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json({ message: 'Restaurant updated successfully' });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.run('DELETE FROM restaurants WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
};
