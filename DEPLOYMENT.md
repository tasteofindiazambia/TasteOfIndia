# Taste of India - Vercel Deployment Guide

## Issues Fixed

### 1. **Incorrect Function Configuration**
- **Problem**: `vercel.json` was pointing to `server/server.js` which doesn't work with Vercel's serverless functions
- **Solution**: Updated to use proper `/api` directory structure with `api/**/*.js` pattern

### 2. **Database Compatibility**
- **Problem**: SQLite doesn't work in Vercel's serverless environment
- **Solution**: Created Supabase-based serverless functions in `/api` directory

### 3. **Missing Serverless Functions**
- **Problem**: No proper Vercel serverless function handlers
- **Solution**: Created individual API endpoints:
  - `/api/health.js` - Health check endpoint
  - `/api/restaurants.js` - Restaurant management
  - `/api/menu/[restaurantId].js` - Menu items by restaurant
  - `/api/orders.js` - Order management
  - `/api/reservations.js` - Reservation management

## Deployment Steps

### 1. **Set up Supabase Database**
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Set up the database schema (see `database/schema.sql`)

### 2. **Configure Environment Variables**
In your Vercel dashboard, add these environment variables:
```
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. **Deploy to Vercel**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel@latest

# Deploy
vercel --prod
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Server health status

### Restaurants
- **GET** `/api/restaurants` - Get all restaurants
- **POST** `/api/restaurants` - Create new restaurant

### Menu
- **GET** `/api/menu/[restaurantId]` - Get menu for restaurant
- **POST** `/api/menu/[restaurantId]` - Add menu item

### Orders
- **GET** `/api/orders?restaurant_id=1` - Get orders
- **POST** `/api/orders` - Create new order

### Reservations
- **GET** `/api/reservations?restaurant_id=1` - Get reservations
- **POST** `/api/reservations` - Create new reservation

## Database Schema

The application expects these Supabase tables:
- `restaurants` - Restaurant locations
- `categories` - Menu categories
- `menu_items` - Menu items
- `orders` - Customer orders
- `order_items` - Order line items
- `reservations` - Table reservations
- `customers` - Customer information

## Troubleshooting

### Common Issues:
1. **Function timeout**: Increase timeout in `vercel.json`
2. **Database connection**: Verify Supabase credentials
3. **CORS errors**: Check API function CORS headers
4. **Build failures**: Ensure all dependencies are in `package.json`

### Debug Commands:
```bash
# Check build locally
npm run build

# Test API functions locally
vercel dev

# Check deployment logs
vercel logs [deployment-url]
```

## Next Steps

1. Set up Supabase database with the provided schema
2. Configure environment variables in Vercel
3. Deploy using `vercel --prod`
4. Test all API endpoints
5. Update frontend to use new API structure if needed
