import { MenuItem, Select, Typography } from '@mui/material';
import StepLayout from '../../components/StepLayout';
import StepNavigation from '../../components/StepNavigation';
import { useValidationStore } from '../../store/validationStore';

const ulocList = ['ULOC-01', 'ULOC-02'];

export default function Step3ULOC() {
  const { pvi, uloc, setULOC, setStep } = useValidationStore();

  return (
    <StepLayout>
      <Typography variant="h4">Validation Process</Typography>
      <Typography sx={{ mt: 2 }}>Selected PVI: {pvi}</Typography>

      <Typography sx={{ mt: 3 }}>ULOC</Typography>

      <Select fullWidth value={uloc} onChange={(e) => setULOC(e.target.value)}>
        {ulocList.map((u) => (
          <MenuItem key={u} value={u}>
            {u}
          </MenuItem>
        ))}
      </Select>

      <StepNavigation
        onBack={() => setStep(2)}
        disableNext={!uloc}
      />
    </StepLayout>
  );
}
