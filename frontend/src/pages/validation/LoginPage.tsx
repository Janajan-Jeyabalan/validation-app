import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import { useValidationStore } from '../../store/validationStore';
import { useValidationStore as useValidationStoreGet } from '../../store/validationStore';
import { useAuthStore as useAuthStoreGet } from '../../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();

  const loginServer = useAuthStore((state) => state.loginServer);

  const [mode, setMode] = useState<
    'login' | 'register'
  >('login');

  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    try {
      const result = await loginServer(username, username);

      if (!result || !result.success) {
        setError(result?.message || 'Authentication failed');
        return;
      }

      // show sync results if present
      if (result.sync) {
        if (result.sync.errors && result.sync.errors.length) {
          setSnackbarMsg(`Synced ${result.sync.synced} items; ${result.sync.errors.length} errors`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        } else {
          setSnackbarMsg(`Synced ${result.sync.synced} items`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        }
      }

      if (mode === 'login') {
        navigate('/');
      } else {
        setMessage('Account created successfully');
        setMode('login');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Authentication error');
    }
  };

  const syncing = useValidationStore((s) => s.syncing);
    const getServerUserId = useAuthStore((s) => s.getServerUserId);
    const syncLocalHistoryToServer = useValidationStore((s) => s.syncLocalHistoryToServer);

    const handleRetry = async () => {
      const userId = getServerUserId();
      if (!userId) {
        setSnackbarMsg('No server user available to sync');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      try {
        const res = await syncLocalHistoryToServer(userId);
        if (res.errors && res.errors.length) {
          setSnackbarMsg(`Retry: synced ${res.synced}; ${res.errors.length} errors`);
          setSnackbarSeverity('error');
        } else {
          setSnackbarMsg(`Retry: synced ${res.synced} items`);
          setSnackbarSeverity('success');
        }
        setSnackbarOpen(true);
      } catch (err: any) {
        console.error('retry sync failed', err);
        setSnackbarMsg('Retry sync failed');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f4f7fb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: 420,
          p: 5,
          borderRadius: 4,
          bgcolor: '#ffffff',
          border:
            '1px solid rgba(0,0,0,0.08)',
          boxShadow:
            '0 10px 40px rgba(0,0,0,0.06)',
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: '#2563eb',
            letterSpacing: '.12em',
          }}
        >
          VALIDATION SYSTEM
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: '#1e293b',
            fontWeight: 300,
            mb: 1,
          }}
        >
          {mode === 'login'
            ? 'Sign In'
            : 'Create Account'}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            mb: 4,
          }}
        >
          {mode === 'login'
            ? 'Enter your credentials to continue.'
            : 'Create a temporary account.'}
        </Typography>

        {syncing && <LinearProgress sx={{ mb: 2 }} />}

        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          margin="normal"
        />

        <TextField
          fullWidth
          type="password"
          label="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          margin="normal"
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
          >
            {error}
          </Alert>
        )}

        {message && (
          <Alert
            severity="success"
            sx={{ mt: 2 }}
          >
            {message}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={syncing}
          sx={{
            mt: 3,
            py: 1.2,
            bgcolor: '#2563eb',
            '&:hover': {
              bgcolor: '#1d4ed8',
            },
          }}
        >
          {mode === 'login'
            ? 'Sign In'
            : 'Create Account'}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={() => {
            setMode(
              mode === 'login'
                ? 'register'
                : 'login'
            );

            setError('');
            setMessage('');
          }}
          sx={{ mt: 2 }}
        >
          {mode === 'login'
            ? 'Create a new account'
            : 'Back to Sign In'}
        </Button>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry} disabled={syncing}>
              Retry
            </Button>
          }
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}