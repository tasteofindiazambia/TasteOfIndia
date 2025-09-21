// Order by token API endpoint for customer access
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://qslfidheyalqdetiqdbs.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  try {
    // Get order by token with all related data
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurants (
          name,
          address,
          phone
        ),
        order_items (
          id,
          menu_item_id,
          quantity,
          unit_price,
          total_price,
          special_instructions,
          menu_items (
            name,
            description,
            price,
            image_url,
            spice_level,
            preparation_time,
            tags,
            dynamic_pricing,
            packaging_price
          ),
          categories (
            name
          )
        )
      `)
      .eq('order_token', token)
      .single();

    if (error || !order) {
      console.error('Error fetching order by token:', error);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Format the data to match expected structure
    const formattedOrder = {
      ...order,
      restaurant_name: order.restaurants?.name,
      restaurant_address: order.restaurants?.address,
      restaurant_phone: order.restaurants?.phone,
      items: order.order_items?.map(item => ({
        ...item,
        menu_item_name: item.menu_items?.name,
        menu_item_description: item.menu_items?.description,
        menu_item_price: item.menu_items?.price,
        menu_item_image: item.menu_items?.image_url,
        spice_level: item.menu_items?.spice_level,
        preparation_time: item.menu_items?.preparation_time,
        tags: item.menu_items?.tags,
        dynamic_pricing: item.menu_items?.dynamic_pricing,
        packaging_price: item.menu_items?.packaging_price,
        category_name: item.categories?.name
      })) || []
    };

    // Remove nested objects to avoid confusion
    delete formattedOrder.restaurants;
    delete formattedOrder.order_items;

    res.json(formattedOrder);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
