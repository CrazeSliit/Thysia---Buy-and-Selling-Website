# Vercel Deployment Setup Guide

## 1. Environment Variables Setup

After connecting your repository to Vercel, you need to set up the following environment variables in your Vercel project dashboard:

### Required Environment Variables:

```
DATABASE_URL=your_prisma_accelerate_connection_string
NEXTAUTH_SECRET=your_secure_random_string
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### Optional Environment Variables:

```
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

## 2. Vercel Configuration Features

Our `vercel.json` includes:

### Build Configuration
- Uses `@vercel/next` for Next.js 14 optimization
- Proper environment variable handling
- Production-ready build settings

### Serverless Functions
- 30-second timeout for API routes (sufficient for database operations)
- Covers all API route patterns (`/api/*`, `/app/api/*`)

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Performance Optimizations
- Deployed to `iad1` region (East Coast US) for optimal performance
- Proper API route handling
- Admin route redirects

### Automated Tasks
- Cron job for cleanup tasks (runs daily at 2 AM)
- Can be used for database maintenance, cache clearing, etc.

## 3. Deployment Steps

### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing your e-commerce app

### Step 2: Configure Project
1. **Framework Preset**: Next.js (should be auto-detected)
2. **Root Directory**: `./` (if your app is in the root)
3. **Build Command**: `npm run vercel-build` (already configured in package.json)
4. **Output Directory**: `.next` (Next.js default)

### Step 3: Set Environment Variables
1. In project settings, go to "Environment Variables"
2. Add all required variables from above
3. Make sure to set them for all environments (Production, Preview, Development)

### Step 4: Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## 4. Post-Deployment Verification

### Check Database Connection
Visit `/api/health` to verify database connectivity

### Check Authentication
Test login/logout functionality with your configured providers

### Check API Routes
Verify all API endpoints are working correctly

### Check Static Assets
Ensure images, CSS, and JS files are loading properly

## 5. Troubleshooting

### Build Errors
- Check Vercel function logs in the dashboard
- Verify environment variables are set correctly
- Ensure Prisma schema is compatible with your database

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Prisma Accelerate connection string format
- Ensure database is accessible from Vercel's servers

### Authentication Issues
- Verify NEXTAUTH_URL matches your Vercel domain
- Check OAuth provider configurations
- Ensure NEXTAUTH_SECRET is set and secure

### API Timeout Issues
- Function timeout is set to 30 seconds
- For longer operations, consider background jobs
- Optimize database queries if needed

## 6. Environment Variable Security

### Secrets Management
- Never commit sensitive data to your repository
- Use Vercel's environment variable encryption
- Rotate secrets regularly

### Database Security
- Use Prisma Accelerate for connection pooling
- Enable database access restrictions
- Monitor database usage and connections

## 7. Performance Monitoring

### Vercel Analytics
- Enable Vercel Analytics for performance insights
- Monitor Core Web Vitals
- Track deployment success rates

### Error Monitoring
- Set up error reporting (Sentry, etc.)
- Monitor API response times
- Track user experience metrics

## 8. Scaling Considerations

### Function Limits
- Hobby plan: 100GB-hours per month
- Pro plan: 1000GB-hours per month
- Monitor usage in Vercel dashboard

### Database Connections
- Prisma Accelerate handles connection pooling
- Monitor database connection usage
- Consider read replicas for high traffic

## 9. Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Test deployments in preview environments

### Database Maintenance
- Use the cron job for cleanup tasks
- Monitor database size and performance
- Plan for data archival if needed

## 10. Backup Strategy

### Code Backup
- Repository is backed up on GitHub
- Use branch protection rules
- Tag releases for rollback capability

### Database Backup
- Prisma Accelerate includes backup features
- Consider additional backup strategies
- Test restore procedures regularly
