import { MenuItem, Select, Typography, Alert, Box } from '@mui/material';
import { useMemo } from 'react';
import StepLayout from '../../components/StepLayout';
import StepNavigation from '../../components/StepNavigation';
import { useValidationStore } from '../../store/validationStore';
import { getDataForPVI } from '../../utils/excelReader';

export default function Step3ULOC() {
  const { pvi, uloc, setULOC, setStep, excelData } = useValidationStore();

  // Define allowed ULOC prefixes
  const allowedPrefixes = ['2B', '2C', '2F', '2T', 'CAA', 'GFX'];

  const ulocList = useMemo(() => {
    if (!pvi || excelData.length === 0) return [];

    // Get rows for selected PVI
    const pviData = getDataForPVI(excelData, pvi);

    // Extract ULOC values and filter by allowed prefixes (or blank)
    const filteredULOCs = [...new Set(
      pviData
        .map((row: any) => {
          // Map possible ULOC column names
          return row.ULOC || row.uloc || row['ULOC Number'] || row['Uloc'] || '';
        })
        .filter(u => {
          if (!u) return true; // allow blank
          return allowedPrefixes.some(prefix => u.startsWith(prefix));
        })
    )].sort();

    return filteredULOCs;
  }, [pvi, excelData]);

  if (!pvi || excelData.length === 0) {
    return (
      <StepLayout>
        <Typography variant="h4">Validation Process</Typography>
        <Alert severity="warning" sx={{ mt: 3 }}>
          No PVI selected. Please go back and select a PVI first.
        </Alert>
      </StepLayout>
    );
  }

  return (
    <StepLayout>
      <Typography variant="h4">Validation Process</Typography>
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography>Selected PVI: <strong>{pvi}</strong></Typography>
      </Box>

      <Typography sx={{ mt: 3 }}>ULOC</Typography>

      <Select
        fullWidth
        value={uloc}
        onChange={(e) => setULOC(e.target.value)}
        displayEmpty
      >
        <MenuItem value="">Select a ULOC...</MenuItem>
        {ulocList.map((u) => (
          <MenuItem key={u} value={u}>
            {u}
          </MenuItem>
        ))}
      </Select>

      {ulocList.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No ULOC data found for the selected PVI with allowed prefixes. Check your Excel file structure.
        </Alert>
      )}

      <StepNavigation
        onBack={() => setStep(2)}
        disableNext={!uloc}
      />
    </StepLayout>
  );
}
