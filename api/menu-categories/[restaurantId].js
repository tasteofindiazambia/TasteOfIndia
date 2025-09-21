// Menu categories API endpoint
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
      // Get categories for a restaurant
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('display_order')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({ error: 'Failed to fetch categories' });
      }

      res.json(categories || []);
    } else if (req.method === 'POST') {
      // Create new category
      const { name, description, display_order } = req.body;

      const { data: category, error } = await supabase
        .from('categories')
        .insert([{
          name,
          description,
          restaurant_id: restaurantId,
          display_order: display_order || 0,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        return res.status(500).json({ error: 'Failed to create category' });
      }

      res.status(201).json(category);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
