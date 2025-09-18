// Vercel serverless function for admin API
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

  const { type } = req.query;

  try {
    if (type === 'customers') {
      // Handle customers
      if (req.method === 'GET') {
        const { restaurant_id, search, status, limit = 50 } = req.query;

        let query = supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(parseInt(limit));

        if (restaurant_id) {
          query = query.eq('restaurant_id', restaurant_id);
        }

        if (search) {
          query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
        }

        if (status) {
          query = query.eq('status', status);
        }

        const { data: customers, error } = await query;

        if (error) {
          console.error('Error fetching customers:', error);
          return res.status(500).json({ error: 'Failed to fetch customers' });
        }

        res.json(customers);
      } else if (req.method === 'POST') {
        const { name, phone, email, restaurant_id, location, dietary_requirements, birthday, anniversary, notes } = req.body;

        const { data: customer, error } = await supabase
          .from('customers')
          .insert([{
            name,
            phone,
            email,
            restaurant_id,
            location,
            dietary_requirements,
            birthday,
            anniversary,
            notes
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating customer:', error);
          return res.status(500).json({ error: 'Failed to create customer' });
        }

        res.status(201).json({
          success: true,
          customer,
          message: 'Customer created successfully'
        });
      }
    } else if (type === 'orders') {
      // Handle orders
      if (req.method === 'GET') {
        const { restaurant_id, status, limit = 50 } = req.query;

        let query = supabase
          .from('orders')
          .select(`
            *,
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
                price
              )
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

        if (error) {
          console.error('Error fetching orders:', error);
          return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        res.json(orders);
      } else if (req.method === 'PUT') {
        const { orderId, status, estimatedTime } = req.body;

        const updateData = { status };
        if (estimatedTime) {
          updateData.estimated_time = estimatedTime;
        }

        const { data: order, error } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', orderId)
          .select()
          .single();

        if (error) {
          console.error('Error updating order:', error);
          return res.status(500).json({ error: 'Failed to update order' });
        }

        res.json({
          success: true,
          order,
          message: 'Order updated successfully'
        });
      }
    } else if (type === 'reservations') {
      // Handle reservations
      if (req.method === 'GET') {
        const { restaurant_id, status, limit = 50 } = req.query;

        let query = supabase
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(parseInt(limit));

        if (restaurant_id) {
          query = query.eq('restaurant_id', restaurant_id);
        }

        if (status) {
          query = query.eq('status', status);
        }

        const { data: reservations, error } = await query;

        if (error) {
          console.error('Error fetching reservations:', error);
          return res.status(500).json({ error: 'Failed to fetch reservations' });
        }

        res.json(reservations);
      } else if (req.method === 'PUT') {
        const { reservationId, status } = req.body;

        const { data: reservation, error } = await supabase
          .from('reservations')
          .update({ status })
          .eq('id', reservationId)
          .select()
          .single();

        if (error) {
          console.error('Error updating reservation:', error);
          return res.status(500).json({ error: 'Failed to update reservation' });
        }

        res.json({
          success: true,
          reservation,
          message: 'Reservation updated successfully'
        });
      }
    } else if (type === 'dashboard') {
      // Handle dashboard data
      if (req.method === 'GET') {
        const { restaurant_id } = req.query;

        // Get orders count
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurant_id);

        // Get reservations count
        const { count: reservationsCount } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurant_id);

        // Get customers count
        const { count: customersCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurant_id);

        // Get recent orders
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('restaurant_id', restaurant_id)
          .order('created_at', { ascending: false })
          .limit(5);

        res.json({
          ordersCount: ordersCount || 0,
          reservationsCount: reservationsCount || 0,
          customersCount: customersCount || 0,
          recentOrders: recentOrders || []
        });
      }
    } else {
      res.status(400).json({ error: 'Invalid type parameter' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
