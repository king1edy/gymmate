// scripts/setup-database.ts
// Complete database setup script for GymMate

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { runMigrations } from '../lib/db/migrate';
import { seedDatabase } from '../lib/db/seed';

async function setupDatabase() {
  console.log('🚀 Starting GymMate database setup...\n');

  try {
    // Step 1: Create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Step 2: Run migrations
    console.log('📦 Running database migrations...');
    await runMigrations();
    
    // Step 3: Seed initial data
    console.log('🌱 Seeding initial data...');
    await seedDatabase();
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('🎉 Your GymMate database is ready to use.');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

async function createDatabaseIfNotExists() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Parse database URL to extract database name
  const url = new URL(connectionString);
  const dbName = url.pathname.slice(1); // Remove leading slash
  
  // Connect to postgres database to create target database
  const adminUrl = connectionString.replace(`/${dbName}`, '/postgres');
  const adminClient = postgres(adminUrl, { max: 1 });

  try {
    // Check if database exists
    const result = await adminClient`
      SELECT 1 FROM pg_database WHERE datname = ${dbName}
    `;
    
    if (result.length === 0) {
      console.log(`📅 Creating database: ${dbName}`);
      await adminClient.unsafe(`CREATE DATABASE "${dbName}"`);
      console.log('✅ Database created successfully');
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }
  } finally {
    await adminClient.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase();
}
