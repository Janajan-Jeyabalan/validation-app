import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Collapse,
  IconButton,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StepLayout from '../../components/StepLayout';
import {
  useValidationStore,
  type ValidationRecord,
} from '../../store/validationStore';
import { useState, useMemo, useEffect } from 'react';

const MONO = {
  fontFamily: "'JetBrains Mono', monospace",
} as const;

const CONDENSED = {
  fontFamily: "'Barlow Condensed', sans-serif",
} as const;

function getBuilding(uloc: string): string {
  const normalizedULOC = uloc.trim().toUpperCase();

  if (normalizedULOC.startsWith('2B')) return 'Building B';
  if (
    normalizedULOC.startsWith('2F') ||
    normalizedULOC.startsWith('2T')
  ) return 'Building C';
  if (normalizedULOC.startsWith('2C')) return 'Building D';

  return '';
}

function getOwner(uloc: string): string {
  const normalizedULOC = uloc.trim().toUpperCase();

  if (normalizedULOC.startsWith('2B')) return 'Body Shop';
  if (
    normalizedULOC.startsWith('2TTS') ||
    normalizedULOC.startsWith('2FTS') ||
    normalizedULOC.startsWith('2CTS')
  ) return 'TFT Sequence';
  if (
    normalizedULOC.startsWith('2CTR') ||
    normalizedULOC.startsWith('2TTR') ||
    normalizedULOC.startsWith('2FTR')
  ) return 'TFT Repack';
  if (
    normalizedULOC.startsWith('2TTA') ||
    normalizedULOC.startsWith('2CTA')
  ) return 'TFT Assembly';

  return '';
}

function RecordRow({
  record,
  onDelete,
}: {
  record: ValidationRecord;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isComplete = record.status === 'complete';
  const building = getBuilding(record.uloc);
  const owner = getOwner(record.uloc);

  const formatted = new Date(record.timestamp).toLocaleString(
    'en-CA',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }
  );

  return (
    <>
      {/* Main row */}
      <Box
        onClick={() => setOpen((previous) => !previous)}
        sx={{
          display: 'grid',
          gridTemplateColumns:
            '32px 145px 100px 110px 110px 150px 72px 116px 36px',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          transition: 'background .15s',
          '&:hover': {
            bgcolor: 'rgba(0,114,206,.04)',
          },
        }}
      >
        {/* Chevron */}
        <Box
          sx={{
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {open ? (
            <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
          ) : (
            <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
          )}
        </Box>

        {/* Timestamp */}
        <Typography
          sx={{
            ...MONO,
            fontSize: 11,
            color: 'text.secondary',
          }}
        >
          {formatted}
        </Typography>

        {/* PVI */}
        <Typography
          sx={{
            ...MONO,
            fontSize: 12,
            color: 'primary.main',
            fontWeight: 500,
          }}
        >
          {record.pvi}
        </Typography>

        {/* ULOC */}
        <Typography
          sx={{
            ...MONO,
            fontSize: 12,
            color: 'text.primary',
          }}
        >
          {record.uloc}
        </Typography>

        {/* Building */}
        <Typography sx={{ ...MONO, fontSize: 11, color: 'text.primary' }}>
          {building}
        </Typography>

        {/* Owner */}
        <Typography sx={{ ...MONO, fontSize: 11, color: 'text.primary' }}>
          {owner}
        </Typography>

        {/* Parts count */}
        <Typography
          sx={{
            ...MONO,
            fontSize: 12,
            color: 'text.secondary',
          }}
        >
          {record.validatedCount} / {record.totalParts}
        </Typography>

        {/* Status chip */}
        <Chip
          size="small"
          icon={
            isComplete ? (
              <CheckCircleOutlineIcon
                sx={{ fontSize: '13px !important' }}
              />
            ) : undefined
          }
          label={isComplete ? 'COMPLETE' : 'PARTIAL'}
          sx={{
            ...MONO,
            fontSize: 10,
            letterSpacing: '.04em',
            height: 22,
            bgcolor: isComplete
              ? 'rgba(0,200,150,.08)'
              : 'rgba(255,184,0,.08)',
            color: isComplete
              ? 'success.main'
              : '#FFB800',
            border: '1px solid',
            borderColor: isComplete
              ? 'rgba(0,200,150,.25)'
              : 'rgba(255,184,0,.25)',
            '& .MuiChip-icon': {
              color: 'success.main',
            },
          }}
        />

        {/* Delete */}
        <Tooltip
          title="Delete record"
          placement="left"
        >
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
              },
              borderRadius: 1,
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Expanded parts detail */}
      <Collapse in={open}>
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 2.5,
          }}
        >
          <Typography
            sx={{
              ...CONDENSED,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              mb: 1.5,
            }}
          >
            Part Details — {record.validatedCount} of{' '}
            {record.totalParts} validated
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(210px, 1fr))',
              gap: 1,
            }}
          >
            {record.parts.map((part, index) => (
              <Box
                key={index}
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: part.validated
                    ? 'rgba(0,200,150,.2)'
                    : 'rgba(255,184,0,.15)',
                  borderRadius: 1.5,
                  p: 1.5,
                }}
              >
                {/* Part number and status dot */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      ...MONO,
                      fontSize: 12,
                      color: 'primary.main',
                      fontWeight: 500,
                    }}
                  >
                    {part.part}
                  </Typography>

                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: part.validated
                        ? 'success.main'
                        : '#FFB800',
                      flexShrink: 0,
                    }}
                  />
                </Box>

                {/* Field rows */}
                {(
                  [
                    ['ITEM', part.item],
                    ['DESC', part.partDesc],
                    ['SUPPNM', part.suppnm],
                    ['DUNS', part.duns],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      display: 'flex',
                      gap: 1,
                      mb: 0.4,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10,
                        letterSpacing: '.08em',
                        color: 'text.secondary',
                        width: 46,
                        flexShrink: 0,
                        textTransform: 'uppercase',
                      }}
                    >
                      {label}
                    </Typography>

                    <Typography
                      sx={{
                        ...MONO,
                        fontSize: 10,
                        color: 'text.primary',
                      }}
                    >
                      {value || '—'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </>
  );
}

type FilterType = 'all' | 'complete' | 'partial';

export default function HistoryPage() {
  const {
    history,
    deleteRecord,
    clearHistory,
    reset,
    loadHistoryFromServer,
  } = useValidationStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] =
    useState<FilterType>('all');
  const [confirmClear, setConfirmClear] =
    useState(false);

    useEffect(() => {
  void loadHistoryFromServer(1);
}, [loadHistoryFromServer]);

  // Derived statistics
  const totalParts = history.reduce(
    (total, record) =>
      total + record.validatedCount,
    0
  );

  const uniquePVIs = new Set(
    history.map((record) => record.pvi)
  ).size;

  const partialCount = history.filter(
    (record) => record.status === 'partial'
  ).length;

  // Filtered and searched records
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return history.filter((record) => {
      const matchesFilter =
        filter === 'all' ||
        record.status === filter;

      const matchesSearch =
        !query ||
        record.pvi.toLowerCase().includes(query) ||
        record.uloc.toLowerCase().includes(query) ||
        record.parts.some(
          (part) =>
            part.part.toLowerCase().includes(query) ||
            part.suppnm.toLowerCase().includes(query)
        );

      return matchesFilter && matchesSearch;
    });
  }, [history, search, filter]);

  // CSV export
  const handleExportCSV = () => {
    const header = [
      'Timestamp',
      'PVI',
      'ULOC',
      'Building',
      'Owner',
      'Part #',
      'Item',
      'Description',
      'Supplier',
      'DUNS',
      'Validated',
      'Session Status',
    ];

    const rows = filtered.flatMap((record) =>
      record.parts.map((part) => [
        new Date(record.timestamp).toLocaleString(),
        record.pvi,
        record.uloc,
        getBuilding(record.uloc),
        getOwner(record.uloc),
        part.part,
        part.item,
        part.partDesc,
        part.suppnm,
        part.duns,
        part.validated ? 'YES' : 'NO',
        record.status.toUpperCase(),
      ])
    );

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell).replace(
              /"/g,
              '""'
            );

            return `"${value}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download =
      `gm-validation-export-${Date.now()}.csv`;

    anchor.click();
    URL.revokeObjectURL(url);
  };

  // Filter button style
  const filterSx = (active: boolean) => ({
    ...CONDENSED,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '.06em',
    textTransform: 'uppercase' as const,
    px: 2,
    py: 0.85,
    border: '1px solid',
    borderColor: active
      ? 'primary.main'
      : 'rgb(129, 171, 235)',
    bgcolor: active
      ? 'rgba(144, 196, 238, 0.08)'
      : 'background.paper',
    color: active
      ? 'primary.main'
      : 'text.secondary',
    borderRadius: 1.5,
    cursor: 'pointer',
    transition: 'all .15s',
    '&:hover': {
      borderColor: 'primary.main',
      color: 'primary.main',
    },
  });

  const columnHeaders = [
    '',
    'Timestamp',
    'PVI',
    'ULOC',
    'Building',
    'Owner',
    'Parts',
    'Status',
    '',
  ];

  return (
    <StepLayout>
      {/* Page tag */}
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
            fontSize: 11,
            letterSpacing: '.12em',
            color: 'text.secondary',
          }}
        >
          Audit Trail
        </Typography>
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 300,
          lineHeight: 1.15,
          mb: 0.5,
        }}
      >
        Validation Records
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Complete history of all validated parts.
            Stored locally across sessions.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={reset}
          sx={{
            ...CONDENSED,
            fontWeight: 600,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            fontSize: 12,
          }}
        >
          New Validation
        </Button>
      </Box>

      {/* Statistic cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1.25,
          mb: 3,
        }}
      >
        {(
          [
            {
              label: 'Total Sessions',
              value: history.length,
              color: 'primary.main',
            },
            {
              label: 'Parts Validated',
              value: totalParts,
              color: 'success.main',
            },
            {
              label: 'Unique PVIs',
              value: uniquePVIs,
              color: 'primary.main',
            },
            {
              label: 'Partial Sessions',
              value: partialCount,
              color: '#FFB800',
            },
          ] as const
        ).map(({ label, value, color }) => (
          <Box
            key={label}
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: 10,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                mb: 0.75,
              }}
            >
              {label}
            </Typography>

            <Typography
              sx={{
                ...MONO,
                fontSize: 24,
                fontWeight: 500,
                color,
              }}
            >
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.25,
          mb: 1.75,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search PVI, ULOC, part, supplier…"
          size="small"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    fontSize: 15,
                    color: 'text.secondary',
                  }}
                />
              </InputAdornment>
            ),
            sx: {
              ...MONO,
              fontSize: 12,
            },
          }}
          sx={{
            flex: 1,
            minWidth: 220,
          }}
        />

        {/* Filter buttons */}
        {(
          [
            'all',
            'complete',
            'partial',
          ] as FilterType[]
        ).map((filterName) => (
          <Box
            key={filterName}
            component="button"
            onClick={() =>
              setFilter(filterName)
            }
            sx={filterSx(
              filter === filterName
            )}
          >
            {filterName === 'all'
              ? 'All'
              : filterName
                  .charAt(0)
                  .toUpperCase() +
                filterName.slice(1)}
          </Box>
        ))}

        {/* Export CSV */}
        <Button
          variant="outlined"
          size="small"
          startIcon={
            <FileDownloadOutlinedIcon
              sx={{ fontSize: 15 }}
            />
          }
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          sx={{
            ...CONDENSED,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
          }}
        >
          Export CSV
        </Button>

        {/* Clear all */}
        <Tooltip
          title={
            confirmClear
              ? 'Click again to confirm'
              : 'Clear all records'
          }
          placement="top"
        >
          <IconButton
            size="small"
            disabled={history.length === 0}
            onClick={() => {
              if (confirmClear) {
                clearHistory();
                setConfirmClear(false);
              } else {
                setConfirmClear(true);

                setTimeout(() => {
                  setConfirmClear(false);
                }, 3000);
              }
            }}
            sx={{
              color: confirmClear
                ? 'error.main'
                : 'text.secondary',
              border: '1px solid',
              borderColor: confirmClear
                ? 'error.main'
                : 'divider',
              borderRadius: 1.5,
              p: 0.85,
              transition: 'all .2s',
              '&:hover': {
                color: 'error.main',
                borderColor: 'error.main',
              },
            }}
          >
            <DeleteOutlineIcon
              sx={{ fontSize: 15 }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Confirm clear warning */}
      {confirmClear && (
        <Alert
          severity="warning"
          sx={{
            mb: 1.5,
            borderRadius: 2,
            bgcolor:
              'rgba(240, 205, 116, 0.06)',
            border:
              '1px solid rgba(236, 205, 126, 0.25)',
            ...CONDENSED,
            fontSize: 13,
          }}
        >
          Click the delete button again to permanently
          clear all {history.length} records.
        </Alert>
      )}

      {/* Table */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Column headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns:
              '32px 145px 100px 110px 110px 150px 72px 116px 36px',
            gap: 1,
            px: 2,
            py: 1.25,
            bgcolor: '#799be8',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {columnHeaders.map(
            (header, index) => (
              <Typography
                key={index}
                sx={{
                  ...CONDENSED,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                }}
              >
                {header}
              </Typography>
            )
          )}
        </Box>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <Box
            sx={{
              py: 7,
              textAlign: 'center',
            }}
          >
            <HistoryOutlinedIcon
              sx={{
                fontSize: 38,
                color: 'text.secondary',
                opacity: 0.25,
                display: 'block',
                mx: 'auto',
                mb: 1.5,
              }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              {history.length === 0
                ? 'No validation sessions recorded yet.'
                : 'No records match your search or filter.'}
            </Typography>

            {history.length === 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ opacity: 0.6 }}
              >
                Complete a validation to see it appear
                here.
              </Typography>
            )}
          </Box>
        ) : (
          filtered.map((record) => (
            <RecordRow
              key={record.id}
              record={record}
              onDelete={() =>
                deleteRecord(record.id)
              }
            />
          ))
        )}
      </Box>

      {/* Footer count */}
      {filtered.length > 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 1.5,
            display: 'block',
            ...MONO,
            fontSize: 11,
          }}
        >
          {filtered.length === history.length
            ? `${history.length} session${
                history.length !== 1 ? 's' : ''
              } total`
            : `Showing ${filtered.length} of ${history.length} sessions`}
        </Typography>
      )}
    </StepLayout>
  );
}
