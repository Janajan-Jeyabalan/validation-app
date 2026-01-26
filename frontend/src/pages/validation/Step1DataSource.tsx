import { Button, Grid, Typography } from '@mui/material';
import StepLayout from '../../components/StepLayout';
import { useValidationStore } from '../../store/validationStore';

export default function Step1DataSource() {
  const setStep = useValidationStore((s) => s.setStep);

  return (
    <StepLayout>
      <Typography variant="h4" gutterBottom>
        Validation Process
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Button fullWidth variant="outlined" onClick={() => setStep(2)}>
            Use Existing Data
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button fullWidth variant="outlined">
            Upload New File
          </Button>
        </Grid>
      </Grid>
    </StepLayout>
  );
}
