// Auth API endpoint for admin login
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'taste-of-india-secret-2024';

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
    if (req.method === 'POST') {
      const { username, password } = req.body;

      // Simple admin authentication (in production, use proper hashing)
      if (username === 'admin' && password === 'admin123') {
        // Generate JWT token
        const token = jwt.sign(
          { 
            username: 'admin', 
            role: 'admin',
            id: 1 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          success: true,
          token,
          user: {
            id: 1,
            username: 'admin',
            role: 'admin'
          },
          message: 'Login successful'
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
    } else if (req.method === 'GET') {
      // Token verification endpoint
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
          success: true,
          user: {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
          }
        });
      } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
