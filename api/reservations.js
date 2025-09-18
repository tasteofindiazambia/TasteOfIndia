// Vercel serverless function for reservations API
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
      // Get reservations
      const { restaurant_id, date, status } = req.query;

      let query = supabase
        .from('reservations')
        .select('*')
        .eq('restaurant_id', restaurant_id)
        .order('date_time', { ascending: false });

      if (date) {
        query = query.eq('date', date);
      }

      if (status) {
        query = query.eq('status', status);
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

      // Validate required fields
      if (!customer_name || !customer_phone || !restaurant_id || !date_time || !party_size) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate reservation number
      const reservation_number = `RES-${Date.now()}`;

      // Convert date_time to proper format if needed
      let formattedDateTime = date_time;
      if (typeof date_time === 'string' && !date_time.includes('T')) {
        // If it's a date string without time, add default time
        formattedDateTime = new Date(date_time).toISOString();
      }

      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert([{
          reservation_number,
          customer_name,
          customer_phone,
          customer_email,
          restaurant_id: parseInt(restaurant_id),
          date_time: formattedDateTime,
          party_size: parseInt(party_size),
          occasion,
          table_preference,
          dietary_requirements,
          special_requests
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating reservation:', error);
        return res.status(500).json({ error: 'Failed to create reservation', details: error.message });
      }

      res.status(201).json({
        success: true,
        reservation_id: reservation.id,
        reservation_number,
        message: 'Reservation created successfully'
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
