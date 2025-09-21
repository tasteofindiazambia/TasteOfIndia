// Consolidated API handler for Vercel Hobby plan (12 function limit)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://qslfidheyalqdetiqdbs.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Set CORS headers
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Parse the URL to determine the endpoint
    const urlPath = req.url.replace('/api', '').replace(/^\//, '');
    const pathSegments = urlPath.split('/').filter(Boolean);

    // Health check - root API call
    if (pathSegments.length === 0) {
      return res.json({ 
        status: 'ok', 
        message: 'Taste of India API is running',
        timestamp: new Date().toISOString(),
        supabase: !!supabaseUrl
      });
    }

    // Route to appropriate handler based on first path segment
    switch (pathSegments[0]) {
      case 'restaurants':
        return await handleRestaurants(req, res, pathSegments);
      case 'menu':
        return await handleMenu(req, res, pathSegments);
      case 'orders':
        return await handleOrders(req, res, pathSegments);
      case 'customers':
        return await handleCustomers(req, res, pathSegments);
      case 'reservations':
        return await handleReservations(req, res, pathSegments);
      case 'auth':
        return await handleAuth(req, res, pathSegments);
      case 'menu-categories':
        return await handleMenuCategories(req, res, pathSegments);
      default:
        return res.status(404).json({ error: `Endpoint not found: ${pathSegments[0]}` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Restaurant handlers
async function handleRestaurants(req, res, endpoint) {
  if (req.method === 'GET') {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return res.json(restaurants);
  }
  
  if (req.method === 'POST') {
    const { name, address, phone, email, hours } = req.body;
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .insert([{ name, address, phone, email, hours }])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(restaurant);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Menu handlers
async function handleMenu(req, res, endpoint) {
  const restaurantId = endpoint[1]; // /api/menu/[restaurantId]
  
  if (req.method === 'GET' && restaurantId) {
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
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Order handlers
async function handleOrders(req, res, endpoint) {
  // Handle /api/orders/token/[token]
  if (endpoint[1] === 'token' && endpoint[2]) {
    const token = endpoint[2];
    
    console.log('Looking up order by token:', token);
    
    // Try simple query first to see if order exists
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_token', token)
      .single();
      
    console.log('Order lookup result:', { order, error });

    if (error || !order) {
      // If token lookup fails, try looking up by ID (for debugging)
      const numericId = parseInt(token);
      if (!isNaN(numericId)) {
        console.log('Token lookup failed, trying ID lookup:', numericId);
        const { data: orderById, error: idError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', numericId)
          .single();
          
        if (!idError && orderById) {
          console.log('Found order by ID:', orderById.id);
          // Use the order found by ID - simple format for now
          const formattedOrder = {
            ...orderById,
            items: [] // TODO: Fetch order items separately
          };

          return res.json(formattedOrder);
        }
      }
      
      return res.status(404).json({ error: 'Order not found' });
    }

    // Format the data - simple format for now
    const formattedOrder = {
      ...order,
      items: [] // TODO: Fetch order items separately
    };

    return res.json(formattedOrder);
  }

  // Handle regular orders
  if (req.method === 'GET') {
    const { restaurant_id, status, limit = 50 } = req.query;

    // Simplified query to avoid join issues
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (restaurant_id) {
      query = query.eq('restaurant_id', restaurant_id);
    }
    if (status) {
      query = query.eq('status', status);
    }

    console.log('Fetching orders with query:', { restaurant_id, status, limit });
    
    const { data: orders, error } = await query;
    
    console.log('Orders query result:', { orders: orders?.length, error });
    
    if (error) {
      console.error('Orders query error:', error);
      throw error;
    }

    // Format orders - simplified without joins
    const formattedOrders = orders.map(order => ({
      ...order,
      items: [] // TODO: Fetch order items separately
    }));

    return res.json(formattedOrders);
  }

  if (req.method === 'POST') {
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

    // Generate order token
    const crypto = await import('crypto');
    const orderToken = crypto.randomBytes(32).toString('hex');
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      special_instructions: item.special_instructions
    }));

    console.log('Creating order items:', orderItems);
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    console.log('Order items creation result:', { itemsError });
    
    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
      // For now, continue without failing the whole order
      // throw itemsError;
    }

    return res.status(201).json({
      success: true,
      order: order,
      message: 'Order created successfully'
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Customer handlers
async function handleCustomers(req, res, endpoint) {
  if (req.method === 'POST') {
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
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Reservation handlers
async function handleReservations(req, res, endpoint) {
  if (req.method === 'GET') {
    const { restaurant_id } = req.query;
    
    let query = supabase
      .from('reservations')
      .select('*')
      .order('date_time', { ascending: true });
    
    if (restaurant_id) {
      query = query.eq('restaurant_id', restaurant_id);
    }
    
    const { data: reservations, error } = await query;
    if (error) throw error;
    
    return res.json(reservations);
  }
  
  if (req.method === 'POST') {
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
    
    const reservationNumber = `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
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
    
    if (error) throw error;
    
    return res.status(201).json(reservation);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Auth handler
async function handleAuth(req, res, pathSegments) {
  const JWT_SECRET = process.env.JWT_SECRET || 'taste-of-india-secret-2024';
  
  console.log('Auth handler called with pathSegments:', pathSegments);
  
  // Handle /api/auth/login
  if (pathSegments[1] === 'login' || pathSegments.length === 1) {
    if (req.method === 'POST') {
      const { username, password } = req.body;

      // Simple admin authentication (in production, use proper hashing)
      if (username === 'admin' && password === 'admin123') {
        // For now, return a simple success response
        // In production, you'd generate a proper JWT token
        return res.json({
          success: true,
          token: 'simple-admin-token',
          user: {
            id: 1,
            username: 'admin',
            role: 'admin'
          },
          message: 'Login successful'
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
    } else if (req.method === 'GET') {
      // Token verification endpoint
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // For now, accept any token that starts with 'simple-admin-token'
      const token = authHeader.substring(7);
      
      if (token === 'simple-admin-token') {
        return res.json({
          success: true,
          user: {
            id: 1,
            username: 'admin',
            role: 'admin'
          }
        });
      } else {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Menu Categories handler
async function handleMenuCategories(req, res, pathSegments) {
  // pathSegments[0] is 'menu-categories', pathSegments[1] should be restaurantId
  const restaurantId = pathSegments[1];

  if (!restaurantId) {
    return res.status(400).json({ error: 'Restaurant ID is required' });
  }

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

    return res.json(categories || []);
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

    return res.status(201).json(category);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}