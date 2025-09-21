# 🐘 Supabase Database Setup Guide

## 📋 Prerequisites

1. **Supabase Project**: [https://qslfidheyalqdetiqdbs.supabase.co](https://qslfidheyalqdetiqdbs.supabase.co)
2. **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE`

## 🚀 Setup Instructions

### 1. **Run the Database Schema**
1. Go to your Supabase dashboard: [https://supabase.com/dashboard/project/qslfidheyalqdetiqdbs](https://supabase.com/dashboard/project/qslfidheyalqdetiqdbs)
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `supabase-schema-simple.sql` (this is the corrected version)
4. Click **Run** to create all tables and sample data

⚠️ **Note**: Use `supabase-schema-simple.sql` instead of `supabase-schema.sql` - it's been optimized for Supabase compatibility.

### 2. **Environment Variables for Vercel**
Add these to your Vercel project settings:

```bash
# Database Configuration
SUPABASE_URL=https://qslfidheyalqdetiqdbs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE
USE_SUPABASE=true
NODE_ENV=production

# API Configuration
VITE_API_URL=https://your-vercel-app.vercel.app/api
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CORS_ORIGINS=https://your-vercel-app.vercel.app

# Restaurant Settings
DEFAULT_RESTAURANT_ID=1
DEFAULT_DELIVERY_FEE_PER_KM=10
DEFAULT_MAX_DELIVERY_RADIUS=15
```

### 3. **Local Development with Supabase** (Optional)
If you want to use Supabase locally instead of SQLite:

```bash
# In your .env file (create one)
USE_SUPABASE=true
SUPABASE_URL=https://qslfidheyalqdetiqdbs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE
```

## 🌟 **Database Features**

### 📍 **Location-Based Delivery**
- **Manda Hill**: K10/km, 15km radius, K25 minimum
- **Parirenyetwa**: K12/km, 12km radius, K20 minimum
- GPS coordinates stored for distance calculations

### 🍯 **Dynamic Pricing System**
- **Kaju Katli**: K0.80/gram + K2.00 packaging
- **Rasgulla**: K0.60/gram + K1.50 packaging
- Smart gram-based ordering system

### 🔐 **Security Features**
- 64-character secure order tokens
- Row Level Security (RLS) enabled
- Public policies for customer access
- Admin policies for management

### 📊 **Comprehensive Menu**
- 10 sample items with complete metadata
- Tags, spice levels, preparation times
- Listing preferences (high/mid/low priority)
- Vegetarian/vegan/gluten-free flags

## 🔧 **Database Adapter**

The system automatically switches between:
- **Development**: SQLite (local file)
- **Production**: Supabase (cloud database)

This ensures:
- ✅ Fast local development
- ✅ Reliable cloud production
- ✅ Data persistence across deployments
- ✅ Scalable architecture

## 🧪 **Testing Your Setup**

### 1. **Verify Tables Created**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 2. **Check Sample Data**
```sql
SELECT name, delivery_fee_per_km, latitude, longitude 
FROM restaurants;
```

### 3. **Test Menu Items**
```sql
SELECT name, price, dynamic_pricing, packaging_price 
FROM menu_items 
WHERE dynamic_pricing = true;
```

## 🚨 **Important Notes**

1. **Row Level Security**: Enabled on all tables for security
2. **Public Policies**: Allow customer orders and menu access
3. **Admin Access**: May need authentication for full admin features
4. **Token Security**: Order tokens provide secure customer access
5. **Data Persistence**: Unlike SQLite, Supabase data persists across deployments

## 📞 **Support**

If you encounter issues:
1. Check Supabase dashboard for error logs
2. Verify environment variables in Vercel
3. Test API endpoints with correct CORS origins
4. Review RLS policies if access is denied

Your database is now ready for production with all advanced features! 🎉
