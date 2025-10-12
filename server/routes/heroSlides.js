import express from 'express';
import { supabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

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
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('slide_order', { ascending: true });

    if (error) {
      console.error('Error fetching hero slides for admin:', error);
      return res.status(500).json({ error: 'Failed to fetch hero slides' });
    }

    res.json(data);
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

    const { data, error } = await supabase
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

    const { data, error } = await supabase
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

    const { error } = await supabase
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
      supabase
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
