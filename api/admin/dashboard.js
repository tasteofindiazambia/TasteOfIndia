// Vercel serverless function for admin dashboard API
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
      const { restaurant_id } = req.query;

      // Get dashboard data
      const today = new Date().toISOString().split('T')[0];
      const startOfDay = `${today}T00:00:00.000Z`;
      const endOfDay = `${today}T23:59:59.999Z`;

      // Get total orders
      let ordersQuery = supabase
        .from('orders')
        .select('*');

      if (restaurant_id) {
        ordersQuery = ordersQuery.eq('restaurant_id', restaurant_id);
      }

      const { data: orders, error: ordersError } = await ordersQuery;

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }

      // Get today's orders
      const { data: todayOrders, error: todayOrdersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      if (todayOrdersError) {
        console.error('Error fetching today\'s orders:', todayOrdersError);
      }

      // Get reservations
      let reservationsQuery = supabase
        .from('reservations')
        .select('*');

      if (restaurant_id) {
        reservationsQuery = reservationsQuery.eq('restaurant_id', restaurant_id);
      }

      const { data: reservations, error: reservationsError } = await reservationsQuery;

      if (reservationsError) {
        console.error('Error fetching reservations:', reservationsError);
      }

      // Get today's reservations
      const { data: todayReservations, error: todayReservationsError } = await supabase
        .from('reservations')
        .select('*')
        .gte('date_time', startOfDay)
        .lte('date_time', endOfDay);

      if (todayReservationsError) {
        console.error('Error fetching today\'s reservations:', todayReservationsError);
      }

      // Calculate statistics
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalReservations = reservations?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get popular items
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          menu_item_id,
          quantity,
          menu_items (
            name
          )
        `);

      let popularItem = 'No data available';
      if (!orderItemsError && orderItems && orderItems.length > 0) {
        const itemCounts = {};
        orderItems.forEach(item => {
          const itemName = item.menu_items?.name || 'Unknown';
          itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
        });
        
        const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
        if (sortedItems.length > 0) {
          popularItem = sortedItems[0][0];
        }
      }

      // Get restaurants count
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id');

      const restaurantsCount = restaurants?.length || 0;

      const dashboardData = {
        totalOrders,
        totalRevenue,
        totalReservations,
        averageOrderValue,
        popularItem,
        restaurantsCount,
        todayOrders: todayOrders?.length || 0,
        todayReservations: todayReservations?.length || 0,
        recentOrders: orders?.slice(0, 5) || [],
        todayReservationsList: todayReservations || []
      };

      res.json(dashboardData);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
