import Database from '../models/database.js';
import csv from 'csv-parser';
import fs from 'fs';

const db = new Database();

export const getMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category } = req.query;
    
    let sql = `
      SELECT mi.*, c.name as category_name 
      FROM menu_items mi 
      LEFT JOIN categories c ON mi.category_id = c.id 
      WHERE mi.restaurant_id = ?
    `;
    let params = [restaurantId];
    
    if (category) {
      sql += ' AND c.name = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY c.name, mi.name';
    
    const menuItems = await db.query(sql, params);
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const categories = await db.query(
      'SELECT * FROM categories WHERE restaurant_id = ? ORDER BY name',
      [restaurantId]
    );
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, description, price, category_id, availability_status = 1 } = req.body;
    
    const result = await db.run(
      'INSERT INTO menu_items (name, description, price, category_id, restaurant_id, availability_status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, category_id, restaurantId, availability_status]
    );
    
    res.status(201).json({ id: result.id, message: 'Menu item created successfully' });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, availability_status } = req.body;
    
    const result = await db.run(
      'UPDATE menu_items SET name = ?, description = ?, price = ?, category_id = ?, availability_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, price, category_id, availability_status, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.run('DELETE FROM menu_items WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

export const uploadMenuCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { restaurantId } = req.params;
    const filePath = req.file.path;
    const menuItems = [];
    
    // Parse CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        menuItems.push({
          item_id: row.item_id || null,
          name: row.name,
          description: row.description || '',
          price: parseFloat(row.price),
          image_url: row.image_url || '',
          image_prompt: row.image_prompt || '',
          category_id: parseInt(row.category_id),
          item_family: row.item_family || '',
          tags: row.tags || '',
          availability_status: row.availability_status === '0' ? 0 : 1,
          preparation_time: row.preparation_time ? parseInt(row.preparation_time) : null,
          restaurant_id: parseInt(restaurantId)
        });
      })
      .on('end', async () => {
        try {
          // Insert or update menu items
          for (const item of menuItems) {
            if (item.item_id) {
              // Update existing item
              await db.run(
                `UPDATE menu_items SET 
                  name = ?, description = ?, price = ?, image_url = ?, image_prompt = ?, 
                  category_id = ?, item_family = ?, tags = ?, availability_status = ?, 
                  preparation_time = ?, updated_at = CURRENT_TIMESTAMP 
                  WHERE item_id = ? AND restaurant_id = ?`,
                [
                  item.name, item.description, item.price, item.image_url, item.image_prompt,
                  item.category_id, item.item_family, item.tags, item.availability_status,
                  item.preparation_time, item.item_id, item.restaurant_id
                ]
              );
            } else {
              // Insert new item
              await db.run(
                `INSERT INTO menu_items 
                  (name, description, price, image_url, image_prompt, category_id, item_family, tags, availability_status, preparation_time, restaurant_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  item.name, item.description, item.price, item.image_url, item.image_prompt,
                  item.category_id, item.item_family, item.tags, item.availability_status,
                  item.preparation_time, item.restaurant_id
                ]
              );
            }
          }
          
          // Delete uploaded file
          fs.unlinkSync(filePath);
          
          res.json({ 
            message: 'Menu uploaded successfully', 
            itemsProcessed: menuItems.length 
          });
        } catch (error) {
          console.error('Error processing menu items:', error);
          res.status(500).json({ error: 'Failed to process menu items' });
        }
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        res.status(500).json({ error: 'Failed to parse CSV file' });
      });
  } catch (error) {
    console.error('Error uploading menu:', error);
    res.status(500).json({ error: 'Failed to upload menu' });
  }
};
