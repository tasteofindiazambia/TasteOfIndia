import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { testDb } from '../setup.js';

describe('Database Integration Tests', () => {
  
  test('Database schema is correctly created', async () => {
    const db = testDb;
    const all = promisify(db.all.bind(db));
    
    // Check that all required tables exist
    const tables = await all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    const tableNames = tables.map(t => t.name);
    
    expect(tableNames).toContain('restaurants');
    expect(tableNames).toContain('categories');
    expect(tableNames).toContain('menu_items');
    expect(tableNames).toContain('orders');
    expect(tableNames).toContain('order_items');
    expect(tableNames).toContain('reservations');
    expect(tableNames).toContain('customers');
    expect(tableNames).toContain('analytics');
  });

  test('Restaurants table structure is correct', async () => {
    const db = testDb;
    const all = promisify(db.all.bind(db));
    
    const columns = await all(`
      PRAGMA table_info(restaurants)
    `);
    
    const columnNames = columns.map(c => c.name);
    
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('name');
    expect(columnNames).toContain('address');
    expect(columnNames).toContain('phone');
    expect(columnNames).toContain('email');
    expect(columnNames).toContain('hours');
    expect(columnNames).toContain('is_active');
    expect(columnNames).toContain('created_at');
    expect(columnNames).toContain('updated_at');
  });

  test('Menu items table structure is correct', async () => {
    const db = testDb;
    const all = promisify(db.all.bind(db));
    
    const columns = await all(`
      PRAGMA table_info(menu_items)
    `);
    
    const columnNames = columns.map(c => c.name);
    
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('name');
    expect(columnNames).toContain('description');
    expect(columnNames).toContain('price');
    expect(columnNames).toContain('category_id');
    expect(columnNames).toContain('restaurant_id');
    expect(columnNames).toContain('image_url');
    expect(columnNames).toContain('available');
    expect(columnNames).toContain('featured');
    expect(columnNames).toContain('tags');
    expect(columnNames).toContain('spice_level');
    expect(columnNames).toContain('pieces_count');
    expect(columnNames).toContain('preparation_time');
    expect(columnNames).toContain('is_vegetarian');
    expect(columnNames).toContain('is_vegan');
    expect(columnNames).toContain('is_gluten_free');
    expect(columnNames).toContain('created_at');
    expect(columnNames).toContain('updated_at');
  });

  test('Orders table structure is correct', async () => {
    const db = testDb;
    const all = promisify(db.all.bind(db));
    
    const columns = await all(`
      PRAGMA table_info(orders)
    `);
    
    const columnNames = columns.map(c => c.name);
    
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('order_number');
    expect(columnNames).toContain('customer_name');
    expect(columnNames).toContain('customer_phone');
    expect(columnNames).toContain('customer_email');
    expect(columnNames).toContain('restaurant_id');
    expect(columnNames).toContain('total_amount');
    expect(columnNames).toContain('status');
    expect(columnNames).toContain('order_type');
    expect(columnNames).toContain('payment_method');
    expect(columnNames).toContain('special_instructions');
    expect(columnNames).toContain('estimated_preparation_time');
    expect(columnNames).toContain('created_at');
    expect(columnNames).toContain('updated_at');
  });

  test('Reservations table structure is correct', async () => {
    const db = testDb;
    const all = promisify(db.all.bind(db));
    
    const columns = await all(`
      PRAGMA table_info(reservations)
    `);
    
    const columnNames = columns.map(c => c.name);
    
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('reservation_number');
    expect(columnNames).toContain('customer_name');
    expect(columnNames).toContain('customer_phone');
    expect(columnNames).toContain('customer_email');
    expect(columnNames).toContain('restaurant_id');
    expect(columnNames).toContain('date_time');
    expect(columnNames).toContain('party_size');
    expect(columnNames).toContain('status');
    expect(columnNames).toContain('occasion');
    expect(columnNames).toContain('table_preference');
    expect(columnNames).toContain('dietary_requirements');
    expect(columnNames).toContain('confirmation_method');
    expect(columnNames).toContain('special_requests');
    expect(columnNames).toContain('notes');
    expect(columnNames).toContain('created_at');
    expect(columnNames).toContain('updated_at');
  });

  test('Foreign key relationships work correctly', async () => {
    const db = testDb;
    const run = promisify(db.run.bind(db));
    const get = promisify(db.get.bind(db));
    
    // Test menu_items -> categories relationship
    const categoryResult = await run(`
      INSERT INTO categories (name, description, restaurant_id, display_order) 
      VALUES ('Test Category', 'Test description', 1, 1)
    `);
    const categoryId = categoryResult.lastID;
    
    const menuItemResult = await run(`
      INSERT INTO menu_items (name, description, price, category_id, restaurant_id, available) 
      VALUES ('Test Item', 'Test description', 10.00, ?, 1, 1)
    `, categoryId);
    const menuItemId = menuItemResult.lastID;
    
    // Verify the relationship
    const menuItem = await get(`
      SELECT mi.*, c.name as category_name 
      FROM menu_items mi 
      JOIN categories c ON mi.category_id = c.id 
      WHERE mi.id = ?
    `, menuItemId);
    
    expect(menuItem).toBeTruthy();
    expect(menuItem.category_name).toBe('Test Category');
    
    // Test orders -> restaurants relationship
    const orderResult = await run(`
      INSERT INTO orders (order_number, customer_name, customer_phone, restaurant_id, total_amount, status) 
      VALUES ('TEST-001', 'Test Customer', '+260123456789', 1, 25.00, 'pending')
    `);
    const orderId = orderResult.lastID;
    
    const order = await get(`
      SELECT o.*, r.name as restaurant_name 
      FROM orders o 
      JOIN restaurants r ON o.restaurant_id = r.id 
      WHERE o.id = ?
    `, orderId);
    
    expect(order).toBeTruthy();
    expect(order.restaurant_name).toBe('Test Restaurant - Manda Hill');
    
    // Test order_items -> menu_items relationship
    const orderItemResult = await run(`
      INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) 
      VALUES (?, ?, 2, 10.00, 20.00)
    `, orderId, menuItemId);
    
    const orderItem = await get(`
      SELECT oi.*, mi.name as menu_item_name 
      FROM order_items oi 
      JOIN menu_items mi ON oi.menu_item_id = mi.id 
      WHERE oi.id = ?
    `, orderItemResult.lastID);
    
    expect(orderItem).toBeTruthy();
    expect(orderItem.menu_item_name).toBe('Test Item');
  });

  test('Data persistence across operations', async () => {
    const db = testDb;
    const run = promisify(db.run.bind(db));
    const get = promisify(db.get.bind(db));
    
    // Create test data
    const restaurantResult = await run(`
      INSERT INTO restaurants (name, address, phone, email, hours) 
      VALUES ('Test Restaurant', 'Test Address', '+260123456789', 'test@example.com', '{"monday": "11:00-22:00"}')
    `);
    const restaurantId = restaurantResult.lastID;
    
    // Verify data persists
    const restaurant = await get('SELECT * FROM restaurants WHERE id = ?', restaurantId);
    expect(restaurant).toBeTruthy();
    expect(restaurant.name).toBe('Test Restaurant');
    
    // Update data
    await run(`
      UPDATE restaurants 
      SET name = 'Updated Restaurant', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, restaurantId);
    
    // Verify updates persist
    const updatedRestaurant = await get('SELECT * FROM restaurants WHERE id = ?', restaurantId);
    expect(updatedRestaurant.name).toBe('Updated Restaurant');
    expect(updatedRestaurant.updated_at).not.toBe(restaurant.created_at);
  });

  test('Database constraints work correctly', async () => {
    const db = testDb;
    const run = promisify(db.run.bind(db));
    
    // Test NOT NULL constraint
    await expect(run(`
      INSERT INTO restaurants (name, address, phone) 
      VALUES (NULL, 'Test Address', '+260123456789')
    `)).rejects.toThrow();
    
    // Test UNIQUE constraint on order_number
    await run(`
      INSERT INTO orders (order_number, customer_name, customer_phone, restaurant_id, total_amount, status) 
      VALUES ('UNIQUE-001', 'Test Customer', '+260123456789', 1, 25.00, 'pending')
    `);
    
    await expect(run(`
      INSERT INTO orders (order_number, customer_name, customer_phone, restaurant_id, total_amount, status) 
      VALUES ('UNIQUE-001', 'Another Customer', '+260987654321', 1, 30.00, 'pending')
    `)).rejects.toThrow();
    
    // Test CHECK constraint on price
    await expect(run(`
      INSERT INTO menu_items (name, description, price, category_id, restaurant_id, available) 
      VALUES ('Test Item', 'Test description', -10.00, 1, 1, 1)
    `)).rejects.toThrow();
  });

  test('Database indexes are created correctly', async () => {
    const db = testDb;
    const all = promisify(db.all.bind(db));
    
    const indexes = await all(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name NOT LIKE 'sqlite_%'
    `);
    
    const indexNames = indexes.map(i => i.name);
    
    // Check for important indexes
    expect(indexNames.some(name => name.includes('restaurant_id'))).toBe(true);
    expect(indexNames.some(name => name.includes('category_id'))).toBe(true);
    expect(indexNames.some(name => name.includes('order_number'))).toBe(true);
    expect(indexNames.some(name => name.includes('reservation_number'))).toBe(true);
  });

  test('Database transactions work correctly', async () => {
    const db = testDb;
    const run = promisify(db.run.bind(db));
    const get = promisify(db.get.bind(db));
    
    // Start transaction
    await run('BEGIN TRANSACTION');
    
    try {
      // Create order
      const orderResult = await run(`
        INSERT INTO orders (order_number, customer_name, customer_phone, restaurant_id, total_amount, status) 
        VALUES ('TRANS-001', 'Test Customer', '+260123456789', 1, 25.00, 'pending')
      `);
      const orderId = orderResult.lastID;
      
      // Create order items
      await run(`
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) 
        VALUES (?, 1, 2, 10.00, 20.00)
      `, orderId);
      
      await run(`
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) 
        VALUES (?, 2, 1, 5.00, 5.00)
      `, orderId);
      
      // Commit transaction
      await run('COMMIT');
      
      // Verify data is persisted
      const order = await get('SELECT * FROM orders WHERE id = ?', orderId);
      expect(order).toBeTruthy();
      expect(order.order_number).toBe('TRANS-001');
      
    } catch (error) {
      // Rollback on error
      await run('ROLLBACK');
      throw error;
    }
  });

  test('Database performance with large datasets', async () => {
    const db = testDb;
    const run = promisify(db.run.bind(db));
    const all = promisify(db.all.bind(db));
    
    // Create multiple menu items
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
      await run(`
        INSERT INTO menu_items (name, description, price, category_id, restaurant_id, available) 
        VALUES (?, 'Test description', 10.00, 1, 1, 1)
      `, `Test Item ${i}`);
    }
    
    const insertTime = Date.now() - startTime;
    expect(insertTime).toBeLessThan(5000); // Should complete within 5 seconds
    
    // Test query performance
    const queryStartTime = Date.now();
    const items = await all(`
      SELECT * FROM menu_items 
      WHERE restaurant_id = 1 AND available = 1 
      ORDER BY name
    `);
    const queryTime = Date.now() - queryStartTime;
    
    expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
    expect(items.length).toBeGreaterThanOrEqual(100);
  });

  test('Database cleanup and maintenance', async () => {
    const db = testDb;
    const run = promisify(db.run.bind(db));
    const get = promisify(db.get.bind(db));
    
    // Test VACUUM command
    await run('VACUUM');
    
    // Test ANALYZE command
    await run('ANALYZE');
    
    // Verify database integrity
    const integrityCheck = await get('PRAGMA integrity_check');
    expect(integrityCheck).toBe('ok');
    
    // Test foreign key constraints
    const foreignKeys = await get('PRAGMA foreign_keys');
    expect(foreignKeys).toBe(1);
  });

  test('Database backup and restore simulation', async () => {
    const db = testDb;
    const all = promisify(db.all.bind(db));
    const run = promisify(db.run.bind(db));
    
    // Get current data count
    const restaurants = await all('SELECT COUNT(*) as count FROM restaurants');
    const menuItems = await all('SELECT COUNT(*) as count FROM menu_items');
    const orders = await all('SELECT COUNT(*) as count FROM orders');
    
    const originalCounts = {
      restaurants: restaurants[0].count,
      menuItems: menuItems[0].count,
      orders: orders[0].count
    };
    
    // Simulate data loss by deleting some records
    await run('DELETE FROM menu_items WHERE id > 2');
    
    // Verify data loss
    const remainingMenuItems = await all('SELECT COUNT(*) as count FROM menu_items');
    expect(remainingMenuItems[0].count).toBeLessThan(originalCounts.menuItems);
    
    // Simulate restore by re-inserting data
    await run(`
      INSERT INTO menu_items (name, description, price, category_id, restaurant_id, available) 
      VALUES ('Restored Item', 'Restored description', 15.00, 1, 1, 1)
    `);
    
    // Verify restore
    const restoredMenuItems = await all('SELECT COUNT(*) as count FROM menu_items');
    expect(restoredMenuItems[0].count).toBeGreaterThan(remainingMenuItems[0].count);
  });
});
