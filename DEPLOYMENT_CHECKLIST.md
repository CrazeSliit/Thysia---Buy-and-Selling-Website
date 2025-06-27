# 🚀 Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Environment Variables
Ensure these environment variables are set in your deployment platform:

#### Required Variables:
- `DATABASE_URL` - PostgreSQL connection string (use Prisma Accelerate for production)
- `NEXTAUTH_SECRET` - Random secret key for NextAuth.js
- `NEXTAUTH_URL` - Full URL of your deployed app (e.g., https://your-app.vercel.app)

#### Optional Variables:
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `STRIPE_PUBLIC_KEY` - For payments
- `STRIPE_SECRET_KEY` - For payments
- `CLOUDINARY_CLOUD_NAME` - For image storage
- `CLOUDINARY_API_KEY` - For image storage
- `CLOUDINARY_API_SECRET` - For image storage
- `CRON_SECRET` - For securing cron endpoints

### 2. Database Setup
- [ ] Database is accessible from your deployment platform
- [ ] Run `npx prisma db push` to sync schema
- [ ] Run `npm run db:seed` to populate initial data (optional)

### 3. Build Verification
- [ ] `npm run build` passes locally
- [ ] `npm run vercel-build` passes locally
- [ ] No TypeScript errors
- [ ] ESLint configuration is set up

## 📋 Vercel Deployment Steps

### 1. Connect Repository
- [ ] Push code to GitHub/GitLab/Bitbucket
- [ ] Connect repository to Vercel
- [ ] Select correct branch (usually `main`)

### 2. Configure Build Settings
- [ ] Framework Preset: **Next.js**
- [ ] Build Command: `npm run vercel-build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`

### 3. Environment Variables
Set in Vercel Dashboard > Settings > Environment Variables:

**Important:** Add these directly in the Vercel dashboard, not in vercel.json

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Your secret key (generate with `openssl rand -base64 32`) | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production, Preview |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |

**Optional Variables:**
| Variable | Description | Environment |
|----------|-------------|-------------|
| `GOOGLE_CLIENT_ID` | For Google OAuth | All |
| `GOOGLE_CLIENT_SECRET` | For Google OAuth | All |
| `STRIPE_PUBLIC_KEY` | For payments | All |
| `STRIPE_SECRET_KEY` | For payments | All |
| `CLOUDINARY_CLOUD_NAME` | For image storage | All |
| `CLOUDINARY_API_KEY` | For image storage | All |
| `CLOUDINARY_API_SECRET` | For image storage | All |
| `CRON_SECRET` | For securing cron endpoints | All |

### 4. Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors

## 🔧 Post-Deployment Verification

### 1. Health Checks
- [ ] Visit `/api/health` - should return healthy status
- [ ] Check database connectivity
- [ ] Verify API routes are working

### 2. Authentication
- [ ] Test login/register functionality
- [ ] Verify OAuth providers (if configured)
- [ ] Check session management

### 3. Core Features
- [ ] Browse products
- [ ] Add items to cart
- [ ] Place test orders
- [ ] Admin dashboard access

## 🚨 Common Issues & Solutions

### Build Failures
- **Prisma generate errors**: Ensure DATABASE_URL is set correctly
- **TypeScript errors**: Run `npm run build` locally first
- **Missing environment variables**: Check all required vars are set

### Runtime Issues
- **Database connection fails**: Verify DATABASE_URL and network access
- **NextAuth errors**: Check NEXTAUTH_SECRET and NEXTAUTH_URL
- **API routes 404**: Ensure routes are properly exported

### Performance
- **Slow queries**: Consider adding database indexes
- **High memory usage**: Optimize Prisma queries
- **Cold starts**: Use Prisma connection pooling

## 📊 Monitoring & Maintenance

### 1. Logs
- Monitor Vercel function logs
- Set up error tracking (Sentry, LogRocket)
- Track performance metrics

### 2. Cron Jobs
- Set up `/api/cron/cleanup` to run daily
- Configure webhook security with CRON_SECRET
- Monitor cleanup job execution

### 3. Updates
- Regular dependency updates
- Database migrations for schema changes
- Security patches

## 🌍 Production Environment Settings

### Recommended Vercel Configuration:
```json
{
  "functions": {
    "app/**/*.js": { "maxDuration": 10 },
    "app/**/*.ts": { "maxDuration": 10 }
  },
  "build": {
    "env": { "SKIP_ENV_VALIDATION": "true" }
  }
}
```

### Database Optimization:
- Use connection pooling (Prisma Accelerate)
- Set appropriate connection limits
- Monitor query performance

---

## 🎉 Deployment Complete!

Once all items are checked, your e-commerce marketplace should be live and fully functional.

**Need help?** Check the troubleshooting section or open an issue on GitHub.