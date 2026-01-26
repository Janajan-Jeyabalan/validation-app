import { MenuItem, Select, Typography } from '@mui/material';
import StepLayout from '../../components/StepLayout';
import StepNavigation from '../../components/StepNavigation';
import { useValidationStore } from '../../store/validationStore';

const pviList = ['028539', '028540'];

export default function Step2PVI() {
  const { pvi, setPVI, setStep, reset } = useValidationStore();

  return (
    <StepLayout>
      <Typography variant="h4">Validation Process</Typography>

      <Typography sx={{ mt: 3 }}>PVI Number</Typography>

      <Select fullWidth value={pvi} onChange={(e) => setPVI(e.target.value)}>
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
