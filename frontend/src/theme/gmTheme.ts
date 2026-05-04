import { createTheme } from '@mui/material/styles';

export const gmTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#83c2f6' },
    success: { main: '#00C896' },
    background: { default: '#0A0F1A', paper: '#111827' },
    text: { primary: '#E8EDF5', secondary: '#7A8BA3' },
    divider: '#679cf0',
  },
  typography: {
    fontFamily: "'Barlow', sans-serif",
    h4: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.03em' },
    h5: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 },
    overline: { fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.12em' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A2235',
          '& fieldset': { borderColor: '#84b2f8' },
          '&:hover fieldset': { borderColor: '#83c2f6' },
          '&.Mui-focused fieldset': { borderColor: '#83c2f6', boxShadow: '0 0 0 3px rgba(0,114,206,.15)' },
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { backgroundColor: '#1A2235' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          borderRadius: 6,
        },
        contained: {
          background: '#83c2f6',
          '&:hover': { background: '#0080E8' },
          '&:disabled': { background: '#78a7f4', color: '#4A5A70' },
        },
        outlined: {
          borderColor: '#2A3D5A',
          color: '#7A8BA3',
          '&:hover': { borderColor: '#7A8BA3', color: '#E8EDF5', background: 'transparent' },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontSize: 13 },
      },
    },
  },
});