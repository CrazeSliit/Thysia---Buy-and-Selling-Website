const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment for deployment...');

// Check if we're in a CI/build environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

if (isProduction) {
  console.log('📊 Production environment detected');
  
  // Check if DATABASE_URL is set and is PostgreSQL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('Please set DATABASE_URL in your Vercel environment variables.');
    process.exit(1);
  }
  
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('❌ DATABASE_URL must be a PostgreSQL connection string!');
    console.log('Current DATABASE_URL:', dbUrl);
    process.exit(1);
  }
  
  console.log('✅ PostgreSQL DATABASE_URL found');
} else {
  console.log('🔨 Development environment detected');
  
  // For local development, check if we already have a valid PostgreSQL URL
  if (!process.env.DATABASE_URL || 
      (process.env.DATABASE_URL.startsWith('file:') && 
       !process.env.DATABASE_URL.startsWith('postgresql://') && 
       !process.env.DATABASE_URL.startsWith('postgres://') && 
       !process.env.DATABASE_URL.startsWith('prisma+postgres://'))) {
    console.log('⚠️ No valid PostgreSQL DATABASE_URL detected, creating build-safe fallback');
    
    // Create a .env.local with a non-connecting PostgreSQL URL for build testing
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envContent = `# Build-safe PostgreSQL URL (for local builds only)
DATABASE_URL="postgresql://build:build@invalid.host:5432/thysia_dev"
NEXTAUTH_SECRET="local-development-secret"
NEXTAUTH_URL="http://localhost:3000"
`;
    
    fs.writeFileSync(envLocalPath, envContent);
    console.log('✅ Created .env.local with build-safe PostgreSQL URL');
    console.log('📝 Note: This URL is for build testing only and will not connect to a real database');
  } else {
    console.log('✅ Valid PostgreSQL/Prisma Accelerate DATABASE_URL found');
  }
}

console.log('🚀 Environment setup complete!');
