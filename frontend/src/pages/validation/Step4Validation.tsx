import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StepLayout from '../../components/StepLayout';
import { useValidationStore } from '../../store/validationStore';
import { useState } from 'react';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  'http://localhost:4000';

interface ScanState {
  scannedValue: string;
  completed: boolean;
  error: string;
}

export default function Step4Validation() {
  const {
    pvi,
    uloc,
    selectedParts,
    setStep,
    reset,
    saveValidationRecord,
  } = useValidationStore();

  const [scanStates, setScanStates] =
    useState<ScanState[]>(
      selectedParts.map(() => ({
        scannedValue: '',
        completed: false,
        error: '',
      }))
    );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleScan = (
    index: number,
    scannedValue: string
  ) => {
    const expectedPart =
      selectedParts[index].part;

    setScanStates((previous) =>
      previous.map((state, currentIndex) => {
        if (
          currentIndex !== index ||
          state.completed
        ) {
          return state;
        }

        if (scannedValue === expectedPart) {
          return {
            scannedValue,
            completed: true,
            error: '',
          };
        }

        return {
          scannedValue,
          completed: false,
          error:
            'Scanned part does not match expected PART number',
        };
      })
    );
  };

  const createNewValidation =
    async (): Promise<string> => {
      const response = await fetch(
        `${API_BASE_URL}/api/validations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // User 1 is temporary until login
            // is connected to the frontend.
            user_id: 1,
            status: 'draft',
            metadata: {
              type: 'Excel BOM validation',
              pvi,
              uloc,
            },
            steps: [],
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Could not create a new validation.'
        );
      }

      if (!result.id) {
        throw new Error(
          'The server did not return a validation ID.'
        );
      }

      return String(result.id);
    };

  const handleFinish = async () => {
    if (saving) {
      return;
    }

    setSaving(true);
    setSaveError('');

    const completedCount =
      scanStates.filter(
        (state) => state.completed
      ).length;

    const parts = selectedParts.map(
      (part, index) => ({
        part: part.part,
        item: part.item,
        partDesc: part.partDesc,
        suppnm: part.suppnm,
        duns: part.duns,
        validated:
          scanStates[index].completed,
        scannedValue:
          scanStates[index].scannedValue,
      })
    );

    try {
      // The first validation ID is created when
      // the Excel file is uploaded.
      let validationId =
        localStorage.getItem(
          'active-validation-id'
        );

      // After the first validation, create a new
      // database record without uploading Excel again.
      if (!validationId) {
        validationId =
          await createNewValidation();
      }

      const response = await fetch(
        `${API_BASE_URL}/api/validations/${validationId}/complete`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pvi,
            uloc,
            parts,
            validated_count: completedCount,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'The validation could not be saved.'
        );
      }

      // Keep the existing local history display.
      saveValidationRecord(
  parts.map((part) => ({
    part: part.part,
    item: part.item,
    partDesc: part.partDesc,
    suppnm: part.suppnm,
    duns: part.duns,
    validated: part.validated,
  })),
  completedCount,
  validationId
);

      // The completed ID must not be reused.
      // The next validation will create a new record
      // while keeping the Excel workbook loaded.
      localStorage.removeItem(
        'active-validation-id'
      );

      reset();
    } catch (error) {
      console.error(error);

      setSaveError(
        error instanceof Error
          ? error.message
          : 'The validation could not be saved.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (selectedParts.length === 0) {
    return (
      <StepLayout>
        <Alert severity="warning">
          No part data found.
        </Alert>
      </StepLayout>
    );
  }

  const completedCount =
    scanStates.filter(
      (state) => state.completed
    ).length;

  const allCompleted =
    completedCount === selectedParts.length;

  const progressPercentage = Math.round(
    (completedCount /
      selectedParts.length) *
      100
  );

  return (
    <StepLayout>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: 'primary.main',
          }}
        />

        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontSize: 11,
          }}
        >
          Step 4 of 4
        </Typography>
      </Box>

      <Typography
        variant="h4"
        sx={{ mb: 0.5 }}
      >
        Validation Process
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2.5 }}
      >
        Scan each part number with your Bluetooth
        scanner or type it manually.
      </Typography>

      {/* Context strip */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {[
          ['PVI', pvi],
          ['ULOC', uloc],
        ].map(([label, value]) => (
          <Box
            key={label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily:
                  "'JetBrains Mono', monospace",
                fontSize: 10,
                color: 'text.secondary',
                letterSpacing: '.06em',
              }}
            >
              {label}:
            </Typography>

            <Typography
              sx={{
                fontFamily:
                  "'JetBrains Mono', monospace",
                fontSize: 12,
                color: 'primary.main',
                fontWeight: 500,
              }}
            >
              {value}
            </Typography>
          </Box>
        ))}

        <Box
          sx={{
            ml: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily:
                "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'text.secondary',
            }}
          >
            {completedCount}/
            {selectedParts.length}
          </Typography>

          <Box
            sx={{
              width: 60,
              height: 4,
              borderRadius: 2,
              bgcolor: 'divider',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                borderRadius: 2,
                bgcolor: allCompleted
                  ? 'success.main'
                  : 'primary.main',
                width: `${progressPercentage}%`,
                transition: 'width .3s ease',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Parts */}
      {selectedParts.map(
        (part, index) => {
          const scan = scanStates[index];

          return (
            <Box
              key={index}
              sx={{
                p: 2.5,
                mb: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: scan.completed
                  ? 'success.main'
                  : scan.error
                    ? 'error.main'
                    : 'divider',
                bgcolor: scan.completed
                  ? 'rgba(0,200,150,.04)'
                  : 'background.paper',
                transition: 'all .2s ease',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'space-between',
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily:
                      "'Barlow Condensed', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '.08em',
                    color: 'text.secondary',
                    textTransform:
                      'uppercase',
                  }}
                >
                  Part {index + 1}
                </Typography>

                <Chip
                  size="small"
                  label={
                    scan.completed
                      ? 'VALIDATED'
                      : 'PENDING'
                  }
                  icon={
                    scan.completed ? (
                      <CheckCircleOutlineIcon
                        sx={{
                          fontSize:
                            '14px !important',
                        }}
                      />
                    ) : undefined
                  }
                  sx={{
                    fontFamily:
                      "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '.04em',
                    height: 22,
                    bgcolor: scan.completed
                      ? 'rgba(0,200,150,.1)'
                      : 'rgba(122,139,163,.1)',
                    color: scan.completed
                      ? 'success.main'
                      : 'text.secondary',
                    border: '1px solid',
                    borderColor:
                      scan.completed
                        ? 'rgba(0,200,150,.3)'
                        : 'divider',
                    '& .MuiChip-icon': {
                      color: 'success.main',
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(2, 1fr)',
                  gap: 1.5,
                  mb: 2,
                }}
              >
                {[
                  ['ITEM', part.item],
                  ['PART', part.part],
                  ['DESC', part.partDesc],
                  ['SUPPNM', part.suppnm],
                  ['DUNS', part.duns],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <Typography
                      sx={{
                        fontSize: 10,
                        letterSpacing: '.1em',
                        color:
                          'text.secondary',
                        textTransform:
                          'uppercase',
                        mb: 0.25,
                      }}
                    >
                      {label}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily:
                          "'JetBrains Mono', monospace",
                        fontSize: 12,
                        color: 'text.primary',
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <TextField
                fullWidth
                size="small"
                disabled={scan.completed}
                placeholder={
                  scan.completed
                    ? ''
                    : 'Scan or type part number…'
                }
                value={scan.scannedValue}
                error={Boolean(scan.error)}
                helperText={
                  scan.completed
                    ? '✔ Part validated successfully'
                    : scan.error ||
                      'Waiting for scanner input'
                }
                FormHelperTextProps={{
                  sx: {
                    fontFamily:
                      "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: scan.completed
                      ? 'success.main'
                      : scan.error
                        ? 'error.main'
                        : 'text.secondary',
                  },
                }}
                onChange={(event) => {
                  const value =
                    event.target.value.trim();

                  setScanStates(
                    (previous) =>
                      previous.map(
                        (
                          state,
                          currentIndex
                        ) =>
                          currentIndex ===
                          index
                            ? {
                                ...state,
                                scannedValue:
                                  value,
                                error: '',
                              }
                            : state
                      )
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();

                    handleScan(
                      index,
                      scan.scannedValue.trim()
                    );
                  }
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily:
                      "'JetBrains Mono', monospace",
                    fontSize: 13,
                    letterSpacing: '.04em',
                  },
                  '& .MuiInputBase-input.Mui-disabled':
                    {
                      WebkitTextFillColor:
                        'rgba(0,200,150,.6)',
                    },
                }}
              />
            </Box>
          );
        }
      )}

      {allCompleted && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            borderRadius: 2,
            border:
              '1px solid rgba(0,200,150,.3)',
            bgcolor:
              'rgba(0,200,150,.06)',
            fontFamily:
              "'Barlow', sans-serif",
            '& .MuiAlert-message': {
              fontWeight: 500,
            },
          }}
        >
          All {selectedParts.length} parts for ULOC{' '}
          {uloc} have been successfully validated.
        </Alert>
      )}

      {saveError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
        >
          {saveError}
        </Alert>
      )}

      <Divider
        sx={{
          my: 3,
          borderColor: 'divider',
        }}
      />

      <Box
        sx={{
          display: 'flex',
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => setStep(3)}
          disabled={saving}
        >
          ← Back
        </Button>

        <Button
          variant="contained"
          onClick={handleFinish}
          disabled={!allCompleted || saving}
        >
          {saving
            ? 'Saving…'
            : 'Save & Start New'}
        </Button>
      </Box>
    </StepLayout>
  );
}