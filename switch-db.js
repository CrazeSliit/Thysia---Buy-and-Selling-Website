const fs = require('fs');
const path = require('path');

// Script to switch Prisma schema between SQLite (dev) and PostgreSQL (production)
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

function switchToProduction() {
  const content = fs.readFileSync(schemaPath, 'utf8');
  const updated = content.replace(
    /datasource db \{\s*provider = "sqlite"\s*url\s*= env\("DATABASE_URL"\)\s*\}/,
    `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
  );
  fs.writeFileSync(schemaPath, updated);
  console.log('✅ Schema switched to PostgreSQL for production');
}

function switchToDevelopment() {
  const content = fs.readFileSync(schemaPath, 'utf8');
  const updated = content.replace(
    /datasource db \{\s*provider = "postgresql"\s*url\s*= env\("DATABASE_URL"\)\s*\}/,
    `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`
  );
  fs.writeFileSync(schemaPath, updated);
  console.log('✅ Schema switched to SQLite for development');
}

const command = process.argv[2];

if (command === 'prod') {
  switchToProduction();
} else if (command === 'dev') {
  switchToDevelopment();
} else {
  console.log('Usage:');
  console.log('  node switch-db.js prod  # Switch to PostgreSQL');
  console.log('  node switch-db.js dev   # Switch to SQLite');
}
