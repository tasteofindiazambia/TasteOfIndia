import Database from '../models/database.js';

const db = new Database();

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await db.get(
      'SELECT * FROM admin_users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // In a real app, you'd generate a JWT token here
    res.json({ 
      message: 'Login successful',
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await db.get(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const result = await db.run(
      'INSERT INTO admin_users (username, password) VALUES (?, ?)',
      [username, password]
    );
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Admin user created successfully' 
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
};
