// Restaurants API endpoint
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

  try {
    if (req.method === 'GET') {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching restaurants:', error);
        return res.status(500).json({ error: 'Failed to fetch restaurants' });
      }

      res.json(restaurants);
    } else if (req.method === 'POST') {
      const { name, address, phone, email, hours } = req.body;

      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert([{ name, address, phone, email, hours }])
        .select()
        .single();

      if (error) {
        console.error('Error creating restaurant:', error);
        return res.status(500).json({ error: 'Failed to create restaurant' });
      }

      res.status(201).json(restaurant);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
