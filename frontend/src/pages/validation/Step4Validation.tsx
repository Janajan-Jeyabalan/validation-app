import { Box, Typography, TextField, Button, Divider, Alert, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StepLayout from '../../components/StepLayout';
import { useValidationStore } from '../../store/validationStore';
import { useState } from 'react';

interface ScanState {
  scannedValue: string;
  completed: boolean;
  error: string;
}

export default function Step4Validation() {
  const { pvi, uloc, selectedParts, setStep, reset, saveValidationRecord } = useValidationStore();

  const [scanStates, setScanStates] = useState<ScanState[]>(
    selectedParts.map(() => ({ scannedValue: '', completed: false, error: '' }))
  );

  const handleScan = (index: number, scannedValue: string) => {
    const expectedPart = selectedParts[index].part;
    setScanStates((prev) =>
      prev.map((state, i) => {
        if (i !== index || state.completed) return state;
        if (scannedValue === expectedPart) return { scannedValue, completed: true, error: '' };
        return { scannedValue, completed: false, error: 'Scanned part does not match expected PART number' };
      })
    );
  };

  const handleFinish = () => {
    saveValidationRecord(
      selectedParts.map((p, i) => ({
        part: p.part,
        item: p.item,
        partDesc: p.partDesc,
        suppnm: p.suppnm,
        duns: p.duns,
        validated: scanStates[i].completed,
      })),
      scanStates.filter((s) => s.completed).length
    );
    setStep(5);
  };

  if (selectedParts.length === 0) {
    return (
      <StepLayout>
        <Alert severity="warning">No part data found.</Alert>
      </StepLayout>
    );
  }

  const completedCount = scanStates.filter((s) => s.completed).length;
  const allCompleted = completedCount === selectedParts.length;
  const progressPct = Math.round((completedCount / selectedParts.length) * 100);

  return (
    <StepLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 11 }}>
          Step 4 of 4
        </Typography>
      </Box>

      <Typography variant="h4" sx={{ mb: 0.5 }}>Validation Process</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Scan each part number with your Bluetooth scanner or type it manually.
      </Typography>

      {/* Context strip */}
      <Box sx={{
        display: 'flex', gap: 2, mb: 3,
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}>
        {[['PVI', pvi], ['ULOC', uloc]].map(([label, val]) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'text.secondary', letterSpacing: '.06em' }}>
              {label}:
            </Typography>
            <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'primary.main', fontWeight: 500 }}>
              {val}
            </Typography>
          </Box>
        ))}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'text.secondary' }}>
            {completedCount}/{selectedParts.length}
          </Typography>
          <Box sx={{ width: 60, height: 4, borderRadius: 2, bgcolor: 'divider', overflow: 'hidden' }}>
            <Box sx={{
              height: '100%', borderRadius: 2,
              bgcolor: allCompleted ? 'success.main' : 'primary.main',
              width: `${progressPct}%`,
              transition: 'width .3s ease',
            }} />
          </Box>
        </Box>
      </Box>

      {/* Parts */}
      {selectedParts.map((part, index) => {
        const scan = scanStates[index];
        return (
          <Box
            key={index}
            sx={{
              p: 2.5, mb: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: scan.completed ? 'success.main' : scan.error ? 'error.main' : 'divider',
              bgcolor: scan.completed ? 'rgba(0,200,150,.04)' : 'background.paper',
              transition: 'all .2s ease',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 13, fontWeight: 600, letterSpacing: '.08em',
                color: 'text.secondary', textTransform: 'uppercase',
              }}>
                Part {index + 1}
              </Typography>
              <Chip
                size="small"
                label={scan.completed ? 'VALIDATED' : 'PENDING'}
                icon={scan.completed ? <CheckCircleOutlineIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                sx={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: '.04em', height: 22,
                  bgcolor: scan.completed ? 'rgba(0,200,150,.1)' : 'rgba(122,139,163,.1)',
                  color: scan.completed ? 'success.main' : 'text.secondary',
                  border: '1px solid',
                  borderColor: scan.completed ? 'rgba(0,200,150,.3)' : 'divider',
                  '& .MuiChip-icon': { color: 'success.main' },
                }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 2 }}>
              {[
                ['ITEM', part.item],
                ['PART', part.part],
                ['DESC', part.partDesc],
                ['SUPPNM', part.suppnm],
                ['DUNS', part.duns],
              ].map(([label, val]) => (
                <Box key={label}>
                  <Typography sx={{ fontSize: 10, letterSpacing: '.1em', color: 'text.secondary', textTransform: 'uppercase', mb: 0.25 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'text.primary' }}>
                    {val}
                  </Typography>
                </Box>
              ))}
            </Box>

            <TextField
              fullWidth
              size="small"
              disabled={scan.completed}
              placeholder={scan.completed ? '' : 'Scan or type part number…'}
              value={scan.scannedValue}
              error={!!scan.error}
              helperText={
                scan.completed
                  ? '✔ Part validated successfully'
                  : scan.error || 'Waiting for scanner input'
              }
              FormHelperTextProps={{
                sx: {
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: scan.completed ? 'success.main' : scan.error ? 'error.main' : 'text.secondary',
                },
              }}
              onChange={(e) => {
                const value = e.target.value.trim();
                setScanStates((prev) =>
                  prev.map((s, i) => i === index ? { ...s, scannedValue: value, error: '' } : s)
                );
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleScan(index, scan.scannedValue.trim());
                }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  letterSpacing: '.04em',
                },
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: 'rgba(0,200,150,.6)',
                },
              }}
            />
          </Box>
        );
      })}

      {allCompleted && (
        <Alert
          severity="success"
          sx={{
            mb: 2, borderRadius: 2,
            border: '1px solid rgba(0,200,150,.3)',
            bgcolor: 'rgba(0,200,150,.06)',
            fontFamily: "'Barlow', sans-serif",
            '& .MuiAlert-message': { fontWeight: 500 },
          }}
        >
          All {selectedParts.length} parts for ULOC {uloc} have been successfully validated.
        </Alert>
      )}

      <Divider sx={{ my: 3, borderColor: 'divider' }} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={() => setStep(3)}>← Back</Button>
        <Button
          variant="contained"
          onClick={handleFinish}
          disabled={!allCompleted}
        >
          Save & Start New
        </Button>
      </Box>
    </StepLayout>
  );
}