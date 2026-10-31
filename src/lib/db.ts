import { Pool } from '@neondatabase/serverless';
import dns from 'node:dns';

// Ensure IPv4 first on platforms like Windows where IPv6 might stall external lookups
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignored in runtimes where not supported
}

const connectionString =
  process.env.DATABASE_URI ||
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_zMBgtmeR36Jy@ep-rapid-river-b4ihhko3-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

const globalForPool = globalThis as unknown as {
  pool?: Pool;
};

export const pool =
  globalForPool.pool ||
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPool.pool = pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number | null }> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return { rows: res.rows as T[], rowCount: res.rowCount };
  } finally {
    client.release();
  }
}

