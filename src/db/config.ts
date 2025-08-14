import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// For local development, you can use a local PostgreSQL connection
// For production, use Neon or your preferred PostgreSQL provider
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required. Please set it in your .env file.');
}

// Validate that the connection string is in the correct format for Neon
if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
  throw new Error('DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql:// or postgres://');
}

// Configure Neon with proper options
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });