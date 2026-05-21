import * as XLSX from 'xlsx';

/**
 * Represents a single part row extracted from Excel
 * (row 1 and onward)
 */
export interface PartRow {
  uloc: string;      // Column A (index 0)
  item: string;      // Column D (index 3)
  part: string;      // Column F (index 5)
  partDesc: string;  // Column G (index 6)
  suppnm: string;    // Column H (index 7)
  duns: string;      // Column I (index 8)
}

/**
 * Parsed Excel result returned to the app
 */
export interface ExcelParsedData {
  pviList: string[];
  ulocList: string[];
  rows: PartRow[];
}

export async function readExcelFile(file: File): Promise<ExcelParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const binary = e.target?.result;
        if (!binary) {
          reject(new Error('Failed to read Excel file'));
          return;
        }

        const workbook = XLSX.read(binary, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as any[][];

        if (rows.length < 1) {
          reject(new Error('Excel file is empty.'));
          return;
        }

        /* -------------------- PVI (ROW 1) -------------------- */
        const firstPVIrowIndex = rows.findIndex((row) =>
          row.some((cell) => {
            const raw = String(cell || '').trim();
            if (raw.startsWith('0')) {
              return true;
            }
            if (typeof cell === 'number') {
              const restored = String(cell).padStart(6, '0');
              return restored.startsWith('0');
            }
            return false;
          })
        );

        const pviRow = firstPVIrowIndex >= 0 ? rows[firstPVIrowIndex] : rows[0];

        const pviList = Array.from(
          new Set(
            pviRow
              .map((cell) => {
                const raw = String(cell || '').trim();
                if (raw.startsWith('0')) {
                  return raw;
                }

                if (typeof cell === 'number' && /^\d+$/.test(String(cell))) {
                  const restored = String(cell).padStart(6, '0');
                  if (restored.startsWith('0')) {
                    return restored;
                  }
                }

                return '';
              })
              .filter((value) => value.length > 0)
          )
        );

        if (pviList.length === 0) {
          reject(new Error('No valid PVI numbers found in row 1.'));
          return;
        }

        /* -------------------- PART ROWS (ROW 1+) -------------------- */
        const dataRows = rows.slice(0);

        const parsedRows: PartRow[] = dataRows
          .map((row) => ({
            uloc: String(row[0] || '').trim(),      // Column A
            item: String(row[3] || '').trim(),      // Column D
            part: String(row[5] || '').trim(),      // Column F
            partDesc: String(row[6] || '').trim(),  // Column G
            suppnm: String(row[7] || '').trim(),    // Column H
            duns: String(row[8] || '').trim(),      // Column I
          }))
          .filter(row => row.uloc); // remove empty rows

        if (parsedRows.length === 0) {
          reject(new Error('No valid part rows found in Excel file.'));
          return;
        }

        /* -------------------- ULOC LIST -------------------- */
        const ulocList = Array.from(
          new Set(parsedRows.map(row => row.uloc))
        ).sort();

        resolve({
          pviList,
          ulocList,
          rows: parsedRows,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };

    reader.readAsArrayBuffer(file);
  });
}
