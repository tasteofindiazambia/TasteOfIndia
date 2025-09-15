import Database from '../models/database.js';

const db = new Database();

export const getBranding = async (req, res) => {
  try {
    const branding = await db.get('SELECT * FROM website_branding ORDER BY id DESC LIMIT 1');
    
    if (!branding) {
      // Return default branding if none exists
      const defaultBranding = {
        id: 1,
        logo_url: '/api/placeholder/200/200',
        primary_color: '#f97316',
        secondary_color: '#ea580c',
        tertiary_color: '#dc2626',
        primary_font: 'Inter',
        secondary_font: 'Poppins',
        tertiary_font: 'Roboto',
        updated_at: new Date().toISOString()
      };
      return res.json(defaultBranding);
    }
    
    res.json(branding);
  } catch (error) {
    console.error('Error fetching branding:', error);
    res.status(500).json({ error: 'Failed to fetch branding' });
  }
};

export const updateBranding = async (req, res) => {
  try {
    const { logo_url, primary_color, secondary_color, tertiary_color, primary_font, secondary_font, tertiary_font } = req.body;
    
    // Check if branding exists
    const existingBranding = await db.get('SELECT id FROM website_branding ORDER BY id DESC LIMIT 1');
    
    if (existingBranding) {
      // Update existing branding
      const result = await db.run(
        'UPDATE website_branding SET logo_url = ?, primary_color = ?, secondary_color = ?, tertiary_color = ?, primary_font = ?, secondary_font = ?, tertiary_font = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [logo_url, primary_color, secondary_color, tertiary_color, primary_font, secondary_font, tertiary_font, existingBranding.id]
      );
      
      res.json({ message: 'Branding updated successfully' });
    } else {
      // Create new branding
      const result = await db.run(
        'INSERT INTO website_branding (logo_url, primary_color, secondary_color, tertiary_color, primary_font, secondary_font, tertiary_font) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [logo_url, primary_color, secondary_color, tertiary_color, primary_font, secondary_font, tertiary_font]
      );
      
      res.json({ id: result.id, message: 'Branding created successfully' });
    }
  } catch (error) {
    console.error('Error updating branding:', error);
    res.status(500).json({ error: 'Failed to update branding' });
  }
};

export const resetBranding = async (req, res) => {
  try {
    const defaultBranding = {
      logo_url: '/api/placeholder/200/200',
      primary_color: '#f97316',
      secondary_color: '#ea580c',
      tertiary_color: '#dc2626',
      primary_font: 'Inter',
      secondary_font: 'Poppins',
      tertiary_font: 'Roboto'
    };
    
    // Check if branding exists
    const existingBranding = await db.get('SELECT id FROM website_branding ORDER BY id DESC LIMIT 1');
    
    if (existingBranding) {
      // Update to default values
      await db.run(
        'UPDATE website_branding SET logo_url = ?, primary_color = ?, secondary_color = ?, tertiary_color = ?, primary_font = ?, secondary_font = ?, tertiary_font = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [defaultBranding.logo_url, defaultBranding.primary_color, defaultBranding.secondary_color, defaultBranding.tertiary_color, defaultBranding.primary_font, defaultBranding.secondary_font, defaultBranding.tertiary_font, existingBranding.id]
      );
    } else {
      // Create with default values
      await db.run(
        'INSERT INTO website_branding (logo_url, primary_color, secondary_color, tertiary_color, primary_font, secondary_font, tertiary_font) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [defaultBranding.logo_url, defaultBranding.primary_color, defaultBranding.secondary_color, defaultBranding.tertiary_color, defaultBranding.primary_font, defaultBranding.secondary_font, defaultBranding.tertiary_font]
      );
    }
    
    res.json({ message: 'Branding reset to default values' });
  } catch (error) {
    console.error('Error resetting branding:', error);
    res.status(500).json({ error: 'Failed to reset branding' });
  }
};
