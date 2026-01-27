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
  const { pvi, uloc, selectedParts, setStep, reset } =
    useValidationStore();

  if (selectedParts.length === 0) {
    return (
      <StepLayout>
        <Typography>No part data found.</Typography>
      </StepLayout>
    );
  }

  return (
    <StepLayout>
      <Typography variant="h4">Validation Process</Typography>
      <Typography sx={{ mb: 2 }}>
        PVI: {pvi} | ULOC: {uloc}
      </Typography>

      {selectedParts.map((part, index) => (
        <Box
          key={index}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography fontWeight="bold">Part {index + 1}</Typography>
          <Typography>ITEM: {part.item}</Typography>
          <Typography>PART: {part.part}</Typography>
          <Typography>PART DESC: {part.partDesc}</Typography>
          <Typography>SUPPNM: {part.suppnm}</Typography>
          <Typography>DUNS: {part.duns}</Typography>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField fullWidth placeholder="Enter serial number" />
            <Button variant="contained">Scan</Button>
          </Box>
        </Box>
      ))}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button onClick={() => setStep(3)}>Back</Button>
        <Button onClick={reset}>Start Over</Button>
      </Box>
    </StepLayout>
  );
}
