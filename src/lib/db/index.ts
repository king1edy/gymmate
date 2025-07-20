// lib/db/index.ts
// Database connection and configuration

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection configuration
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the connection
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 30, // Close connections after 30 seconds of inactivity
  connect_timeout: 10, // Timeout connection attempts after 10 seconds
});

// Create Drizzle instance with schema
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development' 
});

// Export the client for advanced usage
export { client };

// Export all schema tables and relations
export * from './schema';