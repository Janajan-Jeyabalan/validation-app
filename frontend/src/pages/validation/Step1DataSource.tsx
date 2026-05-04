import { Box, Typography, Alert, Button } from '@mui/material';
import { useRef, useState, useCallback } from 'react';
import StepLayout from '../../components/StepLayout';
import { useValidationStore } from '../../store/validationStore';
import { readExcelFile } from '../../utils/excelReader';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function Step1DataSource() {
  const { setStep, setPVIList, setULOCList, setRows, history } = useValidationStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setLoading(true);
    setError('');
    setUploadedFile(null);
    try {
      const data = await readExcelFile(file);
      if (!data || data.pviList.length === 0) {
        setError('No PVI numbers found in this file. Please check the workbook and try again.');
        return;
      }
      setPVIList(data.pviList);
      setULOCList(data.ulocList);
      setRows(data.rows);
      setUploadedFile(file.name);
      setTimeout(() => setStep(2), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read Excel file.');
    } finally {
      setLoading(false);
    }
  }, [setPVIList, setULOCList, setRows, setStep]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const success = !!uploadedFile && !loading;

  return (
    <StepLayout>
      {/* Step tag */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
        <Typography
          variant="overline"
          sx={{ fontSize: 11, letterSpacing: '.12em', color: 'text.secondary' }}
        >
          Step 1 of 4
        </Typography>
      </Box>

      {/* Heading */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 300, lineHeight: 1.15, mb: 0.5 }}
          >
            Upload your<br />data source
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select an Excel workbook containing PVI numbers and ULOC data.
          </Typography>
        </Box>
        {history.length > 0 && (
          <Button
            variant="outlined"
            onClick={() => setStep(5)}
            sx={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
            }}
          >
            View History
          </Button>
        )}
      </Box>

      {/* Drop zone */}
      <Box
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !loading && !success && fileInputRef.current?.click()}
        sx={{
          border: '1.5px dashed',
          borderColor: success
            ? 'success.main'
            : dragging
            ? 'primary.main'
            : 'rgb(125, 172, 243)',
          borderRadius: 2.5,
          p: 5,
          textAlign: 'center',
          cursor: loading || success ? 'default' : 'pointer',
          transition: 'border-color .2s, background .2s',
          bgcolor: success
            ? 'rgba(147, 241, 218, 0.04)'
            : dragging
            ? 'rgba(133, 193, 241, 0.05)'
            : 'background.paper',
          '&:hover': !success && !loading
            ? { borderColor: 'primary.main', bgcolor: 'rgba(0,114,206,.04)' }
            : {},
        }}
      >
        {/* Icon box */}
        <Box
          sx={{
            width: 48, height: 48,
            border: '1px solid',
            borderColor: success ? 'success.main' : 'rgba(42,61,90,1)',
            borderRadius: 2.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 1.75,
            bgcolor: '#7695dd',
            transition: 'border-color .2s',
          }}
        >
          {success
            ? <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 22 }} />
            : <CloudUploadOutlinedIcon sx={{ color: 'text.secondary', fontSize: 22 }} />}
        </Box>

        {/* Labels */}
        <Typography
          sx={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15, fontWeight: 600, letterSpacing: '.04em',
            color: success ? 'success.main' : 'text.primary',
            mb: 0.5,
          }}
        >
          {loading ? 'Reading file…' : success ? uploadedFile : 'Drop your file here'}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 12, color: 'text.secondary' }}>
          {loading
            ? 'Parsing PVI and ULOC data…'
            : success
            ? 'File loaded — moving to next step…'
            : 'or click to browse your filesystem'}
        </Typography>

        {/* Browse button */}
        {!success && (
          <Box
            component="button"
            disabled={loading}
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            sx={{
              mt: 1.75,
              px: 2.5, py: 0.9,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13, fontWeight: 600, letterSpacing: '.08em',
              textTransform: 'uppercase',
              border: '1px solid',
              borderColor: loading ? 'primary.main' : 'rgba(42,61,90,1)',
              borderRadius: 1.5,
              bgcolor: 'transparent',
              color: loading ? 'primary.main' : 'text.secondary',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'all .15s',
              '&:hover': { borderColor: 'primary.main', color: 'text.primary' },
              '&:disabled': { opacity: 0.6, cursor: 'wait' },
            }}
          >
            {loading ? 'Reading…' : 'Select Excel File'}
          </Box>
        )}

        {/* Meta chips */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
          {['Accepts .xlsx, .xls', 'Max 50 MB'].map((label) => (
            <Box
              key={label}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                px: 1.5, py: 0.6,
                borderRadius: 1.25,
                border: '1px solid',
                borderColor: 'rgb(128, 170, 237)',
                bgcolor: '#7998de',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, color: 'text.secondary',
              }}
            >
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }} />
              {label}
            </Box>
          ))}
        </Box>

        {/* Hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </Box>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mt: 2, borderRadius: 2,
            bgcolor: 'rgba(245, 176, 176, 0.07)',
            border: '1px solid rgba(255,77,77,.25)',
            color: '#FF4D4D',
            fontFamily: "'Barlow', sans-serif",
            fontSize: 13,
            '& .MuiAlert-icon': { color: '#FF4D4D' },
          }}
        >
          {error}
        </Alert>
      )}
    </StepLayout>
  );
}