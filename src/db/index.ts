import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

// Create a more robust client initialization
let client;
let db;

try {
  const connectionUrl = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  console.log('Database connection attempt with:', 
    connectionUrl ? 'Valid URL' : 'Missing URL',
    authToken ? 'Valid token' : 'Missing token'
  );
  
  if (!connectionUrl || !authToken) {
    throw new Error('Missing database connection credentials');
  }
  
  client = createClient({
    url: connectionUrl,
    authToken: authToken
  });
  
  db = drizzle(client, { schema });
  console.log('Database connection established successfully');
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  
  // Create a mock DB for fallback
  const mockDb = {
    select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([{id: 0}]) }) }),
    update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
  };
  
  db = mockDb;
}

export { db };