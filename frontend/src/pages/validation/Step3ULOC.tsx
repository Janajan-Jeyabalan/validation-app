import { Box, Typography, Alert, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import StepLayout from '../../components/StepLayout';
import StepNavigation from '../../components/StepNavigation';
import { useValidationStore } from '../../store/validationStore';

export default function Step3ULOC() {
  const {
    uloc,
    setULOC,
    setStep,
    ulocList,
    rows,
    setSelectedParts,
  } = useValidationStore();

  if (ulocList.length === 0 || rows.length === 0) {
    return (
      <StepLayout>
        <Alert severity="warning">
          No ULOC data found. Please upload an Excel file first.
        </Alert>
      </StepLayout>
    );
  }

  const handleNext = () => {
    const matchedRows = rows.filter(row => row.uloc === uloc);

    if (matchedRows.length === 0) return;

    setSelectedParts(matchedRows);
    setStep(4);
  };

  return (
    <StepLayout>
      <Typography variant="h4">Select ULOC</Typography>

      <Box sx={{ mt: 3 }}>
        <Autocomplete
          options={ulocList}
          value={uloc}
          freeSolo
          onChange={(e, v) => setULOC(v || '')}
          renderInput={(params) => (
            <TextField {...params} label="ULOC" />
          )}
        />
      </Box>

      <StepNavigation
        onBack={() => setStep(2)}
        onNext={handleNext}
        disableNext={!uloc}
      />
    </StepLayout>
  );
}
