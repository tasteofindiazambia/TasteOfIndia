// Database configuration for different environments
import { createClient } from '@supabase/supabase-js';

let db;

if (process.env.NODE_ENV === 'production') {
  // Production: Use Supabase PostgreSQL
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Create a database adapter for Supabase
    db = {
      async get(sql, params = []) {
        // Convert SQLite-style queries to Supabase queries
        if (sql.includes('SELECT * FROM restaurants WHERE is_active = 1')) {
          const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('is_active', true)
            .order('name');
          if (error) throw error;
          return data?.[0] || null;
        }
        
        if (sql.includes('SELECT * FROM restaurants WHERE id = ?')) {
          const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', params[0])
            .eq('is_active', true)
            .single();
          if (error) throw error;
          return data;
        }
        
        // Add more query patterns as needed
        throw new Error('Query not implemented for Supabase');
      },
      
      async all(sql, params = []) {
        if (sql.includes('SELECT * FROM restaurants WHERE is_active = 1')) {
          const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('is_active', true)
            .order('name');
          if (error) throw error;
          return data || [];
        }
        
        if (sql.includes('SELECT c.*, json_group_array')) {
          // Complex menu query - simplified for Supabase
          const { data: categories, error: catError } = await supabase
            .from('categories')
            .select(`
              *,
              menu_items (*)
            `)
            .eq('restaurant_id', params[0])
            .eq('is_active', true)
            .order('display_order');
            
          if (catError) throw catError;
          
          // Transform the data to match the expected format
          return categories.map(cat => ({
            ...cat,
            items: cat.menu_items || []
          }));
        }
        
        throw new Error('Query not implemented for Supabase');
      },
      
      async run(sql, params = []) {
        if (sql.includes('INSERT INTO orders')) {
          const { data, error } = await supabase
            .from('orders')
            .insert({
              order_number: params[0],
              customer_name: params[1],
              customer_phone: params[2],
              customer_email: params[3],
              restaurant_id: params[4],
              total_amount: params[5],
              order_type: params[6],
              payment_method: params[7],
              special_instructions: params[8]
            })
            .select()
            .single();
          if (error) throw error;
          return { lastID: data.id };
        }
        
        throw new Error('Query not implemented for Supabase');
      }
    };
  } else {
    // Fallback: Use in-memory database for demo
    console.warn('No Supabase credentials found, using in-memory database');
    db = createInMemoryDatabase();
  }
} else {
  // Development: Use SQLite
  try {
    const sqlite3 = await import('sqlite3');
    const { open } = await import('sqlite');
    
    db = await open({
      filename: './database/restaurant.db',
      driver: sqlite3.Database
    });
  } catch (error) {
    console.warn('SQLite not available, using in-memory database');
    db = createInMemoryDatabase();
  }
}

// In-memory database fallback
function createInMemoryDatabase() {
  const data = {
    restaurants: [
      {
        id: 1,
        name: 'Taste of India - Manda Hill',
        address: 'Manda Hill Shopping Centre, Lusaka',
        phone: '+260 97 123 4567',
        email: 'manda@tasteofindia.co.zm',
        hours: '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "11:00-21:00"}',
        is_active: 1
      },
      {
        id: 2,
        name: 'Taste of India - Parirenyetwa',
        address: 'Parirenyetwa Rd, Lusaka 10101, Zambia',
        phone: '+260 77 3219999',
        email: 'parirenyetwa@tasteofindia.co.zm',
        hours: '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "11:00-21:00"}',
        is_active: 1
      }
    ],
    categories: [
      { id: 1, name: 'Appetizers', description: 'Start your meal with our delicious appetizers', restaurant_id: 1, display_order: 1, is_active: 1 },
      { id: 2, name: 'Main Courses', description: 'Hearty main dishes to satisfy your hunger', restaurant_id: 1, display_order: 2, is_active: 1 },
      { id: 3, name: 'Beverages', description: 'Refreshing drinks to complement your meal', restaurant_id: 1, display_order: 3, is_active: 1 },
      { id: 4, name: 'Desserts', description: 'Sweet endings to your dining experience', restaurant_id: 1, display_order: 4, is_active: 1 }
    ],
    menu_items: [
      { id: 1, name: 'Samosas', description: 'Crispy triangular pastries filled with spiced potatoes and peas', price: 8.00, category_id: 1, restaurant_id: 1, available: 1, featured: 1, spice_level: 'mild', pieces_count: 2, preparation_time: 15, is_vegetarian: 1 },
      { id: 2, name: 'Chicken Biryani', description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices', price: 25.00, category_id: 2, restaurant_id: 1, available: 1, featured: 1, spice_level: 'medium', pieces_count: 1, preparation_time: 25, is_vegetarian: 0 },
      { id: 3, name: 'Butter Chicken', description: 'Tender chicken in a rich tomato and cream sauce', price: 22.00, category_id: 2, restaurant_id: 1, available: 1, featured: 1, spice_level: 'mild', pieces_count: 1, preparation_time: 20, is_vegetarian: 0 },
      { id: 4, name: 'Mango Lassi', description: 'Refreshing yogurt drink with sweet mango', price: 6.00, category_id: 3, restaurant_id: 1, available: 1, featured: 0, spice_level: 'mild', pieces_count: 1, preparation_time: 5, is_vegetarian: 1 },
      { id: 5, name: 'Gulab Jamun', description: 'Soft milk dumplings in rose-flavored syrup', price: 8.00, category_id: 4, restaurant_id: 1, available: 1, featured: 0, spice_level: 'mild', pieces_count: 3, preparation_time: 10, is_vegetarian: 1 }
    ]
  };

  return {
    async get(sql, params = []) {
      if (sql.includes('SELECT * FROM restaurants WHERE id = ?')) {
        return data.restaurants.find(r => r.id === params[0] && r.is_active === 1);
      }
      return null;
    },
    
    async all(sql, params = []) {
      if (sql.includes('SELECT * FROM restaurants WHERE is_active = 1')) {
        return data.restaurants.filter(r => r.is_active === 1);
      }
      
      if (sql.includes('SELECT c.*, json_group_array')) {
        // Return categories with menu items
        return data.categories
          .filter(c => c.restaurant_id === params[0] && c.is_active === 1)
          .map(category => ({
            ...category,
            items: data.menu_items.filter(item => 
              item.category_id === category.id && 
              item.restaurant_id === params[0] && 
              item.available === 1
            )
          }));
      }
      
      return [];
    },
    
    async run(sql, params = []) {
      // For demo purposes, just return a mock result
      return { lastID: Date.now(), changes: 1 };
    }
  };
}

export default db;
