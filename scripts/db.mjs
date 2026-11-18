import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const host = process.env.PG_HOST || 'localhost';
const port = parseInt(process.env.PG_PORT || '5432', 10);

export const pool = new Pool({
  host,
  port,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'aicms',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.warn('⚠️ PostgreSQL pool notice (recovering):', err.message);
});

export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error('❌ Database Query Error:', err.message, '\nQuery:', text);
    throw err;
  }
}

export async function testConnection() {
  try {
    const res = await query('SELECT NOW() as current_time, COUNT(*) as agent_count FROM agents');
    console.log(`✅ PostgreSQL connected successfully (${host}:${port}) to \`aicms\` at`, res.rows[0].current_time);
    console.log('   Total agents registered:', res.rows[0].agent_count);
    return true;
  } catch (err) {
    console.error('❌ Failed connecting to PostgreSQL:', err.message);
    return false;
  }
}
