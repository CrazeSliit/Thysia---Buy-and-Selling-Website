const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment for deployment...');

// Load environment variables from .env files
const loadEnvFile = (filename) => {
  const envPath = path.join(process.cwd(), filename);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      }
    });
    console.log(`📄 Loaded ${filename}`);
    return true;
  }
  return false;
};

// Load environment files in order (prioritize .env.local)
const loadedLocal = loadEnvFile('.env.local');
const loadedEnv = loadEnvFile('.env');

if (!loadedLocal && !loadedEnv) {
  console.log('⚠️ No .env files found, checking process.env directly...');
}

// Check if we're in a CI/build environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

if (isProduction) {
  console.log('📊 Production environment detected');
  
  // Check if DATABASE_URL is set and is PostgreSQL
  const dbUrl = process.env.DATABASE_URL;
  console.log('🔍 Checking DATABASE_URL...');
  console.log('Environment keys found:', Object.keys(process.env).filter(k => k.includes('DATABASE')));
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('Available env vars:', Object.keys(process.env).slice(0, 10));
    console.log('Please set DATABASE_URL in your Vercel environment variables.');
    process.exit(1);
  }
  
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://') && !dbUrl.startsWith('prisma+postgres://')) {
    console.error('❌ DATABASE_URL must be a PostgreSQL or Prisma Accelerate connection string!');
    console.log('Current DATABASE_URL:', dbUrl.substring(0, 50) + '...');
    process.exit(1);
  }
  
  console.log('✅ PostgreSQL/Prisma Accelerate DATABASE_URL found');
} else {
  console.log('🔨 Development environment detected');
  
  // For local development, check if we already have a valid PostgreSQL URL
  const currentDbUrl = process.env.DATABASE_URL;
  if (!currentDbUrl || currentDbUrl.startsWith('file:')) {
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
    console.log('📊 Using DATABASE_URL:', currentDbUrl.substring(0, 50) + '...');
  }
}

console.log('🚀 Environment setup complete!');
