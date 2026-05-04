import { MenuItem, Select, Typography, Alert, Box } from '@mui/material';
import StepLayout from '../../components/StepLayout';
import StepNavigation from '../../components/StepNavigation';
import { useValidationStore } from '../../store/validationStore';

export default function Step2PVI() {
  const { pvi, setPVI, setStep, pviList } = useValidationStore();

  if (!pviList || pviList.length === 0) {
    return (
      <StepLayout>
        <Box sx={{ mb: 1 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 11 }}>
            Step 2 of 4
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ mb: 3 }}>Select PVI</Typography>
        <Alert severity="warning">No PVI data found. Please upload an Excel file first.</Alert>
      </StepLayout>
    );
  }

  return (
    <StepLayout>
      {/* Step label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 11 }}>
          Step 2 of 4
        </Typography>
      </Box>

      <Typography variant="h4" sx={{ mb: 0.5 }}>Select PVI Number</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the Production Vehicle Identification number for this validation run.
      </Typography>

      {/* Field */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="overline"
          sx={{ display: 'block', fontSize: 10, letterSpacing: '.12em', color: 'text.secondary', mb: 0.75 }}
        >
          PVI Number
        </Typography>
        <Select
          fullWidth
          value={pvi}
          onChange={(e) => setPVI(e.target.value)}
          displayEmpty
          sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
        >
          <MenuItem value="" disabled>
            <Typography variant="body2" color="text.secondary">Select a PVI…</Typography>
          </MenuItem>
          {pviList.map((p) => (
            <MenuItem key={p} value={p} sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
              {p}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Selected preview */}
      {pvi && (
        <Box sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'primary.main',
          bgcolor: 'rgba(0,114,206,.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
          <Box>
            <Typography variant="overline" sx={{ fontSize: 10, color: 'text.secondary', display: 'block' }}>
              Selected PVI
            </Typography>
            <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: 'primary.main', fontWeight: 500 }}>
              {pvi}
            </Typography>
          </Box>
        </Box>
      )}

      <StepNavigation
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
        disableNext={!pvi}
      />
    </StepLayout>
  );
}