import React from 'react';
import { CssBaseline, Container } from '@mui/material';
import { useValidationStore } from './store/validationStore';

import Step1 from './pages/validation/Step1DataSource';
import Step2 from './pages/validation/Step2PVI';
import Step3 from './pages/validation/Step3ULOC';
import Step4Validation from './pages/validation/Step4Validation';
import HistoryPage from './pages/validation/HistoryPage';

function App() {
  const { step } = useValidationStore();

  const renderStep = () => {
  switch (step) {
    case 1:
      return <Step1 />;
    case 2:
      return <Step2 />;
    case 3:
      return <Step3 />;
    case 4:
      return <Step4Validation />;
    case 5:
      return <HistoryPage />;
    default:
      return <Step1 />;
  }
};

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 5 }}>
        {renderStep()}
      </Container>
    </>
  );
}

export default App;
