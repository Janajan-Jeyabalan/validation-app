import { Button, Box } from '@mui/material';

interface Props {
  onNext?: () => void;
  onBack?: () => void;
  onReset?: () => void;
  disableNext?: boolean;
}

export default function StepNavigation({
  onNext,
  onBack,
  onReset,
  disableNext,
}: Props) {
  return (
    <Box sx={{ mt: 4 }}>
      {onBack && <Button onClick={onBack}>Back</Button>}
      {onReset && <Button onClick={onReset}>Start Over</Button>}
      {onNext && (
        <Button
          variant="contained"
          sx={{ ml: 2 }}
          onClick={onNext}
          disabled={disableNext}
        >
          Next
        </Button>
      )}
    </Box>
  );
}
