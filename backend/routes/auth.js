import express from 'express';
import { getPool } from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });

  const pool = await getPool();
  if (!pool) return res.status(503).json({ error: 'database unavailable' });

  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id,email,name FROM users WHERE email = ?', [email]);
      if (rows.length) return res.json({ user: rows[0] });

      const [result] = await conn.query('INSERT INTO users (email, name, created_at) VALUES (?, ?, NOW())', [email, name || null]);
      const [newRows] = await conn.query('SELECT id,email,name FROM users WHERE id = ?', [result.insertId]);
      res.json({ user: newRows[0] });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
