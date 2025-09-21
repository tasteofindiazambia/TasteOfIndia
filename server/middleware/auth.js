import jwt from 'jsonwebtoken';
import Database from '../models/database.js';

const db = Database;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Middleware to authenticate JWT tokens
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await db.get(
      'SELECT id, username, email, role, is_active FROM admin_users WHERE id = ?',
      [decoded.id]
    );
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    // Attach user info to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user has admin role
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.get(
      'SELECT id, username, email, role, is_active FROM admin_users WHERE id = ?',
      [decoded.id]
    );
    
    if (user && user.is_active) {
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    next();
  }
};

// Legacy middleware for backward compatibility (deprecated)
export const authenticateAdmin = (req, res, next) => {
  console.warn('authenticateAdmin is deprecated, use authenticateToken instead');
  authenticateToken(req, res, next);
};

// Legacy middleware for backward compatibility (deprecated)
export const requireAuth = (req, res, next) => {
  console.warn('requireAuth is deprecated, use authenticateToken instead');
  authenticateToken(req, res, next);
};