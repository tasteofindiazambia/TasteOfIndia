import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import restaurantRoutes from './routes/restaurants.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import reservationRoutes from './routes/reservations.js';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blogs.js';
import eventRoutes from './routes/events.js';
import brandingRoutes from './routes/branding.js';
import customerRoutes from './routes/customers.js';

// Import database to initialize
import Database from './models/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// API Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api', menuRoutes); // Menu routes are nested under /api
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/customers', customerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close();
  process.exit(0);
});

export default app;
