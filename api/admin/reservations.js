// Vercel serverless function for admin reservations API
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
      const { restaurant_id, status, date_from, date_to } = req.query;

      let query = supabase
        .from('reservations')
        .select('*')
        .order('date_time', { ascending: false });

      if (restaurant_id) {
        query = query.eq('restaurant_id', restaurant_id);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (date_from) {
        query = query.gte('date_time', date_from);
      }

      if (date_to) {
        query = query.lte('date_time', date_to);
      }

      const { data: reservations, error } = await query;

      if (error) {
        console.error('Error fetching reservations:', error);
        return res.status(500).json({ error: 'Failed to fetch reservations' });
      }

      res.json(reservations);
    } else if (req.method === 'POST') {
      // Create new reservation
      const { customer_name, customer_phone, customer_email, restaurant_id, date_time, party_size, occasion, table_preference, dietary_requirements, special_requests } = req.body;

      // Generate reservation number
      const reservation_number = `RES-${Date.now()}`;

      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert([{
          reservation_number,
          customer_name,
          customer_phone,
          customer_email,
          restaurant_id,
          date_time,
          party_size,
          occasion,
          table_preference,
          dietary_requirements,
          special_requests
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating reservation:', error);
        return res.status(500).json({ error: 'Failed to create reservation' });
      }

      res.status(201).json({
        success: true,
        reservation_id: reservation.id,
        reservation_number,
        message: 'Reservation created successfully'
      });
    } else if (req.method === 'PUT') {
      // Update reservation
      const { id, status, notes } = req.body;

      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reservation:', error);
        return res.status(500).json({ error: 'Failed to update reservation' });
      }

      res.json({
        success: true,
        reservation,
        message: 'Reservation updated successfully'
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
