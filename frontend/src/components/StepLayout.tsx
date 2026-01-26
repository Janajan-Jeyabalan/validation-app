import { Card } from '@mui/material';

export default function StepLayout({ children }: { children: React.ReactNode }) {
  return (
    <Card sx={{ p: 4, maxWidth: 900, margin: 'auto', marginTop: 8 }}>
      {children}
    </Card>
  );
}
