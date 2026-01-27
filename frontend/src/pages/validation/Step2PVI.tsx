import { MenuItem, Select, Typography, Alert } from '@mui/material';
import StepLayout from '../../components/StepLayout';
import StepNavigation from '../../components/StepNavigation';
import { useValidationStore } from '../../store/validationStore';

export default function Step2PVI() {
  const { pvi, setPVI, setStep, pviList } = useValidationStore();

  if (!pviList || pviList.length === 0) {
    return (
      <StepLayout>
        <Typography variant="h4">Validation Process</Typography>
        <Alert severity="warning" sx={{ mt: 3 }}>
          No PVI data found. Please upload an Excel file first.
        </Alert>
      </StepLayout>
    );
  }

  return (
    <StepLayout>
      <Typography variant="h4">Select PVI</Typography>

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
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
        disableNext={!pvi}
      />
    </StepLayout>
  );
}
