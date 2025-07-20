// drizzle.config.ts
// Drizzle Kit configuration for migrations and introspection
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  dialect: 'postgresql',  // "mysql" | "sqlite" | "postgresql" | "turso" | "singlestore"
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
// This configuration file is used by Drizzle Kit to manage database migrations and schema introspection.
// It specifies the schema file location, database dialect, and connection details.