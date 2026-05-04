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
import { useValidationStore, type ValidationRecord } from '../../store/validationStore';
import { useState, useMemo } from 'react';

// ── Shared style tokens ────────────────────────────────────────────────────────

const MONO = { fontFamily: "'JetBrains Mono', monospace" } as const;
const CONDENSED = { fontFamily: "'Barlow Condensed', sans-serif" } as const;

// ── RecordRow component ────────────────────────────────────────────────────────

function RecordRow({
  record,
  onDelete,
}: {
  record: ValidationRecord;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isComplete = record.status === 'complete';

  const formatted = new Date(record.timestamp).toLocaleString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <>
      {/* Main row */}
      <Box
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          display: 'grid',
          gridTemplateColumns: '32px 160px 1fr 1fr 72px 116px 36px',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          transition: 'background .15s',
          '&:hover': { bgcolor: 'rgba(0,114,206,.04)' },
        }}
      >
        {/* Chevron */}
        <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
          {open
            ? <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
            : <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
        </Box>

        {/* Timestamp */}
        <Typography sx={{ ...MONO, fontSize: 11, color: 'text.secondary' }}>
          {formatted}
        </Typography>

        {/* PVI */}
        <Typography sx={{ ...MONO, fontSize: 12, color: 'primary.main', fontWeight: 500 }}>
          {record.pvi}
        </Typography>

        {/* ULOC */}
        <Typography sx={{ ...MONO, fontSize: 12, color: 'text.primary' }}>
          {record.uloc}
        </Typography>

        {/* Parts count */}
        <Typography sx={{ ...MONO, fontSize: 12, color: 'text.secondary' }}>
          {record.validatedCount} / {record.totalParts}
        </Typography>

        {/* Status chip */}
        <Chip
          size="small"
          icon={
            isComplete
              ? <CheckCircleOutlineIcon sx={{ fontSize: '13px !important' }} />
              : undefined
          }
          label={isComplete ? 'COMPLETE' : 'PARTIAL'}
          sx={{
            ...MONO,
            fontSize: 10,
            letterSpacing: '.04em',
            height: 22,
            bgcolor: isComplete ? 'rgba(0,200,150,.08)' : 'rgba(255,184,0,.08)',
            color: isComplete ? 'success.main' : '#FFB800',
            border: '1px solid',
            borderColor: isComplete ? 'rgba(0,200,150,.25)' : 'rgba(255,184,0,.25)',
            '& .MuiChip-icon': { color: 'success.main' },
          }}
        />

        {/* Delete */}
        <Tooltip title="Delete record" placement="left">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'error.main' },
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
            bgcolor: '#0D1523',
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
            Part Details — {record.validatedCount} of {record.totalParts} validated
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: 1,
            }}
          >
            {record.parts.map((p, i) => (
              <Box
                key={i}
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: p.validated ? 'rgba(0,200,150,.2)' : 'rgba(255,184,0,.15)',
                  borderRadius: 1.5,
                  p: 1.5,
                }}
              >
                {/* Part number + status dot */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ ...MONO, fontSize: 12, color: 'primary.main', fontWeight: 500 }}>
                    {p.part}
                  </Typography>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: p.validated ? 'success.main' : '#FFB800',
                      flexShrink: 0,
                    }}
                  />
                </Box>

                {/* Field rows */}
                {([
                  ['ITEM', p.item],
                  ['DESC', p.partDesc],
                  ['SUPPNM', p.suppnm],
                  ['DUNS', p.duns],
                ] as [string, string][]).map(([label, val]) => (
                  <Box key={label} sx={{ display: 'flex', gap: 1, mb: 0.4 }}>
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
                    <Typography sx={{ ...MONO, fontSize: 10, color: 'text.primary' }}>
                      {val || '—'}
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

// ── HistoryPage ────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'complete' | 'partial';

export default function HistoryPage() {
  const { history, deleteRecord, clearHistory, setStep } = useValidationStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  // Derived stats
  const totalParts = history.reduce((acc, r) => acc + r.validatedCount, 0);
  const uniquePVIs = new Set(history.map((r) => r.pvi)).size;
  const partialCount = history.filter((r) => r.status === 'partial').length;

  // Filtered + searched records
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return history.filter((r) => {
      const matchesFilter =
        filter === 'all' ||
        r.status === filter;

      const matchesSearch =
        !q ||
        r.pvi.toLowerCase().includes(q) ||
        r.uloc.toLowerCase().includes(q) ||
        r.parts.some((p) => p.part.toLowerCase().includes(q) || p.suppnm.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [history, search, filter]);

  // CSV export
  const handleExportCSV = () => {
    const header = ['Timestamp', 'PVI', 'ULOC', 'Part #', 'Item', 'Description', 'Supplier', 'DUNS', 'Validated', 'Session Status'];
    const rows = filtered.flatMap((r) =>
      r.parts.map((p) => [
        new Date(r.timestamp).toLocaleString(),
        r.pvi,
        r.uloc,
        p.part,
        p.item,
        p.partDesc,
        p.suppnm,
        p.duns,
        p.validated ? 'YES' : 'NO',
        r.status.toUpperCase(),
      ])
    );

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gm-validation-export-${Date.now()}.csv`;
    a.click();
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
    borderColor: active ? 'primary.main' : 'rgba(42,61,90,1)',
    bgcolor: active ? 'rgba(0,114,206,.08)' : 'background.paper',
    color: active ? 'primary.main' : 'text.secondary',
    borderRadius: 1.5,
    cursor: 'pointer',
    transition: 'all .15s',
    '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
  });

  // Column header labels
  const COL_HEADERS = ['', 'Timestamp', 'PVI', 'ULOC', 'Parts', 'Status', ''];

  return (
    <StepLayout>
      {/* Page tag */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
        <Typography variant="overline" sx={{ fontSize: 11, letterSpacing: '.12em', color: 'text.secondary' }}>
          Audit Trail
        </Typography>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 300, lineHeight: 1.15, mb: 0.5 }}>
        Validation Records
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Complete history of all validated parts. Stored locally across sessions.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setStep(1)}
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

      {/* Stat cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.25, mb: 3 }}>
        {([
          { label: 'Total Sessions', value: history.length, color: 'primary.main' },
          { label: 'Parts Validated', value: totalParts, color: 'success.main' },
          { label: 'Unique PVIs', value: uniquePVIs, color: 'primary.main' },
          { label: 'Partial Sessions', value: partialCount, color: '#FFB800' },
        ] as const).map(({ label, value, color }) => (
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
            <Typography sx={{ ...MONO, fontSize: 24, fontWeight: 500, color }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1.25, mb: 1.75, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <TextField
          placeholder="Search PVI, ULOC, part, supplier…"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: { ...MONO, fontSize: 12 },
          }}
          sx={{ flex: 1, minWidth: 220 }}
        />

        {/* Filter buttons */}
        {(['all', 'complete', 'partial'] as FilterType[]).map((f) => (
          <Box
            key={f}
            component="button"
            onClick={() => setFilter(f)}
            sx={filterSx(filter === f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </Box>
        ))}

        {/* Export CSV */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 15 }} />}
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
        <Tooltip title={confirmClear ? 'Click again to confirm' : 'Clear all records'} placement="top">
          <IconButton
            size="small"
            disabled={history.length === 0}
            onClick={() => {
              if (confirmClear) {
                clearHistory();
                setConfirmClear(false);
              } else {
                setConfirmClear(true);
                setTimeout(() => setConfirmClear(false), 3000);
              }
            }}
            sx={{
              color: confirmClear ? 'error.main' : 'text.secondary',
              border: '1px solid',
              borderColor: confirmClear ? 'error.main' : 'divider',
              borderRadius: 1.5,
              p: 0.85,
              transition: 'all .2s',
              '&:hover': { color: 'error.main', borderColor: 'error.main' },
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
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
            bgcolor: 'rgba(255,184,0,.06)',
            border: '1px solid rgba(255,184,0,.25)',
            ...CONDENSED,
            fontSize: 13,
          }}
        >
          Click the delete button again to permanently clear all {history.length} records.
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
            gridTemplateColumns: '32px 160px 1fr 1fr 72px 116px 36px',
            gap: 1,
            px: 2,
            py: 1.25,
            bgcolor: '#1A2235',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {COL_HEADERS.map((h, i) => (
            <Typography
              key={i}
              sx={{
                ...CONDENSED,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              {h}
            </Typography>
          ))}
        </Box>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <Box sx={{ py: 7, textAlign: 'center' }}>
            <HistoryOutlinedIcon
              sx={{ fontSize: 38, color: 'text.secondary', opacity: 0.25, display: 'block', mx: 'auto', mb: 1.5 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {history.length === 0
                ? 'No validation sessions recorded yet.'
                : 'No records match your search or filter.'}
            </Typography>
            {history.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.6 }}>
                Complete a validation to see it appear here.
              </Typography>
            )}
          </Box>
        ) : (
          filtered.map((record) => (
            <RecordRow
              key={record.id}
              record={record}
              onDelete={() => deleteRecord(record.id)}
            />
          ))
        )}
      </Box>

      {/* Footer count */}
      {filtered.length > 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1.5, display: 'block', ...MONO, fontSize: 11 }}
        >
          {filtered.length === history.length
            ? `${history.length} session${history.length !== 1 ? 's' : ''} total`
            : `Showing ${filtered.length} of ${history.length} sessions`}
        </Typography>
      )}
    </StepLayout>
  );
}