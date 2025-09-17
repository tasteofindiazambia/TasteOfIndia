import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './server/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Sample data
const sampleRestaurants = [
  {
    id: 1,
    name: 'Taste of India - Manda Hill',
    address: 'Manda Hill Shopping Centre, Lusaka',
    phone: '+260 XX XXX XXXX',
    hours: 'Mon-Sun: 11:00 AM - 10:00 PM'
  },
  {
    id: 2,
    name: 'Taste of India - Parirenyetwa',
    address: 'Parirenyetwa Rd, Lusaka 10101, Zambia',
    phone: '+260 77 3219999',
    hours: 'Mon-Sun: 11:00 AM - 10:00 PM'
  }
];

const sampleMenuItems = [
  {
    id: 1,
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with tender chicken and spices',
    price: 25.00,
    category_id: 1,
    availability_status: 1,
    restaurant_id: 1
  },
  {
    id: 2,
    name: 'Samosas',
    description: 'Crispy pastries filled with spiced potatoes',
    price: 8.00,
    category_id: 2,
    availability_status: 1,
    restaurant_id: 1
  }
];

const sampleCategories = [
  { id: 1, name: 'Main Course' },
  { id: 2, name: 'Appetizers' },
  { id: 3, name: 'Beverages' },
  { id: 4, name: 'Desserts' }
];

// API Routes
app.get('/api/restaurants', (req, res) => {
  res.json(sampleRestaurants);
});

app.get('/api/restaurants/:id/menu', (req, res) => {
  const restaurantId = parseInt(req.params.id);
  const menuItems = sampleMenuItems.filter(item => item.restaurant_id === restaurantId);
  res.json(menuItems);
});

app.get('/api/restaurants/:id/categories', (req, res) => {
  res.json(sampleCategories);
});

app.get('/api/orders', (req, res) => {
  res.json([]);
});

app.get('/api/orders/status/:status', (req, res) => {
  res.json([]);
});

app.get('/api/reservations', (req, res) => {
  res.json([]);
});

app.get('/api/reservations/date-range', (req, res) => {
  res.json([]);
});

app.get('/api/events', (req, res) => {
  res.json([]);
});

app.get('/api/blogs', (req, res) => {
  res.json([]);
});

app.get('/api/branding', (req, res) => {
  res.json({
    id: 1,
    logo_url: '',
    primary_color: '#532734',
    secondary_color: '#A0522D',
    tertiary_color: '#D2691E',
    primary_font: 'Inter',
    secondary_font: 'Poppins',
    tertiary_font: 'Roboto',
    updated_at: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🏪 Restaurants: http://localhost:${PORT}/api/restaurants`);
});

export default app;
