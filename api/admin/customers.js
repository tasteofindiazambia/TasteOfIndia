// Vercel serverless function for admin customers API
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
      // Get customers
      const { restaurant_id, search, status, limit = 50 } = req.query;

      let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

      if (restaurant_id) {
        query = query.eq('restaurant_id', restaurant_id);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data: customers, error } = await query;

      if (error) {
        console.error('Error fetching customers:', error);
        return res.status(500).json({ error: 'Failed to fetch customers' });
      }

      res.json(customers);
    } else if (req.method === 'POST') {
      // Create new customer
      const { name, phone, email, restaurant_id, location, dietary_requirements, birthday, anniversary, notes } = req.body;

      const { data: customer, error } = await supabase
        .from('customers')
        .insert([{
          name,
          phone,
          email,
          restaurant_id,
          location,
          dietary_requirements,
          birthday,
          anniversary,
          notes
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        return res.status(500).json({ error: 'Failed to create customer' });
      }

      res.status(201).json({
        success: true,
        customer,
        message: 'Customer created successfully'
      });
    } else if (req.method === 'PUT') {
      // Update customer
      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Customer ID is required' });
      }

      const { data: customer, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        return res.status(500).json({ error: 'Failed to update customer' });
      }

      res.json({
        success: true,
        customer,
        message: 'Customer updated successfully'
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
