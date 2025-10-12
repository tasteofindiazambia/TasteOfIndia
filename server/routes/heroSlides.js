import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from '../middleware/auth.js';

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://qslfidheyalqdetiqdbs.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const router = express.Router();

// Get all active hero slides (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('slide_order', { ascending: true });

    if (error) {
      console.error('Error fetching hero slides:', error);
      return res.status(500).json({ error: 'Failed to fetch hero slides' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in hero slides GET:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all hero slides (admin only)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching hero slides for admin...');
    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .select('*')
      .order('slide_order', { ascending: true });

    if (error) {
      console.error('Error fetching hero slides for admin:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        error: 'Failed to fetch hero slides',
        details: error.message,
        hint: error.hint || 'Check if hero_slides table exists'
      });
    }

    console.log('Successfully fetched hero slides:', data?.length || 0, 'slides');
    res.json(data || []);
  } catch (error) {
    console.error('Error in hero slides admin GET:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new hero slide (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      slide_order,
      slide_type,
      title,
      subtitle,
      description,
      background_image_url,
      background_images,
      button_text,
      button_link,
      button_type = 'internal',
      is_active = true
    } = req.body;

    // Validate required fields
    if (!slide_order || !slide_type || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .insert({
        slide_order,
        slide_type,
        title,
        subtitle,
        description,
        background_image_url,
        background_images,
        button_text,
        button_link,
        button_type,
        is_active
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating hero slide:', error);
      return res.status(500).json({ error: 'Failed to create hero slide' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in hero slides POST:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update hero slide (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove id from update data if present
    delete updateData.id;

    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating hero slide:', error);
      return res.status(500).json({ error: 'Failed to update hero slide' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Hero slide not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in hero slides PUT:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete hero slide (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('hero_slides')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting hero slide:', error);
      return res.status(500).json({ error: 'Failed to delete hero slide' });
    }

    res.json({ message: 'Hero slide deleted successfully' });
  } catch (error) {
    console.error('Error in hero slides DELETE:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reorder hero slides (admin only)
router.put('/reorder', authenticateToken, async (req, res) => {
  try {
    const { slides } = req.body; // Array of {id, slide_order}

    if (!Array.isArray(slides)) {
      return res.status(400).json({ error: 'Invalid slides data' });
    }

    // Update each slide's order
    const updatePromises = slides.map(slide => 
      supabaseAdmin
        .from('hero_slides')
        .update({ 
          slide_order: slide.slide_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', slide.id)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Error reordering hero slides:', errors);
      return res.status(500).json({ error: 'Failed to reorder hero slides' });
    }

    res.json({ message: 'Hero slides reordered successfully' });
  } catch (error) {
    console.error('Error in hero slides reorder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
