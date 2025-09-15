// Simple authentication middleware
export const authenticateAdmin = (req, res, next) => {
  const { username, password } = req.body;
  
  // Simple hardcoded check - in production, use proper authentication
  if (username === 'admin' && password === 'admin123') {
    req.user = { username, role: 'admin' };
    next();
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

// Middleware to check if user is authenticated (for protected routes)
export const requireAuth = (req, res, next) => {
  // In a real app, you'd check JWT tokens or session
  // For now, we'll skip this since we don't have proper auth setup
  next();
};
