import Database from '../models/database.js';

const db = Database;

// Get menu items for a specific restaurant (public endpoint)
export const getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Validate restaurant exists
    const restaurant = await db.get(
      'SELECT id, name FROM restaurants WHERE id = ? AND is_active = 1',
      [restaurantId]
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Get menu items with comprehensive information
    const menuItems = await db.all(`
      SELECT 
        mi.id,
        mi.name,
        mi.description,
        mi.price,
        mi.image_url,
        mi.available,
        mi.featured,
        mi.tags,
        mi.spice_level,
        mi.pieces_count,
        mi.preparation_time,
        mi.is_vegetarian,
        mi.is_vegan,
        mi.is_gluten_free,
        mi.dynamic_pricing,
        mi.packaging_price,
        mi.listing_preference,
        c.id as category_id,
        c.name as category_name,
        c.description as category_description,
        c.display_order as category_display_order
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE mi.restaurant_id = ? AND mi.available = 1 AND c.is_active = 1
      ORDER BY 
        CASE mi.listing_preference 
          WHEN 'high' THEN 1 
          WHEN 'mid' THEN 2 
          WHEN 'low' THEN 3 
          ELSE 2 
        END,
        c.display_order, 
        c.name, 
        mi.name
    `, [restaurantId]);
    
    // Process tags from comma-separated strings
    const processedItems = menuItems.map(item => ({
      ...item,
      tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
      availability_status: item.available, // For backward compatibility
      pricing_type: item.dynamic_pricing ? 'per_gram' : 'fixed'
    }));
    
    res.json(processedItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

// Get menu categories for a restaurant
export const getCategoriesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Validate restaurant exists
    const restaurant = await db.get(
      'SELECT id FROM restaurants WHERE id = ? AND is_active = 1',
      [restaurantId]
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    const categories = await db.all(`
      SELECT 
        id,
        name,
        description,
        display_order,
        is_active
      FROM categories 
      WHERE restaurant_id = ? AND is_active = 1 
      ORDER BY display_order, name
    `, [restaurantId]);
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get all menu items for admin (with filters)
export const getAllMenuItems = async (req, res) => {
  try {
    const { restaurant_id, category_id, available, search, limit = 100, offset = 0 } = req.query;
    
    let sql = `
      SELECT 
        mi.*,
        c.name as category_name,
        r.name as restaurant_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      LEFT JOIN restaurants r ON mi.restaurant_id = r.id
      WHERE 1=1
    `;
    let params = [];
    
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
    
    if (search) {
      sql += ' AND (mi.name LIKE ? OR mi.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    sql += `
      ORDER BY r.name, c.display_order, mi.name
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));
    
    const menuItems = await db.all(sql, params);
    
    // Process tags and add compatibility fields
    const processedItems = menuItems.map(item => ({
      ...item,
      tags: item.tags ? JSON.parse(item.tags) : [],
      availability_status: item.available // For backward compatibility
    }));
    
    res.json(processedItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

// Create new menu item (admin)
export const createMenuItem = async (req, res) => {
  try {
    const {
      name, description, price, category_id, restaurant_id, image_url,
      available = true, featured = false, tags = [], spice_level = 'mild',
      pieces_count, preparation_time, is_vegetarian = false, 
      is_vegan = false, is_gluten_free = false
    } = req.body;
    
    // Validate required fields
    if (!name || !price || !category_id || !restaurant_id) {
      return res.status(400).json({ 
        error: 'Name, price, category ID, and restaurant ID are required' 
      });
    }
    
    // Validate price
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }
    
    // Validate category and restaurant exist
    const category = await db.get(
      'SELECT id FROM categories WHERE id = ? AND restaurant_id = ? AND is_active = 1',
      [category_id, restaurant_id]
    );
    
    if (!category) {
      return res.status(400).json({ error: 'Invalid category or restaurant ID' });
    }
    
    const result = await db.run(`
      INSERT INTO menu_items (
        name, description, price, category_id, restaurant_id, image_url,
        available, featured, tags, spice_level, pieces_count, preparation_time,
        is_vegetarian, is_vegan, is_gluten_free
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, description, parseFloat(price), category_id, restaurant_id, image_url,
      available ? 1 : 0, featured ? 1 : 0, JSON.stringify(tags), spice_level,
      pieces_count, preparation_time, is_vegetarian ? 1 : 0, is_vegan ? 1 : 0, is_gluten_free ? 1 : 0
    ]);
    
    // Return created item
    const createdItem = await db.get(`
      SELECT 
        mi.*,
        c.name as category_name,
        r.name as restaurant_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      LEFT JOIN restaurants r ON mi.restaurant_id = r.id
      WHERE mi.id = ?
    `, [result.id]);
    
    // Process tags
    createdItem.tags = createdItem.tags ? JSON.parse(createdItem.tags) : [];
    createdItem.availability_status = createdItem.available;
    
    res.status(201).json({
      success: true,
      item: createdItem,
      message: 'Menu item created successfully'
    });
    
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

// Update menu item (admin)
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, price, category_id, restaurant_id, image_url,
      available, featured, tags, spice_level, pieces_count, preparation_time,
      is_vegetarian, is_vegan, is_gluten_free
    } = req.body;
    
    // Check if item exists
    const existingItem = await db.get('SELECT id FROM menu_items WHERE id = ?', [id]);
    if (!existingItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Validate price if provided
    if (price !== undefined && (isNaN(price) || price < 0)) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }
    
    // Validate category and restaurant if provided
    if (category_id && restaurant_id) {
      const category = await db.get(
        'SELECT id FROM categories WHERE id = ? AND restaurant_id = ? AND is_active = 1',
        [category_id, restaurant_id]
      );
      
      if (!category) {
        return res.status(400).json({ error: 'Invalid category or restaurant ID' });
      }
    }
    
    const result = await db.run(`
      UPDATE menu_items SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        category_id = COALESCE(?, category_id),
        restaurant_id = COALESCE(?, restaurant_id),
        image_url = COALESCE(?, image_url),
        available = COALESCE(?, available),
        featured = COALESCE(?, featured),
        tags = COALESCE(?, tags),
        spice_level = COALESCE(?, spice_level),
        pieces_count = COALESCE(?, pieces_count),
        preparation_time = COALESCE(?, preparation_time),
        is_vegetarian = COALESCE(?, is_vegetarian),
        is_vegan = COALESCE(?, is_vegan),
        is_gluten_free = COALESCE(?, is_gluten_free),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, description, price ? parseFloat(price) : null, category_id, restaurant_id, image_url,
      available !== undefined ? (available ? 1 : 0) : null,
      featured !== undefined ? (featured ? 1 : 0) : null,
      tags ? JSON.stringify(tags) : null, spice_level, pieces_count, preparation_time,
      is_vegetarian !== undefined ? (is_vegetarian ? 1 : 0) : null,
      is_vegan !== undefined ? (is_vegan ? 1 : 0) : null,
      is_gluten_free !== undefined ? (is_gluten_free ? 1 : 0) : null,
      id
    ]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Return updated item
    const updatedItem = await db.get(`
      SELECT 
        mi.*,
        c.name as category_name,
        r.name as restaurant_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      LEFT JOIN restaurants r ON mi.restaurant_id = r.id
      WHERE mi.id = ?
    `, [id]);
    
    // Process tags
    updatedItem.tags = updatedItem.tags ? JSON.parse(updatedItem.tags) : [];
    updatedItem.availability_status = updatedItem.available;
    
    res.json({
      success: true,
      item: updatedItem,
      message: 'Menu item updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// Delete menu item (admin)
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.run('DELETE FROM menu_items WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};