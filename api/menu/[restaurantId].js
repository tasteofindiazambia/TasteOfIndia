import db from '../../lib/database.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { restaurantId } = req.query;
      
      // Get categories with menu items
      const categories = await db.all(`
        SELECT c.*, 
               json_group_array(
                 json_object(
                   'id', mi.id,
                   'name', mi.name,
                   'description', mi.description,
                   'price', mi.price,
                   'image_url', mi.image_url,
                   'available', mi.available,
                   'featured', mi.featured,
                   'tags', mi.tags,
                   'spice_level', mi.spice_level,
                   'pieces_count', mi.pieces_count,
                   'preparation_time', mi.preparation_time,
                   'is_vegetarian', mi.is_vegetarian,
                   'is_vegan', mi.is_vegan,
                   'is_gluten_free', mi.is_gluten_free
                 )
               ) as items
        FROM categories c
        LEFT JOIN menu_items mi ON c.id = mi.category_id AND mi.available = 1
        WHERE c.restaurant_id = ? AND c.is_active = 1
        GROUP BY c.id
        ORDER BY c.display_order, c.name
      `, [restaurantId]);

      res.status(200).json(categories);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
}
