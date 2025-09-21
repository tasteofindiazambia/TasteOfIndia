// Orders API endpoint
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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
      const { restaurant_id, status, limit = 50 } = req.query;

      let query = supabase
        .from('orders')
        .select(`
          *,
          restaurants (name, address, phone),
          order_items (
            id,
            menu_item_id,
            quantity,
            unit_price,
            total_price,
            special_instructions,
            menu_items (name, price, image_url),
            categories (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

      if (restaurant_id) {
        query = query.eq('restaurant_id', restaurant_id);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data: orders, error } = await query;
      if (error) throw error;

      // Format orders
      const formattedOrders = orders.map(order => ({
        ...order,
        restaurant_name: order.restaurants?.name,
        items: order.order_items?.map(item => ({
          ...item,
          menu_item_name: item.menu_items?.name,
          category_name: item.categories?.name
        })) || []
      }));

      res.json(formattedOrders);

    } else if (req.method === 'POST') {
      const { 
        customer_name, 
        customer_phone, 
        customer_email,
        restaurant_id,
        items,
        order_type = 'pickup',
        payment_method = 'cash',
        special_instructions,
        delivery_address,
        delivery_latitude,
        delivery_longitude,
        delivery_distance_km,
        delivery_fee = 0
      } = req.body;

      // Validate required fields
      if (!customer_name || !customer_phone || !restaurant_id || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate order token and number
      const orderToken = crypto.randomBytes(32).toString('hex');
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Calculate total amount
      let totalAmount = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
      if (order_type === 'delivery') {
        totalAmount += parseFloat(delivery_fee || 0);
      }

      // Calculate preparation time (max of all items)
      let maxPrepTime = 20; // default
      if (items.length > 0) {
        // This would ideally fetch prep times from menu_items table
        // For now, use a reasonable default
        maxPrepTime = Math.max(20, ...items.map(item => item.preparation_time || 20));
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          order_token: orderToken,
          customer_name,
          customer_phone,
          customer_email,
          restaurant_id,
          total_amount: totalAmount,
          status: 'pending',
          order_type,
          payment_method,
          special_instructions,
          estimated_preparation_time: maxPrepTime,
          delivery_address,
          delivery_fee: parseFloat(delivery_fee || 0),
          delivery_latitude,
          delivery_longitude,
          delivery_distance_km
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return res.status(500).json({ error: 'Failed to create order' });
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        special_instructions: item.special_instructions
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        return res.status(500).json({ error: 'Failed to create order items' });
      }

      res.status(201).json({
        success: true,
        order: order,
        message: 'Order created successfully'
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}