import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://qslfidheyalqdetiqdbs.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
export class SupabaseDatabase {
  constructor() {
    this.client = supabase;
  }

  // Generic query method
  async query(sql, params = []) {
    try {
      const { data, error } = await this.client.rpc('execute_sql', {
        query: sql,
        params: params
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
  }

  // Get single row
  async get(sql, params = []) {
    const results = await this.query(sql, params);
    return results?.[0] || null;
  }

  // Get all rows
  async all(sql, params = []) {
    return await this.query(sql, params);
  }

  // Run insert/update/delete
  async run(sql, params = []) {
    return await this.query(sql, params);
  }

  // Transaction support
  async transaction(queries) {
    const results = [];
    
    for (const { sql, params } of queries) {
      const result = await this.run(sql, params);
      results.push(result);
    }
    
    return results;
  }

  // Table-based operations (more Supabase-native approach)
  
  // Restaurants
  async getRestaurants(filters = {}) {
    let query = this.client.from('restaurants').select('*');
    
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getRestaurant(id) {
    const { data, error } = await this.client
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Orders
  async getOrders(filters = {}) {
    let query = this.client.from('orders').select(`
      *,
      restaurants (name, address, phone)
    `);
    
    if (filters.restaurant_id) {
      query = query.eq('restaurant_id', filters.restaurant_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getOrder(id) {
    const { data, error } = await this.client
      .from('orders')
      .select(`
        *,
        restaurants (name, address, phone),
        order_items (
          *,
          menu_items (name, description, price, image_url, spice_level, preparation_time, tags, dynamic_pricing, packaging_price),
          categories (name)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Format the data to match expected structure
    if (data.order_items) {
      data.items = data.order_items.map(item => ({
        ...item,
        menu_item_name: item.menu_items?.name,
        menu_item_description: item.menu_items?.description,
        menu_item_price: item.menu_items?.price,
        menu_item_image: item.menu_items?.image_url,
        spice_level: item.menu_items?.spice_level,
        preparation_time: item.menu_items?.preparation_time,
        tags: item.menu_items?.tags,
        dynamic_pricing: item.menu_items?.dynamic_pricing,
        packaging_price: item.menu_items?.packaging_price,
        category_name: item.categories?.name
      }));
      delete data.order_items;
    }
    
    return data;
  }

  async getOrderByToken(token) {
    const { data, error } = await this.client
      .from('orders')
      .select(`
        *,
        restaurants (name, address, phone),
        order_items (
          *,
          menu_items (name, description, price, image_url, spice_level, preparation_time, tags, dynamic_pricing, packaging_price),
          categories (name)
        )
      `)
      .eq('order_token', token)
      .single();
    
    if (error) throw error;
    
    // Format the data to match expected structure
    if (data.order_items) {
      data.items = data.order_items.map(item => ({
        ...item,
        menu_item_name: item.menu_items?.name,
        menu_item_description: item.menu_items?.description,
        menu_item_price: item.menu_items?.price,
        menu_item_image: item.menu_items?.image_url,
        spice_level: item.menu_items?.spice_level,
        preparation_time: item.menu_items?.preparation_time,
        tags: item.menu_items?.tags,
        dynamic_pricing: item.menu_items?.dynamic_pricing,
        packaging_price: item.menu_items?.packaging_price,
        category_name: item.categories?.name
      }));
      delete data.order_items;
    }
    
    return data;
  }

  // Menu Items
  async getMenuItems(restaurantId) {
    const { data, error } = await this.client
      .from('menu_items')
      .select(`
        *,
        categories (id, name, description, display_order)
      `)
      .eq('restaurant_id', restaurantId)
      .eq('available', true)
      .order('listing_preference')
      .order('name');
    
    if (error) throw error;
    
    // Format data to match expected structure
    return data.map(item => ({
      ...item,
      category_id: item.categories?.id,
      category_name: item.categories?.name,
      category_description: item.categories?.description,
      category_display_order: item.categories?.display_order,
      tags: typeof item.tags === 'string' ? item.tags.split(',').map(tag => tag.trim()) : item.tags,
      availability_status: item.available,
      pricing_type: item.dynamic_pricing ? 'per_gram' : 'fixed'
    }));
  }

  // Customers
  async createCustomer(customerData) {
    const { data, error } = await this.client
      .from('customers')
      .insert(customerData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCustomer(phone, updateData) {
    const { data, error } = await this.client
      .from('customers')
      .update(updateData)
      .eq('phone', phone)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Initialize database (create tables if they don't exist)
  async init() {
    console.log('✅ Supabase client initialized');
    console.log('📍 Project URL:', supabaseUrl);
    
    // Test connection
    try {
      const { data, error } = await this.client
        .from('restaurants')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log('⚠️  Database tables might not exist yet. Please run the SQL schema in Supabase.');
        console.log('📄 Check supabase-schema.sql for the complete schema.');
      } else {
        console.log('✅ Database connection successful');
      }
    } catch (err) {
      console.error('❌ Database connection failed:', err);
    }
  }
}

// Export singleton instance
export default new SupabaseDatabase();