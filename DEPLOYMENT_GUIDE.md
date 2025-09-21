# 🚀 Deployment Guide - Taste of India Restaurant System

## 📋 Prerequisites

1. **GitHub Repository**: [https://github.com/tasteofindiazambia/TasteOfIndia](https://github.com/tasteofindiazambia/TasteOfIndia)
2. **Vercel Account**: [https://vercel.com/taste-of-india-zambias-projects/taste-of-india](https://vercel.com/taste-of-india-zambias-projects/taste-of-india)

## 🔐 GitHub Authentication Setup

### Option 1: Personal Access Token
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with `repo` permissions
3. Update git remote:
   ```bash
   git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/tasteofindiazambia/TasteOfIndia.git
   ```

### Option 2: SSH Keys
1. Generate SSH key: `ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'`
2. Add to GitHub: [https://github.com/settings/keys](https://github.com/settings/keys)
3. Change remote: `git remote set-url origin git@github.com:tasteofindiazambia/TasteOfIndia.git`

## ⚙️ Vercel Environment Variables

Set these in your Vercel dashboard:

### Required Variables:
```
VITE_API_URL=https://your-vercel-app.vercel.app/api
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
NODE_ENV=production
```

### Optional Variables:
```
PORT=3001
CORS_ORIGINS=https://your-vercel-app.vercel.app
DEFAULT_RESTAURANT_ID=1
DEFAULT_DELIVERY_FEE_PER_KM=10
DEFAULT_MAX_DELIVERY_RADIUS=15
WHATSAPP_BUSINESS_NUMBER=+260971234567
```

## 📦 Deployment Steps

### 1. Push to GitHub
```bash
# Authenticate with GitHub (see options above)
git push origin main
```

### 2. Vercel Deployment
- Vercel should automatically deploy when you push to main
- Check deployment status at: [https://vercel.com/taste-of-india-zambias-projects/taste-of-india](https://vercel.com/taste-of-india-zambias-projects/taste-of-india)

### 3. Configure Environment Variables in Vercel
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the variables listed above

## 🌟 New Features in This Deployment

### 📍 Distance-Based Delivery System
- **GPS Location Detection**: Automatic location detection via browser
- **Dynamic Pricing**: K10/km for Manda Hill, K12/km for Parirenyetwa
- **Distance Calculation**: Real-time Haversine formula calculation
- **Delivery Radius**: Configurable maximum delivery distance per restaurant

### 🍯 Dynamic Pricing for Sweets
- **Per-Gram Pricing**: Kaju Katli (K0.80/g), Rasgulla (K0.60/g)
- **Smart Cart**: Shows gram quantities and calculated totals
- **Packaging Fees**: Automatic packaging cost calculation

### 🔐 Enhanced Security
- **Secure Order Tokens**: 64-character hex tokens instead of sequential IDs
- **Token Validation**: Robust URL parameter handling
- **Privacy Protection**: Customers can't access other orders by changing URLs

### 🛒 Improved User Experience
- **Real-Time Calculations**: Live delivery fee and distance display
- **Better Error Handling**: Helpful troubleshooting messages
- **Enhanced Admin Panel**: Detailed order breakdowns with delivery info
- **Mobile Optimization**: Touch-friendly controls for location and ordering

## 🧪 Testing Your Deployment

### Frontend Testing:
- Visit your Vercel URL
- Test order placement with location detection
- Verify dynamic pricing for sweets
- Check order confirmation with secure tokens

### Admin Panel Testing:
- Login with: `admin` / `admin123`
- Verify order details show delivery information
- Check distance-based delivery fees
- Test order status updates

## 🔧 Troubleshooting

### Common Issues:
1. **API not working**: Check VITE_API_URL environment variable
2. **Database errors**: Ensure database is properly initialized
3. **Location not working**: Check HTTPS requirement for geolocation
4. **Orders not found**: Verify token handling in production

### Database Considerations:
- Current setup uses SQLite (file-based)
- For production, consider migrating to PostgreSQL or MySQL
- Database will reset on each deployment with current setup

## 📞 Support
- Repository: [https://github.com/tasteofindiazambia/TasteOfIndia](https://github.com/tasteofindiazambia/TasteOfIndia)
- Issues: [https://github.com/tasteofindiazambia/TasteOfIndia/issues](https://github.com/tasteofindiazambia/TasteOfIndia/issues)
