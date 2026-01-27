import {
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  TextField,
} from '@mui/material';
import { useRef, useState } from 'react';
import StepLayout from '../../components/StepLayout';
import { useValidationStore } from '../../store/validationStore';
import { readExcelFile } from '../../utils/excelReader';
import Autocomplete from '@mui/material/Autocomplete';

export default function Step1DataSource() {
  const {
    setStep,
    setPVIList,
    setULOCList,
    setRows,
  } = useValidationStore();

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const data = await readExcelFile(file);

      if (!data || data.pviList.length === 0) {
        setError('No PVI numbers found in Excel file.');
        return;
      }

      // Set store
      setPVIList(data.pviList);
      setULOCList(data.ulocList);
      setRows(data.rows);

      // Move to PVI page
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read Excel file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StepLayout>
      <Typography variant="h4" gutterBottom>
        Upload Excel File
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Select Excel File'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </Box>
    </StepLayout>
  );
}
