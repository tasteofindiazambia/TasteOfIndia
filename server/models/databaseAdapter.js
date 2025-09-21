import Database from './database.js';
import { SupabaseDatabase } from '../../lib/supabase.js';

// Database adapter that switches between SQLite (dev) and Supabase (production)
class DatabaseAdapter {
  constructor() {
    // Use Supabase in production, SQLite in development
    this.useSupabase = process.env.NODE_ENV === 'production' || process.env.USE_SUPABASE === 'true';
    
    if (this.useSupabase) {
      console.log('🔄 Using Supabase database (production mode)');
      this.db = new SupabaseDatabase();
    } else {
      console.log('🔄 Using SQLite database (development mode)');
      this.db = Database;
    }
  }

  async init() {
    return await this.db.init();
  }

  // Query methods - delegate to the appropriate database
  async query(sql, params = []) {
    return await this.db.query(sql, params);
  }

  async get(sql, params = []) {
    return await this.db.get(sql, params);
  }

  async all(sql, params = []) {
    return await this.db.all(sql, params);
  }

  async run(sql, params = []) {
    return await this.db.run(sql, params);
  }

  async transaction(queries) {
    return await this.db.transaction(queries);
  }

  // High-level methods that work with both databases
  async getRestaurants(filters = {}) {
    if (this.useSupabase) {
      return await this.db.getRestaurants(filters);
    } else {
      // SQLite implementation
      let sql = 'SELECT * FROM restaurants WHERE 1=1';
      let params = [];
      
      if (filters.is_active !== undefined) {
        sql += ' AND is_active = ?';
        params.push(filters.is_active === 'false' ? 0 : 1);
      }
      
      sql += ' ORDER BY name';
      return await this.db.all(sql, params);
    }
  }

  async getRestaurant(id) {
    if (this.useSupabase) {
      return await this.db.getRestaurant(id);
    } else {
      return await this.db.get('SELECT * FROM restaurants WHERE id = ? AND is_active = 1', [id]);
    }
  }

  async getOrders(filters = {}) {
    if (this.useSupabase) {
      return await this.db.getOrders(filters);
    } else {
      // SQLite implementation
      let sql = `
        SELECT 
          o.*,
          r.name as restaurant_name,
          r.address as restaurant_address,
          r.phone as restaurant_phone
        FROM orders o
        LEFT JOIN restaurants r ON o.restaurant_id = r.id
        WHERE 1=1
      `;
      let params = [];
      
      if (filters.restaurant_id) {
        sql += ' AND o.restaurant_id = ?';
        params.push(filters.restaurant_id);
      }
      if (filters.status) {
        sql += ' AND o.status = ?';
        params.push(filters.status);
      }
      
      sql += ' ORDER BY o.created_at DESC';
      return await this.db.all(sql, params);
    }
  }

  async getOrder(id) {
    if (this.useSupabase) {
      return await this.db.getOrder(id);
    } else {
      // SQLite implementation
      const order = await this.db.get(`
        SELECT 
          o.*,
          r.name as restaurant_name,
          r.address as restaurant_address,
          r.phone as restaurant_phone
        FROM orders o
        LEFT JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.id = ?
      `, [id]);

      if (!order) return null;

      // Get order items
      const orderItems = await this.db.all(`
        SELECT 
          oi.*,
          mi.name as menu_item_name,
          mi.description as menu_item_description,
          mi.price as menu_item_price,
          mi.image_url as menu_item_image,
          mi.spice_level,
          mi.preparation_time,
          mi.tags,
          mi.dynamic_pricing,
          mi.packaging_price,
          c.name as category_name
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
        LEFT JOIN categories c ON mi.category_id = c.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      order.items = orderItems;
      return order;
    }
  }

  async getOrderByToken(token) {
    if (this.useSupabase) {
      return await this.db.getOrderByToken(token);
    } else {
      // SQLite implementation
      const order = await this.db.get(`
        SELECT 
          o.*,
          r.name as restaurant_name,
          r.address as restaurant_address,
          r.phone as restaurant_phone
        FROM orders o
        LEFT JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.order_token = ?
      `, [token]);

      if (!order) return null;

      // Get order items
      const orderItems = await this.db.all(`
        SELECT 
          oi.*,
          mi.name as menu_item_name,
          mi.description as menu_item_description,
          mi.price as menu_item_price,
          mi.image_url as menu_item_image,
          mi.spice_level,
          mi.preparation_time,
          mi.tags,
          mi.dynamic_pricing,
          mi.packaging_price,
          c.name as category_name
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
        LEFT JOIN categories c ON mi.category_id = c.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      order.items = orderItems;
      return order;
    }
  }

  async getMenuItems(restaurantId) {
    if (this.useSupabase) {
      return await this.db.getMenuItems(restaurantId);
    } else {
      // SQLite implementation
      const menuItems = await this.db.all(`
        SELECT 
          mi.id,
          mi.name,
          mi.description,
          mi.price,
          mi.image_url,
          mi.available,
          mi.featured,
          mi.tags,
          mi.spice_level,
          mi.pieces_count,
          mi.preparation_time,
          mi.is_vegetarian,
          mi.is_vegan,
          mi.is_gluten_free,
          mi.dynamic_pricing,
          mi.packaging_price,
          mi.listing_preference,
          c.id as category_id,
          c.name as category_name,
          c.description as category_description,
          c.display_order as category_display_order
        FROM menu_items mi
        LEFT JOIN categories c ON mi.category_id = c.id
        WHERE mi.restaurant_id = ? AND mi.available = 1 AND c.is_active = 1
        ORDER BY 
          CASE mi.listing_preference 
            WHEN 'high' THEN 1 
            WHEN 'mid' THEN 2 
            WHEN 'low' THEN 3 
            ELSE 2 
          END,
          c.display_order, 
          c.name, 
          mi.name
      `, [restaurantId]);

      return menuItems.map(item => ({
        ...item,
        tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
        availability_status: item.available,
        pricing_type: item.dynamic_pricing ? 'per_gram' : 'fixed'
      }));
    }
  }

  async createCustomer(customerData) {
    if (this.useSupabase) {
      return await this.db.createCustomer(customerData);
    } else {
      // SQLite implementation - delegate to existing customer service logic
      const { name, phone, email, source } = customerData;
      
      // Check if customer exists
      const existingCustomer = await this.db.get('SELECT * FROM customers WHERE phone = ?', [phone]);
      
      if (existingCustomer) {
        // Update existing customer
        const updateData = {
          name,
          email: email || existingCustomer.email,
          total_orders: existingCustomer.total_orders + 1,
          last_order_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await this.db.run(`
          UPDATE customers SET 
            name = ?, email = ?, total_orders = ?, last_order_date = ?, updated_at = ?
          WHERE phone = ?
        `, [updateData.name, updateData.email, updateData.total_orders, updateData.last_order_date, updateData.updated_at, phone]);
        
        return { ...existingCustomer, ...updateData };
      } else {
        // Create new customer
        const result = await this.db.run(`
          INSERT INTO customers (name, phone, email, total_orders, last_order_date, created_at, updated_at)
          VALUES (?, ?, ?, 1, ?, ?, ?)
        `, [name, phone, email, new Date().toISOString(), new Date().toISOString(), new Date().toISOString()]);
        
        return { id: result.lastID, name, phone, email, total_orders: 1 };
      }
    }
  }
}

// Export singleton instance
export default new DatabaseAdapter();
