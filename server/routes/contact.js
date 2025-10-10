import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qslfidheyalqdetiqdbs.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE';

const supabase = createClient(supabaseUrl, supabaseKey);

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};
    if (!name || (!email && !phone)) {
      return res.status(400).json({ error: 'Please provide a name and either email or phone.' });
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, phone, subject, message }])
      .select()
      .single();

    if (error) {
      console.error('Contact insert error:', error);
      return res.status(500).json({ error: 'Failed to save message' });
    }

    return res.status(201).json({ success: true, message: 'Message sent', data });
  } catch (e) {
    console.error('Contact route exception:', e);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;


