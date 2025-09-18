// Vercel serverless function for admin orders API
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
    if (req.method === 'GET') {
      const { restaurant_id, status, date_from, date_to } = req.query;

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            special_instructions,
            menu_items (
              id,
              name,
              price
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (restaurant_id) {
        query = query.eq('restaurant_id', restaurant_id);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (date_from) {
        query = query.gte('created_at', date_from);
      }

      if (date_to) {
        query = query.lte('created_at', date_to);
      }

      const { data: orders, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }

      res.json(orders);
    } else if (req.method === 'POST') {
      // Create new order
      const { customer_name, customer_phone, customer_email, restaurant_id, total_amount, order_type, payment_method, special_instructions, order_items } = req.body;

      // Generate order number
      const order_number = `ORD-${Date.now()}`;

      const { data: order, error } = await supabase
        .from('orders')
        .insert([{
          order_number,
          customer_name,
          customer_phone,
          customer_email,
          restaurant_id,
          total_amount,
          order_type,
          payment_method,
          special_instructions
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ error: 'Failed to create order' });
      }

      // Insert order items if provided
      if (order_items && order_items.length > 0) {
        const orderItemsData = order_items.map(item => ({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_instructions: item.special_instructions
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsData);

        if (itemsError) {
          console.error('Error creating order items:', itemsError);
          return res.status(500).json({ error: 'Failed to create order items' });
        }
      }

      res.status(201).json({
        success: true,
        order_id: order.id,
        order_number,
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
