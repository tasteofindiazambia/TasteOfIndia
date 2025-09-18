// Vercel serverless function for updating menu items
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ootznaeeshzasqkjersy.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdHpuYWVlc2h6YXNxa2plcnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDc1MDcsImV4cCI6MjA3Mzc4MzUwN30.-aOSSovEXRXCM0imIxXad1R96iDVB6nFgPG5PcthI3Y';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'PUT') {
      const { id, available, name, description, price, category_id, image_url, tags, spice_level, pieces_count, preparation_time, is_vegetarian, is_vegan, is_gluten_free } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Menu item ID is required' });
      }

      const updateData = {};
      
      if (available !== undefined) updateData.available = available;
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (price) updateData.price = price;
      if (category_id) updateData.category_id = category_id;
      if (image_url) updateData.image_url = image_url;
      if (tags) updateData.tags = Array.isArray(tags) ? tags : tags.split(',');
      if (spice_level) updateData.spice_level = spice_level;
      if (pieces_count) updateData.pieces_count = pieces_count;
      if (preparation_time) updateData.preparation_time = preparation_time;
      if (is_vegetarian !== undefined) updateData.is_vegetarian = is_vegetarian;
      if (is_vegan !== undefined) updateData.is_vegan = is_vegan;
      if (is_gluten_free !== undefined) updateData.is_gluten_free = is_gluten_free;

      updateData.updated_at = new Date().toISOString();

      const { data: menuItem, error } = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating menu item:', error);
        return res.status(500).json({ error: 'Failed to update menu item' });
      }

      res.json({
        success: true,
        menuItem,
        message: 'Menu item updated successfully'
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
