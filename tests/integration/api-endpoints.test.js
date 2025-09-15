import { TEST_CONFIG } from '../setup.js';

describe('Restaurant API Endpoints', () => {
  
  test('GET /api/health - Health check endpoint', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/health`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('database', 'connected');
  });

  test('GET /api/restaurants - Get all restaurants', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/restaurants`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    
    // Check restaurant structure
    const restaurant = data[0];
    expect(restaurant).toHaveProperty('id');
    expect(restaurant).toHaveProperty('name');
    expect(restaurant).toHaveProperty('address');
    expect(restaurant).toHaveProperty('phone');
    expect(restaurant).toHaveProperty('hours');
  });

  test('GET /api/restaurants/:id - Get restaurant by ID', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/restaurants/1`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('id', 1);
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('address');
  });

  test('GET /api/restaurants/:id - Restaurant not found', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/restaurants/999`);
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Restaurant not found');
  });

  test('GET /api/menu/:restaurantId - Get menu for restaurant', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/menu/1`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    
    // Check menu item structure
    const menuItem = data[0];
    expect(menuItem).toHaveProperty('id');
    expect(menuItem).toHaveProperty('name');
    expect(menuItem).toHaveProperty('description');
    expect(menuItem).toHaveProperty('price');
    expect(menuItem).toHaveProperty('category_name');
    expect(menuItem).toHaveProperty('available');
  });

  test('GET /api/menu-categories/:restaurantId - Get categories for restaurant', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/menu-categories/1`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    
    const category = data[0];
    expect(category).toHaveProperty('id');
    expect(category).toHaveProperty('name');
    expect(category).toHaveProperty('restaurant_id');
  });

  test('GET /api/admin/menu - Get all menu items (admin)', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/menu`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    if (data.length > 0) {
      const menuItem = data[0];
      expect(menuItem).toHaveProperty('id');
      expect(menuItem).toHaveProperty('name');
      expect(menuItem).toHaveProperty('category_name');
      expect(menuItem).toHaveProperty('restaurant_name');
    }
  });

  test('GET /api/admin/menu with filters - Filter by restaurant', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/menu?restaurant_id=1`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    // All items should belong to restaurant 1
    data.forEach(item => {
      expect(item.restaurant_id).toBe(1);
    });
  });

  test('GET /api/admin/menu with filters - Filter by availability', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/menu?available=true`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    // All items should be available
    data.forEach(item => {
      expect(item.available).toBe(1);
    });
  });

  test('POST /api/admin/menu - Create menu item', async () => {
    const menuItem = {
      name: 'Test Menu Item',
      description: 'Test description for menu item',
      price: 15.00,
      category_id: 1,
      restaurant_id: 1,
      available: true,
      featured: false,
      tags: ['test'],
      spice_level: 'mild',
      pieces_count: 1,
      preparation_time: 15,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false
    };

    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuItem)
    });

    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('message', 'Menu item created successfully');
  });

  test('PUT /api/admin/menu/:id - Update menu item', async () => {
    // First create a menu item
    const menuItem = {
      name: 'Test Update Item',
      description: 'Test description',
      price: 20.00,
      category_id: 1,
      restaurant_id: 1,
      available: true,
      featured: false,
      tags: ['test'],
      spice_level: 'mild',
      pieces_count: 1,
      preparation_time: 15,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false
    };

    const createResponse = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuItem)
    });

    const createData = await createResponse.json();
    const itemId = createData.id;

    // Now update the item
    const updatedItem = {
      ...menuItem,
      name: 'Updated Test Item',
      price: 25.00
    };

    const updateResponse = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/menu/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem)
    });

    expect(updateResponse.status).toBe(200);
    
    const updateData = await updateResponse.json();
    expect(updateData).toHaveProperty('message', 'Menu item updated successfully');
  });

  test('DELETE /api/admin/menu/:id - Delete menu item', async () => {
    // First create a menu item
    const menuItem = {
      name: 'Test Delete Item',
      description: 'Test description',
      price: 30.00,
      category_id: 1,
      restaurant_id: 1,
      available: true,
      featured: false,
      tags: ['test'],
      spice_level: 'mild',
      pieces_count: 1,
      preparation_time: 15,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false
    };

    const createResponse = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuItem)
    });

    const createData = await createResponse.json();
    const itemId = createData.id;

    // Now delete the item
    const deleteResponse = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/menu/${itemId}`, {
      method: 'DELETE'
    });

    expect(deleteResponse.status).toBe(200);
    
    const deleteData = await deleteResponse.json();
    expect(deleteData).toHaveProperty('message', 'Menu item deleted successfully');
  });

  test('POST /api/orders - Create new order', async () => {
    const orderData = {
      customer_name: 'Test Customer',
      customer_phone: '+260 97 000 0000',
      customer_email: 'test@example.com',
      restaurant_id: 1,
      order_type: 'dine_in',
      payment_method: 'cash',
      special_instructions: 'Test order',
      items: [
        {
          menu_item_id: 1,
          quantity: 2,
          unit_price: 8.00,
          special_instructions: 'Extra spicy'
        }
      ]
    };

    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data).toHaveProperty('order_id');
    expect(data).toHaveProperty('order_number');
    expect(data).toHaveProperty('message', 'Order created successfully');
  });

  test('GET /api/admin/orders - Get all orders (admin)', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/orders`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    if (data.length > 0) {
      const order = data[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('order_number');
      expect(order).toHaveProperty('customer_name');
      expect(order).toHaveProperty('total_amount');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('restaurant_name');
    }
  });

  test('GET /api/admin/orders with filters - Filter by status', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/orders?status=pending`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    // All orders should have pending status
    data.forEach(order => {
      expect(order.status).toBe('pending');
    });
  });

  test('PUT /api/admin/orders/:id - Update order status', async () => {
    // First create an order
    const orderData = {
      customer_name: 'Test Status Customer',
      customer_phone: '+260 97 000 0001',
      customer_email: 'teststatus@example.com',
      restaurant_id: 1,
      order_type: 'dine_in',
      payment_method: 'cash',
      special_instructions: 'Test status order',
      items: [
        {
          menu_item_id: 1,
          quantity: 1,
          unit_price: 8.00
        }
      ]
    };

    const createResponse = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const createData = await createResponse.json();
    const orderId = createData.order_id;

    // Now update the order status
    const updateData = {
      status: 'preparing',
      estimated_preparation_time: 20
    };

    const updateResponse = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    expect(updateResponse.status).toBe(200);
    
    const responseData = await updateResponse.json();
    expect(responseData).toHaveProperty('message', 'Order updated successfully');
  });

  test('POST /api/reservations - Create new reservation', async () => {
    const reservationData = {
      customer_name: 'Test Reservation Customer',
      customer_phone: '+260 97 000 0002',
      customer_email: 'testreservation@example.com',
      restaurant_id: 1,
      date_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      party_size: 4,
      occasion: 'Test',
      table_preference: 'Window Table',
      dietary_requirements: 'None',
      confirmation_method: 'whatsapp',
      special_requests: 'Test reservation'
    };

    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData)
    });

    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data).toHaveProperty('reservation_id');
    expect(data).toHaveProperty('reservation_number');
    expect(data).toHaveProperty('message', 'Reservation created successfully');
  });

  test('GET /api/admin/reservations - Get all reservations (admin)', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/reservations`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    if (data.length > 0) {
      const reservation = data[0];
      expect(reservation).toHaveProperty('id');
      expect(reservation).toHaveProperty('reservation_number');
      expect(reservation).toHaveProperty('customer_name');
      expect(reservation).toHaveProperty('date_time');
      expect(reservation).toHaveProperty('party_size');
      expect(reservation).toHaveProperty('status');
      expect(reservation).toHaveProperty('restaurant_name');
    }
  });

  test('GET /api/admin/customers - Get all customers (admin)', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/customers`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    if (data.length > 0) {
      const customer = data[0];
      expect(customer).toHaveProperty('id');
      expect(customer).toHaveProperty('name');
      expect(customer).toHaveProperty('phone');
      expect(customer).toHaveProperty('total_orders');
      expect(customer).toHaveProperty('total_spent');
      expect(customer).toHaveProperty('status');
    }
  });

  test('GET /api/admin/analytics/dashboard - Get dashboard analytics', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/analytics/dashboard`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('orderStats');
    expect(data).toHaveProperty('reservationStats');
    expect(data).toHaveProperty('popularItems');
    expect(data).toHaveProperty('dateRange');
    
    // Check orderStats structure
    expect(data.orderStats).toHaveProperty('total_orders');
    expect(data.orderStats).toHaveProperty('total_revenue');
    expect(data.orderStats).toHaveProperty('average_order_value');
    expect(data.orderStats).toHaveProperty('completed_orders');
    
    // Check reservationStats structure
    expect(data.reservationStats).toHaveProperty('total_reservations');
    expect(data.reservationStats).toHaveProperty('confirmed_reservations');
    
    // Check popularItems structure
    expect(Array.isArray(data.popularItems)).toBe(true);
    
    // Check dateRange structure
    expect(data.dateRange).toHaveProperty('from');
    expect(data.dateRange).toHaveProperty('to');
  });

  test('GET /api/blogs - Get all blogs', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/blogs`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    if (data.length > 0) {
      const blog = data[0];
      expect(blog).toHaveProperty('id');
      expect(blog).toHaveProperty('title');
      expect(blog).toHaveProperty('content');
      expect(blog).toHaveProperty('author');
      expect(blog).toHaveProperty('category');
      expect(blog).toHaveProperty('status');
    }
  });

  test('API Error Handling - Invalid endpoint', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/invalid-endpoint`);
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toHaveProperty('error', 'API endpoint not found');
  });

  test('API Error Handling - Invalid menu item ID', async () => {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/admin/menu/999`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' })
    });
    
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Menu item not found');
  });
});
