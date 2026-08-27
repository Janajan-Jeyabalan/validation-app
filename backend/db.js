import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;

// Lazily create the pool on first request. If DB is unreachable, return null
export async function getPool() {
  if (pool) return pool;

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'validation_app',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    });

    // test a connection
    const conn = await pool.getConnection();
    conn.release();

    return pool;
  } catch (err) {
    console.error('Database connection failed:', err?.message || err);
    pool = null;
    return null;
  }
}
