import { create } from 'zustand';
import type { PartRow } from '../utils/excelReader';

const HISTORY_KEY = 'gm-validation-history';

export interface ValidationRecord {
  id: string;
  timestamp: string;
  pvi: string;
  uloc: string;
  parts: {
    part: string;
    item: string;
    partDesc: string;
    suppnm: string;
    duns: string;
    validated: boolean;
  }[];
  totalParts: number;
  validatedCount: number;
  status: 'complete' | 'partial';
}

export interface ValidationState {
  step: number;

  pvi: string;
  uloc: string;

  pviList: string[];
  ulocList: string[];

  rows: PartRow[];
  selectedParts: PartRow[];

  // ── History ──────────────────────────────────────────────
  history: ValidationRecord[];

  // ── Setters ──────────────────────────────────────────────
  setStep: (step: number) => void;
  setPVI: (pvi: string) => void;
  setULOC: (uloc: string) => void;
  setPVIList: (list: string[]) => void;
  setULOCList: (list: string[]) => void;
  setRows: (rows: PartRow[]) => void;
  setSelectedParts: (rows: PartRow[]) => void;

  // ── History actions ───────────────────────────────────────
  saveValidationRecord: (
    parts: { part: string; item: string; partDesc: string; suppnm: string; duns: string; validated: boolean }[],
    validatedCount: number
  ) => void;
  deleteRecord: (id: string) => void;
  clearHistory: () => void;

  reset: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadHistory(): ValidationRecord[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function persistHistory(records: ValidationRecord[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useValidationStore = create<ValidationState>((set, get) => ({
  step: 1,

  pvi: '',
  uloc: '',

  pviList: [],
  ulocList: [],

  rows: [],
  selectedParts: [],

  history: loadHistory(),

  // ── Step / field setters ──────────────────────────────────

  setStep: (step) => set({ step }),

  setPVI: (pvi) => set({ pvi, uloc: '', selectedParts: [] }),

  setULOC: (uloc) => set({ uloc, selectedParts: [] }),

  setPVIList: (list) => set({ pviList: list }),
  setULOCList: (list) => set({ ulocList: list }),
  setRows: (rows) => set({ rows }),
  setSelectedParts: (rows) => set({ selectedParts: rows }),

  // ── History actions ───────────────────────────────────────

  saveValidationRecord: (parts, validatedCount) => {
    const { pvi, uloc, history } = get();

    const record: ValidationRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      pvi,
      uloc,
      parts,
      totalParts: parts.length,
      validatedCount,
      status: validatedCount === parts.length ? 'complete' : 'partial',
    };

    const updated = [record, ...history];
    persistHistory(updated);
    set({ history: updated });
  },

  deleteRecord: (id) => {
    const updated = get().history.filter((r) => r.id !== id);
    persistHistory(updated);
    set({ history: updated });
  },

  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY);
    set({ history: [] });
  },

  // ── Reset (preserves history) ─────────────────────────────

  reset: () =>
    set({
      step: 1,
      pvi: '',
      uloc: '',
      pviList: [],
      ulocList: [],
      rows: [],
      selectedParts: [],
    }),
}));