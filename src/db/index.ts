import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

// Create a more robust client initialization
let client;
let db;

try {
  const connectionUrl = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  // Determine database environment
  let dbEnv = 'UNKNOWN';
  let isProduction = false;
  if (connectionUrl) {
    // Extract database name
    const dbNameMatch = connectionUrl.match(/([a-zA-Z0-9_-]+)\.turso\.io/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
    
    // Check for explicit dev/test indicators
    if (connectionUrl.includes('dev') || connectionUrl.includes('test') || dbName.includes('julian') || dbName.includes('dev')) {
      dbEnv = '⚠️  DEV/TEST DATABASE';
      isProduction = false;
    } else if (connectionUrl.includes('prod') || connectionUrl.includes('production')) {
      dbEnv = '✅ PRODUCTION';
      isProduction = true;
    } else {
      // Default assumption - if it has personal name, likely dev
      if (dbName.includes('julian') || dbName.includes('dev') || dbName.includes('test')) {
        dbEnv = '⚠️  DEV/TEST DATABASE';
        isProduction = false;
      } else {
        dbEnv = `Database: ${dbName} (assuming PRODUCTION)`;
        isProduction = true;
      }
    }
  }
  
  console.log(`🟢 [Database] ${dbEnv}`);
  if (!isProduction) {
    console.log(`  ⚠️  WARNING: Connected to DEV/TEST database - production data not visible`);
  }
  
  if (!connectionUrl || !authToken) {
    throw new Error('Missing database connection credentials');
  }
  
  client = createClient({
    url: connectionUrl,
    authToken: authToken
  });
  
  db = drizzle(client, { schema });
  console.log('✅ Database connection established successfully\n');
} catch (error) {
  console.error('❌ Failed to initialize database connection:', error);
  
  // Create a mock DB for fallback
  const mockDb = {
    select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([{id: 0}]) }) }),
    update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
  };
  
  db = mockDb;
}

export { db };