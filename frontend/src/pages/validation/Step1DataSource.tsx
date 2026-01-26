import {
  Button,
  Box,
  Typography,
  Alert,
  TextField,
  Chip
} from '@mui/material';
import { useRef, useState } from 'react';
import StepLayout from '../../components/StepLayout';
import { useValidationStore } from '../../store/validationStore';
import { readExcelFile, getPVIList } from '../../utils/excelReader';
import Autocomplete from '@mui/material/Autocomplete';

export default function Step1DataSource() {
  const { setStep, setExcelData, setPVIList } = useValidationStore();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [pviDropdownValues, setPviDropdownValues] = useState<string[]>([]);
  const [selectedPvi, setSelectedPvi] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The exact 17 allowed PVIs
  const allowedPvis = [
    "028538", "028539", "028540", "028541", "028542", "028543", "028544", "028545",
    "028546", "028547", "028548", "028549", "028550", "028551", "028552", "028553", "028554"
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setDebugInfo('');
    setPviDropdownValues([]);
    setSelectedPvi([]);

    try {
      const data = await readExcelFile(file);

      if (data.length === 0) {
        setError('No data found in Excel file');
        return;
      }

      const allPvis = getPVIList(data);

      // Filter to keep ONLY allowed PVIs
      const filteredPvis = allPvis.filter(pvi => allowedPvis.includes(pvi));

      if (filteredPvis.length === 0) {
        setError('None of the allowed PVI numbers found in Excel file.');
        return;
      }

      setPviDropdownValues(filteredPvis);
      setSelectedPvi([]);

      setDebugInfo(
        `Found ${data.length} rows and ${filteredPvis.length} allowed PVI numbers: ` +
        `${filteredPvis.join(', ')}`
      );

      setExcelData(data);
      setPVIList(filteredPvis);
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
        Validation Process
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {debugInfo && <Alert severity="info" sx={{ mb: 2 }}>{debugInfo}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
        <Box>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Use Existing Data'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </Box>
        <Box>
          <Button fullWidth variant="outlined">
            Upload New File
          </Button>
        </Box>
      </Box>

      {/* PVI Dropdown */}
      {pviDropdownValues.length > 0 && (
        <Autocomplete
          multiple
          freeSolo={false} // restrict to dropdown options only
          options={pviDropdownValues}
          value={selectedPvi}
          onChange={(event, newValue) => setSelectedPvi(newValue)}
          renderTags={(value: string[], getTagProps) =>
            value.map((option: string, index: number) => (
              <Chip key={option} label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Select PVI(s)"
              placeholder="Select PVI(s)"
            />
          )}
        />
      )}
    </StepLayout>
  );
}
