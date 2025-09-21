// Vercel serverless function for menu API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://qslfidheyalqdetiqdbs.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE';

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

  const { restaurantId } = req.query;

  try {
    if (req.method === 'GET') {
      // Get menu items for a restaurant
      const { data: menuItems, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories (
            id,
            name,
            description,
            display_order
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('available', true)
        .order('listing_preference')
        .order('name');

      if (error) {
        console.error('Error fetching menu items:', error);
        return res.status(500).json({ error: 'Failed to fetch menu items' });
      }

      // Format data to match expected frontend structure
      const formattedItems = menuItems.map(item => ({
        ...item,
        category_id: item.categories?.id,
        category_name: item.categories?.name,
        category_description: item.categories?.description,
        category_display_order: item.categories?.display_order,
        tags: typeof item.tags === 'string' ? item.tags.split(',').map(tag => tag.trim()) : item.tags || [],
        availability_status: item.available,
        pricing_type: item.dynamic_pricing ? 'per_gram' : 'fixed'
      }));

      res.json(formattedItems);
    } else if (req.method === 'POST') {
      // Create new menu item
      const { name, description, price, category_id, image_url, available, featured, tags, spice_level, pieces_count, preparation_time, is_vegetarian, is_vegan, is_gluten_free } = req.body;

      const { data: menuItem, error } = await supabase
        .from('menu_items')
        .insert([{
          name,
          description,
          price,
          category_id,
          restaurant_id: restaurantId,
          image_url,
          available,
          featured,
          tags,
          spice_level,
          pieces_count,
          preparation_time,
          is_vegetarian,
          is_vegan,
          is_gluten_free
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating menu item:', error);
        return res.status(500).json({ error: 'Failed to create menu item' });
      }

      res.status(201).json(menuItem);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}