import { Box, Typography, Alert, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import StepLayout from '../../components/StepLayout';
import StepNavigation from '../../components/StepNavigation';
import { useValidationStore } from '../../store/validationStore';

export default function Step3ULOC() {
  const { uloc, setULOC, setStep, ulocList, rows, pvi, setSelectedParts } = useValidationStore();

  if (ulocList.length === 0 || rows.length === 0) {
    return (
      <StepLayout>
        <Alert severity="warning">No ULOC data found. Please upload an Excel file first.</Alert>
      </StepLayout>
    );
  }

  const handleNext = () => {
    const matchedRows = rows.filter((row) => row.uloc === uloc);
    if (matchedRows.length === 0) return;
    setSelectedParts(matchedRows);
    setStep(4);
  };

  const matchCount = rows.filter((r) => r.uloc === uloc).length;

  return (
    <StepLayout>
      {/* Step label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 11 }}>
          Step 3 of 4
        </Typography>
      </Box>

      <Typography variant="h4" sx={{ mb: 0.5 }}>Select ULOC</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the Unit Location code to validate parts against.
      </Typography>

      {/* Context pill */}
      {pvi && (
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 0.5, mb: 2.5,
          borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
          bgcolor: 'background.paper',
        }}>
          <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'text.secondary' }}>
            PVI:
          </Typography>
          <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'primary.main' }}>
            {pvi}
          </Typography>
        </Box>
      )}

      {/* Autocomplete */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="overline"
          sx={{ display: 'block', fontSize: 10, letterSpacing: '.12em', color: 'text.secondary', mb: 0.75 }}
        >
          ULOC Code
        </Typography>
        <Autocomplete
          options={ulocList}
          value={uloc}
          freeSolo
          onChange={(_, v) => setULOC(v || '')}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search or type ULOC…"
              InputProps={{
                ...params.InputProps,
                sx: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13 },
              }}
            />
          )}
          slotProps={{
            paper: {
              sx: {
                bgcolor: '#688ce1',
                border: '1px solid #7ba7ea',
                borderRadius: 2,
                mt: 0.5,
                '& .MuiAutocomplete-option': {
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                },
              },
            },
          }}
        />
      </Box>

      {/* Match preview */}
      {uloc && (
        <Box sx={{
          p: 2, mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: matchCount > 0 ? 'success.main' : 'error.main',
          bgcolor: matchCount > 0 ? 'rgba(126, 247, 217, 0.05)' : 'rgba(245, 125, 125, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: matchCount > 0 ? 'rgba(124, 213, 191, 0.12)' : 'rgba(238, 142, 142, 0.12)',
          }}>
            <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600,
              color: matchCount > 0 ? 'success.main' : 'error.main' }}>
              {matchCount}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {matchCount > 0 ? `${matchCount} part${matchCount !== 1 ? 's' : ''} found` : 'No parts found'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {matchCount > 0
                ? `Ready to validate ULOC ${uloc}`
                : 'Try a different ULOC code'}
            </Typography>
          </Box>
        </Box>
      )}

      <StepNavigation
        onBack={() => setStep(2)}
        onNext={handleNext}
        disableNext={!uloc || matchCount === 0}
      />
    </StepLayout>
  );
}