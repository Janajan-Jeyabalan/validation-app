import { Box, Typography, TextField, Alert } from '@mui/material';
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
    setSelectedPart,
  } = useValidationStore();

  if (!ulocList || ulocList.length === 0 || !rows || rows.length === 0) {
    return (
      <StepLayout>
        <Typography variant="h4">Validation Process</Typography>
        <Alert severity="warning" sx={{ mt: 3 }}>
          No ULOC data found. Please upload an Excel file first.
        </Alert>
      </StepLayout>
    );
  }

  const handleNext = () => {
    const matchedRow = rows.find((row) => row.uloc === uloc);
    if (!matchedRow) return;

    setSelectedPart(matchedRow);
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
          onChange={(event, newValue) => setULOC(newValue || '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label="ULOC"
              placeholder="Search ULOC"
              variant="outlined"
              fullWidth
            />
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
