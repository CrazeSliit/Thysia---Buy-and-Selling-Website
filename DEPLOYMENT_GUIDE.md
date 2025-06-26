# Vercel Deployment Guide for Thysia E-commerce

## The Problem
Your application is currently configured to use SQLite, which cannot be used on Vercel's serverless platform. You need a PostgreSQL database for production.

## Solution: Deploy with PostgreSQL Database

### Step 1: Set up a PostgreSQL Database
You have several options:

#### Option A: Neon Database (Recommended - Free tier available)
1. Go to https://neon.tech/
2. Sign up and create a new project
3. Copy the connection string (looks like: `postgresql://username:password@hostname:port/database`)

#### Option B: Supabase (Free tier available)
1. Go to https://supabase.com/
2. Create a new project
3. Go to Settings > Database and copy the connection string

#### Option C: Railway, PlanetScale, or other providers

### Step 2: Configure Environment Variables in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add these variables:

```
DATABASE_URL=postgresql://your-connection-string-here
NEXTAUTH_SECRET=your-super-secure-random-secret-key
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### Step 3: Update Your Schema for Production
Your current schema is SQLite-specific. For PostgreSQL deployment:

1. **IMPORTANT**: Before deploying, you need to:
   - Replace `datasource db { provider = "sqlite" }` with `datasource db { provider = "postgresql" }`
   - Update any SQLite-specific syntax if present

### Step 4: Deploy to Vercel
Once you've set up the database and environment variables:

```bash
# Build and deploy
npm run build
git add .
git commit -m "Setup for production deployment"
git push origin main
```

### Step 5: Run Database Migrations on Production
After deployment, you need to set up your database schema:

1. In your local terminal, set the production DATABASE_URL:
   ```bash
   $env:DATABASE_URL="your-production-postgresql-url"
   npx prisma db push
   ```

2. Or use Vercel CLI:
   ```bash
   vercel env pull .env.production
   npx prisma db push
   ```

## Quick Fix for Immediate Deployment

If you want to deploy immediately with minimal changes:

1. **Set up Neon Database** (5 minutes)
2. **Add environment variables to Vercel**
3. **Update your schema.prisma**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. **Deploy**

## Files Modified
- ✅ `package.json` - Added vercel-build script
- ✅ `vercel.json` - Added environment variable configuration
- ✅ `.env.production.example` - Template for production environment variables
- ⚠️  `prisma/schema.prisma` - Needs provider changed from "sqlite" to "postgresql"

## Common Issues and Solutions

### "Table 'products' doesn't exist"
- **Cause**: Database schema hasn't been created in production
- **Fix**: Run `npx prisma db push` with production DATABASE_URL

### "Cannot find module '@prisma/client'"
- **Cause**: Prisma client not generated during build
- **Fix**: Ensured by adding `prisma generate` to build script

### Build fails with database queries
- **Cause**: Next.js trying to connect to database during build
- **Fix**: Make sure all database queries are properly handled in API routes, not in build-time code

## Next Steps After Deployment
1. Test all functionality on the deployed site
2. Seed your production database if needed
3. Set up proper error monitoring
4. Configure domain and SSL if needed

## Need Help?
If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Ensure database connection string is valid
4. Test database connection locally with production URL
