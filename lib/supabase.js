import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
export class Database {
  constructor() {
    this.client = supabase;
  }

  // Generic query methods
  async query(sql, params = []) {
    try {
      // For Supabase, we'll use their client methods instead of raw SQL
      // This is a simplified version - in production, you'd want to use Supabase's query builder
      const { data, error } = await this.client.rpc('execute_sql', { 
        sql, 
        params 
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async get(sql, params = []) {
    const results = await this.query(sql, params);
    return results?.[0] || null;
  }

  async all(sql, params = []) {
    return await this.query(sql, params);
  }

  async run(sql, params = []) {
    const results = await this.query(sql, params);
    return {
      lastID: results?.insertId || results?.id || null,
      changes: results?.affectedRows || 0
    };
  }
}

// For development, we'll use a fallback to SQLite
let db;
if (process.env.NODE_ENV === 'production' && process.env.SUPABASE_URL) {
  // Use Supabase in production
  db = new Database();
} else {
  // Use SQLite in development
  const sqlite3 = await import('sqlite3');
  const { open } = await import('sqlite');
  
  db = await open({
    filename: './database/restaurant.db',
    driver: sqlite3.Database
  });
}

export default db;
