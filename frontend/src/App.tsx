import React from 'react';
import {
  CssBaseline,
  Container,
} from '@mui/material';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { useValidationStore } from './store/validationStore';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/validation/LoginPage';
import Step1 from './pages/validation/Step1DataSource';
import Step2 from './pages/validation/Step2PVI';
import Step3 from './pages/validation/Step3ULOC';
import Step4Validation from './pages/validation/Step4Validation';
import HistoryPage from './pages/validation/HistoryPage';

/* -------------------------------------------------- */
/* PROTECTED VALIDATION FLOW                          */
/* -------------------------------------------------- */

function ValidationFlow() {
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
    <Container maxWidth="md" sx={{ py: 5 }}>
      {renderStep()}
    </Container>
  );
}

/* -------------------------------------------------- */
/* PROTECTED ROUTE                                    */
/* -------------------------------------------------- */

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/* -------------------------------------------------- */
/* APP                                                 */
/* -------------------------------------------------- */

function App() {
  return (
    <>
      <CssBaseline />

      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route
            path="/login"
            element={<LoginPage />}
          />

          {/* Protected App */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ValidationFlow />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;