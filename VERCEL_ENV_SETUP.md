# 🚀 Vercel Environment Variables Setup

## Required Environment Variables

Set these in your Vercel Dashboard → Project Settings → Environment Variables:

### 🌐 **API Configuration**
```bash
VITE_API_URL=https://taste-of-india-tawny.vercel.app/api
```

### 🗄️ **Database Configuration**
```bash
NODE_ENV=production
USE_SUPABASE=true
SUPABASE_URL=https://qslfidheyalqdetiqdbs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE
```

### 🔐 **Security Configuration**
```bash
JWT_SECRET=taste-of-india-production-secret-2024-change-this
CORS_ORIGINS=https://taste-of-india-tawny.vercel.app
```

### ⚙️ **Application Settings**
```bash
DEFAULT_RESTAURANT_ID=1
DEFAULT_DELIVERY_FEE_PER_KM=10
DEFAULT_MAX_DELIVERY_RADIUS=15
```

## 📝 **Setup Steps**

1. **Go to Vercel Dashboard**: [https://vercel.com/taste-of-india-zambias-projects/taste-of-india](https://vercel.com/taste-of-india-zambias-projects/taste-of-india)

2. **Navigate to Settings**: Click on your project → Settings tab

3. **Environment Variables**: Click on "Environment Variables" in the sidebar

4. **Add Variables**: Click "Add" and enter each variable above

5. **Set Environment**: Choose "Production" for all variables

6. **Save and Redeploy**: After adding all variables, trigger a new deployment

## 🎯 **Critical Variables**

### **Must Have:**
- `VITE_API_URL` - Frontend needs this to connect to API
- `SUPABASE_URL` - Database connection
- `SUPABASE_ANON_KEY` - Database authentication
- `USE_SUPABASE=true` - Enables production database

### **Security:**
- `JWT_SECRET` - For admin authentication
- `CORS_ORIGINS` - Prevents unauthorized access

### **Optional but Recommended:**
- `NODE_ENV=production` - Optimizes performance
- Default restaurant settings for fallbacks

## ✅ **Verification**

After setting up:
1. Redeploy your application
2. Visit your Vercel URL
3. Check if restaurants load on homepage
4. Try placing a test order
5. Verify admin login works

## 🆘 **Troubleshooting**

### **If deployment still fails:**
1. Check Vercel build logs
2. Verify all environment variables are set
3. Make sure Supabase database schema is created
4. Check CORS origins match your domain

### **Common Issues:**
- Missing `VITE_` prefix for frontend variables
- Wrong Supabase URL or key
- CORS errors from mismatched domains
- Database tables not created in Supabase
