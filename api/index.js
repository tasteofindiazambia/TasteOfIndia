import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://qslfidheyalqdetiqdbs.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Parse URL path and query parameters
    const urlParts = req.url.split('?');
    const path = urlParts[0].replace('/api', '');
    const pathSegments = path.split('/').filter(Boolean);
    
    // Parse query parameters
    const query = {};
    if (urlParts[1]) {
      const searchParams = new URLSearchParams(urlParts[1]);
      for (const [key, value] of searchParams) {
        query[key] = value;
      }
    }

    // Health check
    if (pathSegments.length === 0) {
      return res.json({ 
        status: 'ok', 
        message: 'Taste of India API - FULL FUNCTIONALITY RESTORED',
        version: '5.0',
        supabase: !!supabaseUrl
      });
    }

    // Handle order status update (/api/orders/{id}/status) - check this first
    if (pathSegments[0] === 'orders' && pathSegments[2] === 'status' && req.method === 'PUT') {
      const orderId = pathSegments[1];
      const { status } = req.body;
      
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId)
          .select()
          .single();
        
        if (error) {
          console.error('Order status update error:', error);
          return res.status(500).json({ error: 'Failed to update order status' });
        }
        
        return res.json({ success: true, order });
      } catch (error) {
        console.error('Order status update exception:', error);
        return res.status(500).json({ error: 'Failed to update order status' });
      }
    }

    // Route handlers
    if (pathSegments[0] === 'restaurants') {
      return await handleRestaurants(req, res, query);
    }

    if (pathSegments[0] === 'orders') {
      return await handleOrders(req, res, pathSegments, query);
    }

    if (pathSegments[0] === 'menu') {
      return await handleMenu(req, res, pathSegments, query);
    }

    if (pathSegments[0] === 'auth') {
      return await handleAuth(req, res, pathSegments);
    }

    if (pathSegments[0] === 'customers') {
      return await handleCustomers(req, res, query);
    }

    if (pathSegments[0] === 'reservations') {
      return await handleReservations(req, res, query);
    }

    if (pathSegments[0] === 'menu-categories') {
      return await handleMenuCategories(req, res, pathSegments, query);
    }

    if (pathSegments[0] === 'admin') {
      return await handleAdmin(req, res, query);
    }

    return res.status(404).json({ error: `Endpoint not found: ${pathSegments[0]}` });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// Restaurant handler
async function handleRestaurants(req, res, query) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return res.json(data || []);
    } catch (error) {
      console.error('Restaurants error:', error);
      return res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

// Orders handler
async function handleOrders(req, res, pathSegments, query) {
  // Handle token-based order lookup (/api/orders/token/[token])
  if (pathSegments[1] === 'token' && pathSegments[2]) {
    const token = pathSegments[2];
    
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (name, price)
          )
        `)
        .eq('order_token', token)
        .single();

      if (error || !order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Format order items
      const formattedOrder = {
        ...order,
        items: order.order_items?.map(item => ({
          ...item,
          menu_item_name: item.menu_items?.name || 'Unknown Item',
          unit_price: item.unit_price || item.menu_items?.price || 0
        })) || []
      };

      return res.json(formattedOrder);
    } catch (error) {
      console.error('Order token lookup error:', error);
      return res.status(500).json({ error: 'Failed to fetch order' });
    }
  }

  if (req.method === 'GET') {
    try {
      const restaurantId = query.restaurant_id;
      const status = query.status;
      const limit = Math.min(parseInt(query.limit) || 50, 200);

      let queryBuilder = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (name, price, category_id)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (restaurantId) {
        queryBuilder = queryBuilder.eq('restaurant_id', parseInt(restaurantId));
      }
      if (status && status !== 'all') {
        queryBuilder = queryBuilder.eq('status', status);
      }

      const { data: orders, error } = await queryBuilder;
      
      if (error) {
        console.error('Orders query error:', error);
        return res.json([]); // Return empty array instead of failing
      }
      
      // Format orders with items
      const formattedOrders = (orders || []).map(order => ({
        ...order,
        items: order.order_items?.map(item => ({
          ...item,
          menu_item_name: item.menu_items?.name || 'Unknown Item',
          unit_price: item.unit_price || item.menu_items?.price || 0,
          category_name: item.menu_items?.category_id || 'Unknown Category'
        })) || []
      }));
      
      return res.json(formattedOrders);
    } catch (error) {
      console.error('Orders exception:', error);
      return res.json([]);
    }
  }


  if (req.method === 'POST') {
    try {
      console.log('Order creation request body:', req.body);
      
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
      if (!customer_name || !customer_phone || !restaurant_id || !items || !Array.isArray(items)) {
        console.error('Missing required fields:', { customer_name, customer_phone, restaurant_id, items });
        return res.status(400).json({ 
          error: 'Missing required fields',
          details: 'customer_name, customer_phone, restaurant_id, and items are required'
        });
      }

      // Generate order token
      const crypto = await import('crypto');
      const orderToken = crypto.randomBytes(32).toString('hex');
      const orderNumber = `ORD-${Math.floor(Math.random() * 9999)}`; // Shorter order number

      // Calculate total and create order
      let totalAmount = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
      if (order_type === 'delivery') {
        totalAmount += parseFloat(delivery_fee || 0);
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
          estimated_preparation_time: 20,
          delivery_address,
          delivery_fee: parseFloat(delivery_fee || 0),
          delivery_latitude,
          delivery_longitude,
          delivery_distance_km
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        return res.status(500).json({ 
          error: 'Failed to create order', 
          details: orderError.message 
        });
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
        console.error('Failed to create order items:', itemsError);
        // Continue without failing the whole order
      }

      return res.status(201).json({
        success: true,
        order: order,
        message: 'Order created successfully'
      });
    } catch (error) {
      console.error('Order creation exception:', error);
      return res.status(500).json({ 
        error: 'Failed to create order', 
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Menu handler
async function handleMenu(req, res, pathSegments, query) {
  const restaurantId = pathSegments[1];
  
  if (req.method === 'GET' && restaurantId) {
    try {
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

      if (error) throw error;

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

      return res.json(formattedItems);
    } catch (error) {
      console.error('Menu error:', error);
      return res.status(500).json({ error: 'Failed to fetch menu items' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Auth handler
async function handleAuth(req, res, pathSegments) {
  if (pathSegments[1] === 'login' && req.method === 'POST') {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
      return res.json({
        success: true,
        token: 'simple-admin-token',
        user: { id: 1, username: 'admin', role: 'admin' },
        message: 'Login successful'
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  }

  if (pathSegments[1] === 'verify' && req.method === 'GET') {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (token === 'simple-admin-token') {
      return res.json({
        success: true,
        user: { id: 1, username: 'admin', role: 'admin' }
      });
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Customers handler
async function handleCustomers(req, res, query) {
  if (req.method === 'POST') {
    try {
      const { name, phone, email } = req.body;

      // Check if customer exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .single();

      if (existingCustomer) {
        // Update existing customer
        const { data: customer, error } = await supabase
          .from('customers')
          .update({ 
            name, 
            email: email || existingCustomer.email,
            total_orders: existingCustomer.total_orders + 1,
            last_order_date: new Date().toISOString()
          })
          .eq('phone', phone)
          .select()
          .single();

        if (error) throw error;
        return res.json(customer);
      } else {
        // Create new customer
        const { data: customer, error } = await supabase
          .from('customers')
          .insert([{ name, phone, email, total_orders: 1, last_order_date: new Date().toISOString() }])
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(customer);
      }
    } catch (error) {
      console.error('Customer error:', error);
      return res.status(500).json({ error: 'Failed to process customer' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Reservations handler
async function handleReservations(req, res, query) {
  if (req.method === 'GET') {
    try {
      const { restaurant_id } = query;
      
      let queryBuilder = supabase
        .from('reservations')
        .select('*')
        .order('date_time', { ascending: true });
      
      if (restaurant_id) {
        queryBuilder = queryBuilder.eq('restaurant_id', restaurant_id);
      }
      
      const { data: reservations, error } = await queryBuilder;
      
      if (error) {
        console.log('Reservations query error (returning empty):', error);
        return res.json([]);
      }
      
      return res.json(reservations || []);
    } catch (error) {
      console.log('Reservations error (returning empty):', error);
      return res.json([]);
    }
  }
  
  if (req.method === 'POST') {
    try {
      console.log('Reservation creation request body:', req.body);
      
      const { 
        customer_name, 
        customer_phone, 
        customer_email,
        restaurant_id,
        date_time,
        party_size,
        occasion,
        special_requests
      } = req.body;
      
      // Validate required fields
      if (!customer_name || !customer_phone || !restaurant_id || !date_time || !party_size) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const reservationNumber = `RES-${Math.floor(Math.random() * 9999)}`; // Shorter reservation number
      
      console.log('Creating reservation with data:', {
        reservation_number: reservationNumber,
        customer_name,
        customer_phone,
        customer_email,
        restaurant_id,
        date_time,
        party_size,
        occasion,
        special_requests,
        status: 'pending'
      });
      
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert([{
          reservation_number: reservationNumber,
          customer_name,
          customer_phone,
          customer_email,
          restaurant_id,
          date_time,
          party_size,
          occasion,
          special_requests,
          status: 'pending'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase reservation error:', error);
        return res.status(500).json({ error: 'Database error: ' + error.message });
      }
      
      console.log('Reservation created successfully:', reservation);
      return res.status(201).json(reservation);
    } catch (error) {
      console.error('Reservation error:', error);
      return res.status(500).json({ error: 'Failed to create reservation: ' + error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Menu Categories handler
async function handleMenuCategories(req, res, pathSegments, query) {
  const restaurantId = pathSegments[1];

  if (!restaurantId) {
    return res.status(400).json({ error: 'Restaurant ID is required' });
  }

  if (req.method === 'GET') {
    try {
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

      return res.json(categories || []);
    } catch (error) {
      console.error('Categories error:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  } 
  
  if (req.method === 'POST') {
    try {
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

      return res.status(201).json(category);
    } catch (error) {
      console.error('Category creation error:', error);
      return res.status(500).json({ error: 'Failed to create category' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Admin handler - for dashboard data
async function handleAdmin(req, res, query) {
  if (req.method === 'GET') {
    try {
      const { type, restaurant_id, limit = 10 } = query;
      
      if (type === 'orders') {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .eq('restaurant_id', restaurant_id)
          .order('created_at', { ascending: false })
          .limit(parseInt(limit));
        
        if (error) {
          console.error('Admin orders error:', error);
          return res.json([]);
        }
        
        return res.json(orders || []);
      }
      
      if (type === 'reservations') {
        const { data: reservations, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('restaurant_id', restaurant_id)
          .order('date_time', { ascending: false })
          .limit(parseInt(limit));
        
        if (error) {
          console.error('Admin reservations error:', error);
          return res.json([]);
        }
        
        return res.json(reservations || []);
      }
      
      // Default admin data
      return res.json({
        orders: [],
        reservations: [],
        message: 'Admin endpoint working'
      });
      
    } catch (error) {
      console.error('Admin handler error:', error);
      return res.json([]);
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}