import express from 'express';
import { getPool } from '../db.js';

const router = express.Router();

function parseMetadata(metadata) {
  if (!metadata) {
    return {};
  }

  if (typeof metadata === 'object') {
    return metadata;
  }

  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
}

// Create a new validation
router.post('/', async (req, res) => {
  const {
    user_id,
    status,
    steps,
    metadata
  } = req.body;

  if (!user_id) {
    return res.status(400).json({
      error: 'user_id required'
    });
  }

  const pool = await getPool();

  if (!pool) {
    return res.status(503).json({
      error: 'database unavailable'
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [validationResult] =
      await connection.query(
        `INSERT INTO validations
          (
            user_id,
            status,
            metadata,
            created_at
          )
         VALUES (?, ?, ?, NOW())`,
        [
          user_id,
          status || 'draft',
          metadata
            ? JSON.stringify(metadata)
            : null
        ]
      );

    const validationId =
      validationResult.insertId;

    if (Array.isArray(steps)) {
      for (const step of steps) {
        await connection.query(
          `INSERT INTO validation_steps
            (
              validation_id,
              step_name,
              data,
              completed_at
            )
           VALUES (?, ?, ?, ?)`,
          [
            validationId,
            step.step_name || null,
            step.data
              ? JSON.stringify(step.data)
              : null,
            step.completed_at || null
          ]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      id: validationId
    });
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback errors.
      }
    }

    console.error(err);

    res.status(500).json({
      error: 'server error'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get all validations and their parts for one user
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  const pool = await getPool();

  if (!pool) {
    return res.status(503).json({
      error: 'database unavailable'
    });
  }

  try {
    const [validations] = await pool.query(
      `SELECT
        id,
        user_id,
        pvi,
        uloc,
        building,
        owner,
        status,
        total_parts,
        validated_count,
        metadata,
        created_at
       FROM validations
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    if (!validations.length) {
      return res.json({
        validations: []
      });
    }

    const validationIds = validations.map(
      (validation) => validation.id
    );

    const [parts] = await pool.query(
      `SELECT
        id,
        validation_id,
        part,
        item,
        part_desc,
        supplier_name,
        duns,
        validated,
        scanned_value,
        validated_at,
        created_at
       FROM validation_parts
       WHERE validation_id IN (?)
       ORDER BY id`,
      [validationIds]
    );

    const partsByValidation = {};

    for (const part of parts) {
      const validationKey = String(
        part.validation_id
      );

      if (!partsByValidation[validationKey]) {
        partsByValidation[validationKey] = [];
      }

      partsByValidation[validationKey].push({
        id: part.id,
        part: part.part || '',
        item: part.item || '',
        partDesc: part.part_desc || '',
        suppnm: part.supplier_name || '',
        duns: part.duns || '',
        validated: Boolean(part.validated),
        scannedValue: part.scanned_value || '',
        validatedAt: part.validated_at,
        createdAt: part.created_at
      });
    }

    const results = validations.map(
      (validation) => ({
        ...validation,
        metadata: parseMetadata(
          validation.metadata
        ),
        parts:
          partsByValidation[
            String(validation.id)
          ] || []
      })
    );

    res.json({
      validations: results
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'server error'
    });
  }
});

// Complete an existing validation and save its parts
router.put(
  '/:validationId/complete',
  async (req, res) => {
    const validationId =
      req.params.validationId;

    const {
      pvi,
      uloc,
      parts,
      validated_count
    } = req.body;

    if (!validationId) {
      return res.status(400).json({
        error: 'validationId required'
      });
    }

    if (!pvi) {
      return res.status(400).json({
        error: 'pvi required'
      });
    }

    if (!uloc) {
      return res.status(400).json({
        error: 'uloc required'
      });
    }

    if (!Array.isArray(parts)) {
      return res.status(400).json({
        error: 'parts must be an array'
      });
    }

    const pool = await getPool();

    if (!pool) {
      return res.status(503).json({
        error: 'database unavailable'
      });
    }

    let connection;

    try {
      connection =
        await pool.getConnection();

      await connection.beginTransaction();

      const [validationRows] =
        await connection.query(
          `SELECT
            id,
            metadata
           FROM validations
           WHERE id = ?`,
          [validationId]
        );

      if (!validationRows.length) {
        await connection.rollback();

        return res.status(404).json({
          error: 'validation not found'
        });
      }

      const existingMetadata =
        parseMetadata(
          validationRows[0].metadata
        );

      const validatedCount =
        typeof validated_count === 'number'
          ? validated_count
          : parts.filter(
              (part) => part.validated
            ).length;

      const status =
        validatedCount === parts.length
          ? 'complete'
          : 'partial';

      const updatedMetadata = {
        ...existingMetadata,
        pvi,
        uloc
      };

      await connection.query(
        `UPDATE validations
         SET
           pvi = ?,
           uloc = ?,
           status = ?,
           total_parts = ?,
           validated_count = ?,
           metadata = ?
         WHERE id = ?`,
        [
          pvi,
          uloc,
          status,
          parts.length,
          validatedCount,
          JSON.stringify(updatedMetadata),
          validationId
        ]
      );

      // Avoid duplicate part records if a
      // validation is saved more than once.
      await connection.query(
        `DELETE FROM validation_parts
         WHERE validation_id = ?`,
        [validationId]
      );

      for (const part of parts) {
        await connection.query(
          `INSERT INTO validation_parts
            (
              validation_id,
              part,
              item,
              part_desc,
              supplier_name,
              duns,
              validated,
              scanned_value,
              validated_at
            )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            validationId,
            part.part || '',
            part.item || null,
            part.partDesc || null,
            part.suppnm || null,
            part.duns || null,
            part.validated ? 1 : 0,
            part.scannedValue || null,
            part.validated
              ? new Date()
              : null
          ]
        );
      }

      await connection.query(
        `INSERT INTO validation_steps
          (
            validation_id,
            step_name,
            data,
            completed_at
          )
         VALUES (?, ?, ?, NOW())`,
        [
          validationId,
          'Parts validation completed',
          JSON.stringify({
            pvi,
            uloc,
            totalParts: parts.length,
            validatedCount,
            status
          })
        ]
      );

      await connection.commit();

      res.json({
        success: true,
        validation: {
          id: Number(validationId),
          pvi,
          uloc,
          status,
          total_parts: parts.length,
          validated_count: validatedCount
        }
      });
    } catch (err) {
      if (connection) {
        try {
          await connection.rollback();
        } catch {
          // Ignore rollback errors.
        }
      }

      console.error(err);

      res.status(500).json({
        error: 'server error'
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// Bulk upload endpoint
router.post('/bulk', async (req, res) => {
  const items = Array.isArray(req.body)
    ? req.body
    : req.body.items;

  if (!Array.isArray(items)) {
    return res.status(400).json({
      error:
        'expected array of validation items'
    });
  }

  const pool = await getPool();

  if (!pool) {
    return res.status(503).json({
      error: 'database unavailable'
    });
  }

  let connection;
  const results = [];

  try {
    connection =
      await pool.getConnection();

    for (const item of items) {
      try {
        await connection.beginTransaction();

        const {
          user_id,
          status,
          metadata,
          steps
        } = item;

        if (!user_id) {
          throw new Error(
            'user_id is required'
          );
        }

        const [validationResult] =
          await connection.query(
            `INSERT INTO validations
              (
                user_id,
                status,
                metadata,
                created_at
              )
             VALUES (?, ?, ?, NOW())`,
            [
              user_id,
              status || 'draft',
              metadata
                ? JSON.stringify(metadata)
                : null
            ]
          );

        const validationId =
          validationResult.insertId;

        if (Array.isArray(steps)) {
          for (const step of steps) {
            await connection.query(
              `INSERT INTO validation_steps
                (
                  validation_id,
                  step_name,
                  data,
                  completed_at
                )
               VALUES (?, ?, ?, ?)`,
              [
                validationId,
                step.step_name || null,
                step.data
                  ? JSON.stringify(step.data)
                  : null,
                step.completed_at || null
              ]
            );
          }
        }

        await connection.commit();

        results.push({
          success: true,
          id: validationId
        });
      } catch (itemError) {
        try {
          await connection.rollback();
        } catch {
          // Ignore rollback errors.
        }

        results.push({
          success: false,
          error:
            itemError?.message || 'error'
        });
      }
    }

    res.json({
      results
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'server error'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;