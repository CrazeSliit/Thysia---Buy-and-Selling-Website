# Vercel Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All code committed and pushed to main branch
- [ ] Build passes locally (`npm run build`)
- [ ] Vercel build passes locally (`npm run vercel-build`)
- [ ] No TypeScript errors or critical warnings
- [ ] Database schema is finalized and migrations are ready

### ✅ Environment Variables
- [ ] DATABASE_URL (Prisma Accelerate connection string)
- [ ] NEXTAUTH_SECRET (secure random string)
- [ ] NEXTAUTH_URL (will be your Vercel app URL)
- [ ] CRON_SECRET (for automated cleanup tasks)

### ✅ Optional Environment Variables (if using)
- [ ] GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
- [ ] GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET
- [ ] STRIPE_SECRET_KEY & STRIPE_PUBLISHABLE_KEY
- [ ] UPLOADTHING_SECRET & UPLOADTHING_APP_ID

### ✅ Configuration Files
- [ ] `vercel.json` is properly configured
- [ ] `package.json` scripts are correct
- [ ] `.gitignore` excludes sensitive files
- [ ] `prisma/schema.prisma` uses PostgreSQL provider

## Deployment Steps

### 1. Create Vercel Project
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Confirm Next.js framework detection

### 2. Configure Build Settings
- [ ] Framework Preset: Next.js
- [ ] Build Command: `npm run vercel-build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`

### 3. Set Environment Variables
- [ ] Add all required environment variables in Vercel dashboard
- [ ] Set variables for Production, Preview, and Development
- [ ] Test that sensitive values are properly encrypted

### 4. Deploy and Test
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (usually 2-5 minutes)
- [ ] Check deployment logs for any errors

## Post-Deployment Verification

### ✅ Basic Functionality
- [ ] App loads successfully at your Vercel URL
- [ ] Health check endpoint works: `/api/health`
- [ ] Database connection is established
- [ ] Static assets (images, CSS, JS) load correctly

### ✅ Authentication Testing
- [ ] Login/logout functionality works
- [ ] OAuth providers work (if configured)
- [ ] Session management is working
- [ ] Protected routes redirect properly

### ✅ API Endpoints
- [ ] All API routes respond correctly
- [ ] Database operations work (create, read, update, delete)
- [ ] Error handling is working
- [ ] Response times are acceptable

### ✅ E-commerce Features
- [ ] Product listings display correctly
- [ ] Shopping cart functionality works
- [ ] Checkout process is functional
- [ ] Payment processing works (if configured)
- [ ] Order management is working

### ✅ Performance Check
- [ ] Page load times are reasonable
- [ ] Core Web Vitals are good
- [ ] No console errors in browser
- [ ] Mobile responsiveness works

## Troubleshooting Common Issues

### Build Failures
1. **Check Vercel function logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Check for TypeScript errors** or missing dependencies
4. **Ensure Prisma schema matches** your database

### Database Connection Issues
1. **Verify DATABASE_URL format** (Prisma Accelerate string)
2. **Check database accessibility** from Vercel's servers
3. **Confirm Prisma migrations** are up to date
4. **Test connection** using the health check endpoint

### Authentication Problems
1. **Verify NEXTAUTH_URL** matches your Vercel domain
2. **Check OAuth provider settings** (redirect URLs, etc.)
3. **Ensure NEXTAUTH_SECRET** is set and secure
4. **Test login flow** with different providers

### Performance Issues
1. **Check function timeout settings** (currently 30 seconds)
2. **Optimize database queries** if needed
3. **Review image optimization** settings
4. **Monitor resource usage** in Vercel dashboard

## Monitoring and Maintenance

### ✅ Set Up Monitoring
- [ ] Enable Vercel Analytics
- [ ] Configure error reporting (Sentry, etc.)
- [ ] Set up uptime monitoring
- [ ] Monitor Core Web Vitals

### ✅ Regular Maintenance
- [ ] Monitor deployment frequency and success rate
- [ ] Review and rotate secrets regularly
- [ ] Keep dependencies updated
- [ ] Monitor database usage and performance
- [ ] Review cron job execution logs

### ✅ Backup Strategy
- [ ] Confirm code is backed up on GitHub
- [ ] Verify database backup strategy
- [ ] Test restoration procedures
- [ ] Document rollback procedures

## Security Checklist

### ✅ Environment Security
- [ ] No secrets committed to repository
- [ ] Environment variables properly encrypted in Vercel
- [ ] Database access is restricted
- [ ] API endpoints have proper authentication

### ✅ Application Security
- [ ] Security headers are configured (via vercel.json)
- [ ] CSRF protection is enabled
- [ ] Input validation is in place
- [ ] Rate limiting is configured (if needed)

## Performance Optimization

### ✅ Next.js Optimizations
- [ ] Image optimization is enabled
- [ ] Static generation is used where possible
- [ ] Dynamic imports are used for large components
- [ ] Bundle size is optimized

### ✅ Database Optimizations
- [ ] Database queries are optimized
- [ ] Connection pooling is configured (Prisma Accelerate)
- [ ] Indexes are properly set up
- [ ] Caching strategy is implemented

## Success Criteria

Your deployment is successful when:
- ✅ App loads without errors at your Vercel URL
- ✅ All core features work as expected
- ✅ Database operations are functioning
- ✅ Authentication system is working
- ✅ Performance metrics are acceptable
- ✅ No critical console errors
- ✅ Health check endpoint returns success

## Next Steps After Successful Deployment

1. **Set up custom domain** (if desired)
2. **Configure CDN settings** for optimal performance
3. **Set up monitoring and alerting**
4. **Plan for scaling** as traffic grows
5. **Document API endpoints** for team/client use
6. **Set up staging environment** for testing

## Emergency Procedures

### Rollback Process
1. Go to Vercel dashboard → Deployments
2. Find last working deployment
3. Click "Promote to Production"
4. Verify rollback was successful

### Database Issues
1. Check Prisma Accelerate status
2. Verify connection string is correct
3. Contact support if service is down
4. Have backup connection ready

### Critical Bugs
1. Deploy hotfix if possible
2. Rollback if hotfix not immediately available
3. Communicate status to users
4. Fix issue and redeploy
