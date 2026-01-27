import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import StepLayout from '../../components/StepLayout';
import { useValidationStore } from '../../store/validationStore';
import { useState } from 'react';

interface ScanState {
  scannedValue: string;
  completed: boolean;
  error: string;
}

export default function Step4Validation() {
  const { pvi, uloc, selectedParts, setStep, reset } =
    useValidationStore();

  const [scanStates, setScanStates] = useState<ScanState[]>(
    selectedParts.map(() => ({
      scannedValue: '',
      completed: false,
      error: '',
    }))
  );

  const handleScan = (index: number, scannedValue: string) => {
    const expectedPart = selectedParts[index].part;

    setScanStates((prev) =>
      prev.map((state, i) => {
        if (i !== index) return state;

        if (state.completed) {
          return state;
        }

        if (scannedValue === expectedPart) {
          return {
            scannedValue,
            completed: true,
            error: '',
          };
        }

        return {
          scannedValue,
          completed: false,
          error: 'Scanned part does not match expected PART number',
        };
      })
    );
  };

  if (selectedParts.length === 0) {
    return (
      <StepLayout>
        <Typography>No part data found.</Typography>
      </StepLayout>
    );
  }

  const allCompleted = scanStates.every((s) => s.completed);

  return (
    <StepLayout>
      <Typography variant="h4">Validation Process</Typography>
      <Typography sx={{ mb: 2 }}>
        PVI: {pvi} | ULOC: {uloc}
      </Typography>

      {selectedParts.map((part, index) => {
        const scan = scanStates[index];

        return (
          <Box
            key={index}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              border: '2px solid',
              borderColor: scan.completed ? 'success.main' : 'divider',
              bgcolor: scan.completed ? 'success.light' : 'background.paper',
            }}
          >
            <Typography fontWeight="bold" gutterBottom>
              Part {index + 1}
            </Typography>

            <Typography>ITEM: {part.item}</Typography>
            <Typography>PART: {part.part}</Typography>
            <Typography>PART DESC: {part.partDesc}</Typography>
            <Typography>SUPPNM: {part.suppnm}</Typography>
            <Typography>DUNS: {part.duns}</Typography>

            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                disabled={scan.completed}
                label="Scan Serial / Part Number"
                placeholder="Scan with Bluetooth scanner"
                value={scan.scannedValue}
                error={!!scan.error}
                helperText={
                  scan.completed
                    ? '✔ Part validated'
                    : scan.error || 'Waiting for scan'
                }
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setScanStates((prev) =>
                    prev.map((s, i) =>
                      i === index ? { ...s, scannedValue: value } : s
                    )
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleScan(index, scan.scannedValue.trim());
                  }
                }}
              />
            </Box>
          </Box>
        );
      })}

      {allCompleted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ All parts for this ULOC have been successfully validated!
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button onClick={() => setStep(3)}>Back</Button>
        <Button variant="contained" onClick={reset}>
          Start New Validation
        </Button>
      </Box>
    </StepLayout>
  );
}
