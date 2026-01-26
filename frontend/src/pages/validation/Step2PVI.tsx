import { MenuItem, Select, Typography, Box, Alert } from '@mui/material';
import StepLayout from '../../components/StepLayout';
import StepNavigation from '../../components/StepNavigation';
import { useValidationStore } from '../../store/validationStore';

export default function Step2PVI() {
  const { pvi, setPVI, setStep, reset, pviList, excelData } = useValidationStore();

  if (excelData.length === 0) {
    return (
      <StepLayout>
        <Typography variant="h4">Validation Process</Typography>
        <Alert severity="warning" sx={{ mt: 3 }}>
          No data loaded. Please go back and select an Excel file first.
        </Alert>
      </StepLayout>
    );
  }

  return (
    <StepLayout>
      <Typography variant="h4">Validation Process</Typography>

      <Typography sx={{ mt: 3 }}>PVI Number</Typography>

      <Select
        fullWidth
        value={pvi}
        onChange={(e) => setPVI(e.target.value)}
        displayEmpty
      >
        <MenuItem value="">Select a PVI...</MenuItem>
        {pviList.map((p) => (
          <MenuItem key={p} value={p}>
            {p}
          </MenuItem>
        ))}
      </Select>

      <StepNavigation
        onNext={() => setStep(3)}
        onReset={reset}
        disableNext={!pvi}
      />
    </StepLayout>
  );
}
