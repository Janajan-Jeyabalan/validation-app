import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import StepLayout from '../../components/StepLayout';
import { useValidationStore } from '../../store/validationStore';

export default function Step4Validation() {
  const { pvi, uloc, selectedPart, setStep, reset } = useValidationStore();

  if (!selectedPart) {
    return (
      <StepLayout>
        <Typography>No part data found. Please go back.</Typography>
      </StepLayout>
    );
  }

  return (
    <StepLayout>
      <Typography variant="h4">Validation Process</Typography>
      <Typography sx={{ mb: 3 }}>Scan serial numbers for parts</Typography>

      <Typography sx={{ mb: 2 }}>
        <strong>PVI:</strong> {pvi} | <strong>ULOC:</strong> {uloc}
      </Typography>

      {/* PART CARD */}
      <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography fontWeight="bold">Part Data</Typography>
        <Typography>ITEM: {selectedPart.item}</Typography>
        <Typography>PART: {selectedPart.part}</Typography>
        <Typography>PART DESC: {selectedPart.partDesc}</Typography>
        <Typography>SUPPNM: {selectedPart.suppnm}</Typography>
        <Typography>DUNS: {selectedPart.duns}</Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <TextField fullWidth placeholder="Enter serial number" />
          <Button variant="contained">Scan</Button>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={() => setStep(3)}>
          Back
        </Button>
        <Button variant="outlined" onClick={reset}>
          Start Over
        </Button>
      </Box>
    </StepLayout>
  );
}
