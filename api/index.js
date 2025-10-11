import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://qslfidheyalqdetiqdbs.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Create admin client with service role key for operations that need elevated permissions
const supabaseAdmin = createClient(
  supabaseUrl, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey
);


// Authentication middleware
async function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return { valid: false, error: 'No authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  try {
    // Handle new dynamic tokens (format: token-{userId}-{timestamp})
    if (token.startsWith('token-')) {
      const tokenParts = token.split('-');
      if (tokenParts.length >= 3) {
        const userId = parseInt(tokenParts[1]);
        
        // Try to get user from database
        const { data: users, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', userId)
          .eq('is_active', true)
          .limit(1);
        
        if (!error && users && users.length > 0) {
          const user = users[0];
          return { 
            valid: true, 
            user: { 
              id: user.id, 
              username: user.username, 
              role: user.role === 'owner' ? 'admin' : user.role,
              fullName: user.full_name 
            }
          };
        }
      }
    }
    
    // Handle simple tokens (fallback)
    if (token === 'simple-admin-token') {
      return { 
        valid: true, 
        user: { id: 1, username: 'admin', role: 'admin' }
      };
    }
    
    if (token === 'simple-worker-token') {
      return { 
        valid: true, 
        user: { id: 2, username: 'worker', role: 'worker', fullName: 'Test Worker' }
      };
    }
    
    return { valid: false, error: 'Invalid token' };
    
  } catch (error) {
    console.error('Token verification error:', error);
    
    // Fallback to simple token verification
    if (token === 'simple-admin-token') {
      return { 
        valid: true, 
        user: { id: 1, username: 'admin', role: 'admin' }
      };
    }
    
    if (token === 'simple-worker-token') {
      return { 
        valid: true, 
        user: { id: 2, username: 'worker', role: 'worker', fullName: 'Test Worker' }
      };
    }
    
    return { valid: false, error: 'Token verification failed' };
  }
}

// Check if endpoint requires authentication
function requiresAuth(path) {
  const publicEndpoints = ['/health', '/auth/login', '/auth', '/'];
  console.log('Checking auth for path:', path, 'requires auth:', !publicEndpoints.some(p => path.startsWith(p)));
  return !publicEndpoints.some(p => path.startsWith(p));
}

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

    // Authentication check for protected endpoints
    if (requiresAuth(path)) {
      const authResult = await verifyToken(req);
      if (!authResult.valid) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: authResult.error 
        });
      }
      // Attach user to request for use in handlers
      req.user = authResult.user;
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

    // Health endpoint for admin panel
    if (pathSegments[0] === 'health') {
      return res.json({ 
        status: 'ok', 
        message: 'API is running',
        timestamp: new Date().toISOString()
      });
    }

    // Handle order status update (/api/orders/{id}/status) - check this first
    if (pathSegments[0] === 'orders' && pathSegments[2] === 'status' && req.method === 'PUT') {
      const orderId = pathSegments[1];
      const { status, estimated_preparation_time } = req.body;
      
      console.log('Order status update request:', { orderId, status, estimated_preparation_time, pathSegments });
      
      if (!orderId || orderId === 'undefined' || isNaN(parseInt(orderId))) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      try {
        const updateData = { status };
        if (estimated_preparation_time !== undefined) {
          updateData.estimated_preparation_time = estimated_preparation_time;
        }
        
        const { data: order, error } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', parseInt(orderId))
          .select()
          .single();
        
        if (error) {
          console.error('Order status update error:', error);
          return res.status(500).json({ error: 'Failed to update order status', details: error.message });
        }
        
        console.log('Order status updated successfully:', order);
        return res.json({ success: true, order });
      } catch (error) {
        console.error('Order status update exception:', error);
        return res.status(500).json({ error: 'Failed to update order status', details: error.message });
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



    if (pathSegments[0] === 'menu-categories') {
      return await handleMenuCategories(req, res, pathSegments, query);
    }

    if (pathSegments[0] === 'admin') {
      // Admin sub-routes
      if (pathSegments[1] === 'menu') {
        return await handleAdminMenu(req, res, pathSegments, query);
      }
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
          status: 'preparing',
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

// Admin Menu CRUD (create/update/toggle availability)
async function handleAdminMenu(req, res, pathSegments, query) {
  try {
    // Use regular supabase client (works with RLS policies)
    const client = supabase;
    
    // POST /api/admin/menu -> create item
    if (req.method === 'POST') {
      const payload = req.body || {};
      console.log('Creating menu item:', payload);
      
      const { data, error } = await client
        .from('menu_items')
        .insert([payload])
        .select(`
          *,
          categories (id, name, description),
          restaurants (id, name)
        `)
        .single();
        
      if (error) {
        console.error('Admin menu create error:', error);
        return res.status(500).json({ error: 'Failed to create menu item', details: error.message });
      }
      
      // Format response to match frontend expectations
      const formattedItem = {
        ...data,
        category_name: data.categories?.name,
        restaurant_name: data.restaurants?.name,
        availability_status: data.available ? 1 : 0
      };
      
      return res.status(201).json({ 
        success: true, 
        item: formattedItem, 
        message: 'Menu item created successfully' 
      });
    }

    // PUT /api/admin/menu/:id -> update item
    if (req.method === 'PUT') {
      const id = pathSegments[2];
      if (!id) return res.status(400).json({ error: 'Missing menu item id' });
      
      const payload = req.body || {};
      console.log('Updating menu item:', id, payload);
      
      const { data, error } = await client
        .from('menu_items')
        .update(payload)
        .eq('id', parseInt(id))
        .select(`
          *,
          categories (id, name, description),
          restaurants (id, name)
        `)
        .single();
        
      if (error) {
        console.error('Admin menu update error:', error);
        return res.status(500).json({ error: 'Failed to update menu item', details: error.message });
      }
      
      // Format response to match frontend expectations
      const formattedItem = {
        ...data,
        category_name: data.categories?.name,
        restaurant_name: data.restaurants?.name,
        availability_status: data.available ? 1 : 0
      };
      
      return res.json({ 
        success: true, 
        item: formattedItem, 
        message: 'Menu item updated successfully' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('Admin menu exception:', e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}

// Auth handler (Enhanced with database support + backward compatibility)
async function handleAuth(req, res, pathSegments) {
  if (pathSegments[1] === 'login' && req.method === 'POST') {
    const { username, password } = req.body;
    
    try {
      // First, try database authentication (new system)
      const { data: users, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .limit(1);
      
      if (!error && users && users.length > 0) {
        const user = users[0];
        
        // For now, we'll use simple password comparison
        // TODO: Implement bcrypt comparison in next iteration
        if (password === 'admin123' && username === 'admin') {
          return res.json({
            success: true,
            token: `token-${user.id}-${Date.now()}`, // More dynamic token
            user: { 
              id: user.id, 
              username: user.username, 
              role: user.role === 'owner' ? 'admin' : user.role, // Backward compatibility
              fullName: user.full_name 
            },
            message: 'Login successful'
          });
        }
      }
      
      // Fallback to hardcoded system (backward compatibility)
      if (username === 'admin' && password === 'admin123') {
        return res.json({
          success: true,
          token: 'simple-admin-token',
          user: { id: 1, username: 'admin', role: 'admin' },
          message: 'Login successful (fallback)'
        });
      }
      
      // Temporary worker account for testing
      if (username === 'worker' && password === 'worker123') {
        return res.json({
          success: true,
          token: 'simple-worker-token',
          user: { id: 2, username: 'worker', role: 'worker', fullName: 'Test Worker' },
          message: 'Login successful (temp worker)'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      
    } catch (error) {
      console.error('Database auth error, falling back to hardcoded:', error);
      
      // Fallback to hardcoded system if database fails
      if (username === 'admin' && password === 'admin123') {
        return res.json({
          success: true,
          token: 'simple-admin-token',
          user: { id: 1, username: 'admin', role: 'admin' },
          message: 'Login successful (fallback)'
        });
      }
      
      if (username === 'worker' && password === 'worker123') {
        return res.json({
          success: true,
          token: 'simple-worker-token',
          user: { id: 2, username: 'worker', role: 'worker', fullName: 'Test Worker' },
          message: 'Login successful (temp worker fallback)'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  }

  if (pathSegments[1] === 'logout') {
    if (req.method === 'POST') {
      // Simple logout - just return success (token invalidation would be handled client-side)
      return res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } else {
      // Return 405 with allowed methods
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed. Only POST is supported for logout.' });
    }
  }

  if (pathSegments[1] === 'verify' && req.method === 'GET') {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    try {
      // Handle new dynamic tokens (format: token-{userId}-{timestamp})
      if (token && token.startsWith('token-')) {
        const tokenParts = token.split('-');
        if (tokenParts.length >= 3) {
          const userId = parseInt(tokenParts[1]);
          
          // Try to get user from database
          const { data: users, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', userId)
            .eq('is_active', true)
            .limit(1);
          
          if (!error && users && users.length > 0) {
            const user = users[0];
            return res.json({
              success: true,
              user: { 
                id: user.id, 
                username: user.username, 
                role: user.role === 'owner' ? 'admin' : user.role, // Backward compatibility
                fullName: user.full_name 
              }
            });
          }
        }
      }
      
      // Fallback to simple token (backward compatibility)
      if (token === 'simple-admin-token') {
        return res.json({
          success: true,
          user: { id: 1, username: 'admin', role: 'admin' }
        });
      }
      
      // Temporary worker token
      if (token === 'simple-worker-token') {
        return res.json({
          success: true,
          user: { id: 2, username: 'worker', role: 'worker', fullName: 'Test Worker' }
        });
      }
      
      return res.status(401).json({ error: 'Invalid token' });
      
    } catch (error) {
      console.error('Token verification error, trying fallback:', error);
      
      // Fallback to simple token verification
      if (token === 'simple-admin-token') {
        return res.json({
          success: true,
          user: { id: 1, username: 'admin', role: 'admin' }
        });
      }
      
      if (token === 'simple-worker-token') {
        return res.json({
          success: true,
          user: { id: 2, username: 'worker', role: 'worker', fullName: 'Test Worker' }
        });
      }
      
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Customers handler
async function handleCustomers(req, res, query) {
  if (req.method === 'GET') {
    try {
      // Get customers from orders
      const customers = new Map();
      
      // Get unique customers from orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('customer_name, customer_phone, customer_email, created_at, total_amount');
      
      if (!ordersError && orders) {
        orders.forEach(order => {
          const phone = order.customer_phone;
          if (phone && !customers.has(phone)) {
            customers.set(phone, {
              id: customers.size + 1,
              name: order.customer_name,
              phone: order.customer_phone,
              email: order.customer_email,
              source: 'order',
              first_interaction: order.created_at,
              last_order_date: order.created_at,
              total_spent: order.total_amount || 0,
              order_count: 1
            });
          } else if (phone && customers.has(phone)) {
            // Update existing customer with latest order info
            const existing = customers.get(phone);
            existing.total_spent += (order.total_amount || 0);
            existing.order_count += 1;
            if (new Date(order.created_at) > new Date(existing.last_order_date)) {
              existing.last_order_date = order.created_at;
              existing.name = order.customer_name; // Update name if newer
            }
          }
        });
      }
      
      // Convert Map to Array and sort by most recent interaction
      const customerList = Array.from(customers.values()).sort((a, b) => {
        const aDate = a.last_order_date || a.first_interaction;
        const bDate = b.last_order_date || b.first_interaction;
        return new Date(bDate) - new Date(aDate);
      });
      
      return res.json(customerList);
    } catch (error) {
      console.error('Customers GET error:', error);
      // Return mock data if database fails
      return res.json([
        {
          id: 1,
          name: 'Mock Customer',
          phone: '1234567890',
          email: 'mock@example.com',
          source: 'fallback',
          first_interaction: new Date().toISOString(),
          total_spent: 0,
          order_count: 0
        }
      ]);
    }
  }
  
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
      
      // If RLS error or table doesn't exist, return a mock customer
      if (error.message.includes('row-level security') || error.message.includes('relation "customers" does not exist')) {
        console.log('Customers table issue, returning mock customer');
        const mockCustomer = {
          id: Date.now(),
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
          total_orders: 1,
          last_order_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        return res.status(201).json(mockCustomer);
      }
      
      return res.status(500).json({ error: 'Failed to process customer' });
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
        // Get database reservations
        const { data: dbReservations, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('restaurant_id', restaurant_id)
          .order('date_time', { ascending: false })
          .limit(parseInt(limit));
        
        // Get mock reservations for this restaurant
        const mockReservationsList = Array.from(mockReservations.values()).filter(r => r.restaurant_id == restaurant_id);
        
        // Combine database and mock reservations
        const allReservations = [
          ...(dbReservations || []),
          ...mockReservationsList
        ];
        
        if (error) {
          console.error('Admin reservations error (returning mock only):', error);
          return res.json(mockReservationsList);
        }
        
        return res.json(allReservations);
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
