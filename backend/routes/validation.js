import express from 'express';
import { getPool } from '../db.js';

const router = express.Router();

// Create a new validation
router.post('/', async (req, res) => {
  const { user_id, status, steps, metadata } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id required' });
  }

  const pool = await getPool();

  if (!pool) {
    return res.status(503).json({ error: 'database unavailable' });
  }

  try {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [vResult] = await conn.query(
        'INSERT INTO validations (user_id, status, metadata, created_at) VALUES (?, ?, ?, NOW())',
        [
          user_id,
          status || 'draft',
          metadata ? JSON.stringify(metadata) : null
        ]
      );

      const validationId = vResult.insertId;

      if (Array.isArray(steps)) {
        for (const s of steps) {
          await conn.query(
            'INSERT INTO validation_steps (validation_id, step_name, data, completed_at) VALUES (?, ?, ?, ?)',
            [
              validationId,
              s.step_name || null,
              s.data ? JSON.stringify(s.data) : null,
              s.completed_at || null
            ]
          );
        }
      }

      await conn.commit();

      res.json({ id: validationId });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Get all validations for a user
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  const pool = await getPool();

  if (!pool) {
    return res.status(503).json({ error: 'database unavailable' });
  }

  try {
    const [validations] = await pool.query(
      'SELECT id, user_id, status, metadata, created_at FROM validations WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({ validations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Bulk upload endpoint
// Accepts an array of validation objects and returns per-item results
router.post('/bulk', async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : req.body.items;

  if (!Array.isArray(items)) {
    return res.status(400).json({
      error: 'expected array of validation items'
    });
  }

  const pool = await getPool();

  if (!pool) {
    return res.status(503).json({
      error: 'database unavailable'
    });
  }

  const conn = await pool.getConnection();
  const results = [];

  try {
    for (const item of items) {
      try {
        await conn.beginTransaction();

        const { user_id, status, metadata, steps } = item;

        if (!user_id) {
          throw new Error('user_id is required');
        }

        const [vResult] = await conn.query(
          'INSERT INTO validations (user_id, status, metadata, created_at) VALUES (?, ?, ?, NOW())',
          [
            user_id,
            status || 'draft',
            metadata ? JSON.stringify(metadata) : null
          ]
        );

        const validationId = vResult.insertId;

        if (Array.isArray(steps)) {
          for (const s of steps) {
            await conn.query(
              'INSERT INTO validation_steps (validation_id, step_name, data, completed_at) VALUES (?, ?, ?, ?)',
              [
                validationId,
                s.step_name || null,
                s.data ? JSON.stringify(s.data) : null,
                s.completed_at || null
              ]
            );
          }
        }

        await conn.commit();

        results.push({
          success: true,
          id: validationId
        });
      } catch (errItem) {
        try {
          await conn.rollback();
        } catch (e) {
          // Ignore rollback errors
        }

        results.push({
          success: false,
          error: errItem?.message ?? 'error'
        });
      }
    }

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  } finally {
    conn.release();
  }
});

export default router;