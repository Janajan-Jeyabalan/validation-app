import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';
import { getPool } from '../db.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDirectory = path.join(__dirname, '..');
const uploadsDirectory = path.join(backendDirectory, 'uploads');

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadsDirectory);
  },

  filename: (req, file, callback) => {
    const safeOriginalName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${safeOriginalName}`;

    callback(null, uniqueName);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024
  },

  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension !== '.xlsx') {
      return callback(new Error('Only .xlsx Excel files are supported'));
    }

    callback(null, true);
  }
});

function cellValueToText(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    if (value.text !== undefined) {
      return String(value.text).trim();
    }

    if (value.result !== undefined) {
      return String(value.result).trim();
    }

    if (Array.isArray(value.richText)) {
      return value.richText
        .map((part) => part.text || '')
        .join('')
        .trim();
    }
  }

  return String(value).trim();
}

async function readExcelSummary(filePath) {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(filePath);

  let worksheet = workbook.getWorksheet('BOM V2 19th May');

  if (!worksheet) {
    worksheet = workbook.worksheets.find((sheet) => {
      const firstHeader = cellValueToText(sheet.getCell(1, 1).value);
      return firstHeader.toUpperCase() === 'ULOC';
    });
  }

  if (!worksheet) {
    worksheet = workbook.worksheets[0];
  }

  if (!worksheet) {
    return {
      sheetName: null,
      rowCount: 0,
      columnCount: 0,
      headers: [],
      pviNumbers: [],
      ulocCount: 0,
      uniqueUlocCount: 0
    };
  }

  const headers = [];

  for (
    let columnNumber = 1;
    columnNumber <= worksheet.columnCount;
    columnNumber += 1
  ) {
    headers.push(
      cellValueToText(worksheet.getCell(1, columnNumber).value)
    );
  }

  const pviNumbers = headers
    .map((header) => {
      const match = header.match(/^(\d{6})(?:-|$)/);
      return match ? match[1] : null;
    })
    .filter(Boolean);

  const ulocs = [];

  for (
    let rowNumber = 2;
    rowNumber <= worksheet.rowCount;
    rowNumber += 1
  ) {
    const uloc = cellValueToText(
      worksheet.getCell(rowNumber, 1).value
    );

    if (uloc) {
      ulocs.push(uloc);
    }
  }

  const uniqueUlocs = [...new Set(ulocs)];

  return {
    sheetName: worksheet.name,
    rowCount: Math.max(worksheet.rowCount - 1, 0),
    columnCount: headers.length,
    headers,
    pviNumbers,
    ulocCount: ulocs.length,
    uniqueUlocCount: uniqueUlocs.length
  };
}

// Upload and read one Excel file
router.post(
  '/:validationId',
  upload.single('file'),
  async (req, res) => {
    const validationId = req.params.validationId;

    if (!req.file) {
      return res.status(400).json({
        error: 'Excel file required'
      });
    }

    const pool = await getPool();

    if (!pool) {
      fs.unlink(req.file.path, () => {});

      return res.status(503).json({
        error: 'database unavailable'
      });
    }

    try {
      const [validationRows] = await pool.query(
        'SELECT id FROM validations WHERE id = ?',
        [validationId]
      );

      if (!validationRows.length) {
        fs.unlink(req.file.path, () => {});

        return res.status(404).json({
          error: 'validation not found'
        });
      }

      const relativePath = path
        .relative(backendDirectory, req.file.path)
        .replaceAll('\\', '/');

      const [fileResult] = await pool.query(
        `INSERT INTO uploaded_files
          (
            validation_id,
            filename,
            filesize,
            mime,
            path,
            uploaded_at
          )
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          validationId,
          req.file.originalname,
          req.file.size,
          req.file.mimetype,
          relativePath
        ]
      );

      let summary = null;
      let parsingWarning = null;

      try {
        summary = await readExcelSummary(req.file.path);

        await pool.query(
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
            'Excel file read',
            JSON.stringify({
              success: true,
              errors: [],
              filename: req.file.originalname,
              ...summary
            })
          ]
        );

        await pool.query(
          `UPDATE validations
           SET status = ?
           WHERE id = ?`,
          ['completed', validationId]
        );
      } catch (parseError) {
        console.error('Excel reading warning:', parseError);

        parsingWarning =
          'The file was uploaded, but its Excel contents could not be read';

        await pool.query(
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
            'Excel file uploaded',
            JSON.stringify({
              success: true,
              errors: [],
              filename: req.file.originalname,
              warning: parsingWarning
            })
          ]
        );
      }

      res.status(201).json({
        file: {
          id: fileResult.insertId,
          validation_id: Number(validationId),
          filename: req.file.originalname,
          filesize: req.file.size,
          mime: req.file.mimetype,
          path: relativePath
        },
        valid: true,
        errors: [],
        summary,
        warning: parsingWarning
      });
    } catch (err) {
      fs.unlink(req.file.path, () => {});
      console.error(err);

      res.status(500).json({
        error: 'server error'
      });
    }
  }
);

// Get uploaded files belonging to one validation
router.get('/:validationId', async (req, res) => {
  const pool = await getPool();

  if (!pool) {
    return res.status(503).json({
      error: 'database unavailable'
    });
  }

  try {
    const [files] = await pool.query(
      `SELECT
        id,
        validation_id,
        filename,
        filesize,
        mime,
        path,
        uploaded_at
       FROM uploaded_files
       WHERE validation_id = ?
       ORDER BY uploaded_at DESC`,
      [req.params.validationId]
    );

    res.json({ files });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'server error'
    });
  }
});

// Handle Multer upload errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: err.message
    });
  }

  if (err) {
    return res.status(400).json({
      error: err.message
    });
  }

  next();
});

export default router;