@echo off
REM Deployment script for Vercel (Windows)

echo 🚀 Preparing for Vercel deployment...

REM Step 1: Switch to production database
echo 📊 Switching to PostgreSQL...
node switch-db.js prod

REM Step 2: Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

REM Step 3: Build the application
echo 🏗️ Building application...
npm run build

if %errorlevel% == 0 (
    echo ✅ Build successful! Ready for deployment.
    echo.
    echo Next steps:
    echo 1. Set up your PostgreSQL database (Neon, Supabase, etc.^)
    echo 2. Add environment variables to Vercel:
    echo    - DATABASE_URL=your-postgresql-connection-string
    echo    - NEXTAUTH_SECRET=your-secure-secret
    echo    - NEXTAUTH_URL=https://your-app.vercel.app
    echo 3. Deploy: git push origin main
    echo 4. Run database migration: npx prisma db push (with production DATABASE_URL^)
) else (
    echo ❌ Build failed. Please check the errors above.
    exit /b 1
)
