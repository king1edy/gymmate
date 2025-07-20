// lib/db/migrate.ts
// Migration utility script

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL;

  console.info('DB connectionString', connectionString);
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Create a dedicated connection for migrations
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  console.log('🚀 Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
};

// Run if called directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };