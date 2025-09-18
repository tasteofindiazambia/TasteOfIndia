import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ootznaeeshzasqkjersy.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdHpuYWVlc2h6YXNxa2plcnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDc1MDcsImV4cCI6MjA3Mzc4MzUwN30.-aOSSovEXRXCM0imIxXad1R96iDVB6nFgPG5PcthI3Y';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { restaurant_id } = req.query;

  try {
    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

    // Set up Supabase real-time subscription
    const channel = supabase
      .channel('admin-updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders',
          filter: restaurant_id ? `restaurant_id=eq.${restaurant_id}` : undefined
        }, 
        (payload) => {
          console.log('New order received:', payload);
          res.write(`data: ${JSON.stringify({ 
            type: 'new_order', 
            order: payload.new,
            timestamp: new Date().toISOString()
          })}\n\n`);
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: restaurant_id ? `restaurant_id=eq.${restaurant_id}` : undefined
        }, 
        (payload) => {
          console.log('Order updated:', payload);
          res.write(`data: ${JSON.stringify({ 
            type: 'order_updated', 
            order: payload.new,
            timestamp: new Date().toISOString()
          })}\n\n`);
        }
      )
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'reservations',
          filter: restaurant_id ? `restaurant_id=eq.${restaurant_id}` : undefined
        }, 
        (payload) => {
          console.log('New reservation received:', payload);
          res.write(`data: ${JSON.stringify({ 
            type: 'new_reservation', 
            reservation: payload.new,
            timestamp: new Date().toISOString()
          })}\n\n`);
        }
      )
      .subscribe();

    // Handle client disconnect
    req.on('close', () => {
      console.log('Client disconnected from SSE stream');
      supabase.removeChannel(channel);
    });

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);

    // Clean up on disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
      supabase.removeChannel(channel);
    });

  } catch (error) {
    console.error('SSE stream error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream error occurred' })}\n\n`);
  }
}
