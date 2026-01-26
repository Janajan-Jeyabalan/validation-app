import * as XLSX from 'xlsx';

export interface BOMData {
  pvi: string;
  [key: string]: any;
}

export async function readExcelFile(file: File): Promise<BOMData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]; // get raw rows

        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }

        // Extract all PVI-like values from the sheet:
        const allPVIs: Set<string> = new Set();

        for (const row of jsonData) {
          for (const cell of row) {
            const cellStr = String(cell || '').trim();
            if (cellStr.startsWith('0') && /^\d+$/.test(cellStr)) {
              allPVIs.add(cellStr);
            }
          }
        }

        if (allPVIs.size === 0) {
          reject(new Error('No PVI numbers starting with 0 found in Excel file.'));
          return;
        }

        // Return as array of BOMData objects with pvi only:
        const normalizedData = Array.from(allPVIs).map(pvi => ({ pvi }));

        resolve(normalizedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}

// getPVIList can remain the same:
export function getPVIList(data: BOMData[]): string[] {
  const uniquePVIs = new Set<string>();

  data.forEach(row => {
    if (row.pvi && row.pvi.trim()) {
      uniquePVIs.add(row.pvi.trim());
    }
  });

  return Array.from(uniquePVIs).sort();
}

export function getDataForPVI(data: BOMData[], pvi: string): BOMData[] {
  return data.filter(row => row.pvi === pvi);
}
