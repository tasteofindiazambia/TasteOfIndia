# Local Development Setup

This guide will help you set up the Taste of India restaurant website for local development using Supabase.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Access to the Supabase project

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   npm run setup-env
   ```

3. **Get your Supabase Service Role Key:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard/project/qslfidheyalqdetiqdbs/settings/api)
   - Copy the "service_role" key
   - Open `.env` file and replace `your_service_role_key_here` with your actual key

4. **Start development servers:**
   ```bash
   npm run dev:full
   ```

## What the setup does

The `npm run setup-env` command creates a `.env` file with:

- **SUPABASE_URL**: Points to the production Supabase database
- **SUPABASE_ANON_KEY**: Public anon key for client-side operations
- **SUPABASE_SERVICE_ROLE_KEY**: Service role key for admin operations (you need to add this)
- **NODE_ENV**: Set to development
- **USE_SUPABASE**: Set to true to use Supabase instead of SQLite
- **VITE_API_URL**: Set to `/api` for Vite proxy

## Development URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:5173/admin

## Database

The local development environment uses the **same Supabase database** as production. This ensures:

- ✅ Consistent data between local and production
- ✅ Hero slides work in local development
- ✅ All features work the same way
- ✅ No need to set up local database

## Troubleshooting

### "Route not found" errors
- Make sure you're running `npm run dev:full` (both frontend and backend)
- Check that the `.env` file exists and has the correct Supabase keys
- Verify the backend server is running on port 3001

### Database connection issues
- Ensure your Supabase Service Role Key is correct
- Check that the Supabase project is accessible
- Verify the database tables exist (run the SQL scripts in Supabase)

### API not working
- Check browser console for errors
- Verify the Vite proxy is working (should proxy `/api` to `localhost:3001`)
- Make sure the backend server is running

## Available Scripts

- `npm run dev` - Start frontend only
- `npm run server` - Start backend only  
- `npm run dev:full` - Start both frontend and backend
- `npm run setup-env` - Create .env file
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `USE_SUPABASE` | Use Supabase instead of SQLite | Yes |
| `VITE_API_URL` | API base URL for frontend | Yes |
