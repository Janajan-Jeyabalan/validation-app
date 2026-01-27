import { create } from 'zustand';
import type { PartRow } from '../utils/excelReader';


export interface ValidationState {
  /* ---------------- Navigation ---------------- */
  step: number;

  /* ---------------- Selections ---------------- */
  pvi: string;
  uloc: string;

  /* ---------------- Lists ---------------- */
  pviList: string[];
  ulocList: string[];

  /* ---------------- Excel Data ---------------- */
  rows: PartRow[];
  selectedPart: PartRow | null;

  /* ---------------- Actions ---------------- */
  setStep: (step: number) => void;

  setPVI: (pvi: string) => void;
  setULOC: (uloc: string) => void;

  setPVIList: (list: string[]) => void;
  setULOCList: (list: string[]) => void;

  setRows: (rows: PartRow[]) => void;
  setSelectedPart: (row: PartRow | null) => void;

  reset: () => void;
}

export const useValidationStore = create<ValidationState>((set) => ({
  /* ---------------- Initial State ---------------- */
  step: 1,

  pvi: '',
  uloc: '',

  pviList: [],
  ulocList: [],

  rows: [],
  selectedPart: null,

  /* ---------------- Actions ---------------- */
  setStep: (step) => set({ step }),

  setPVI: (pvi) =>
    set({
      pvi,
      uloc: '',
      selectedPart: null,
    }),

  setULOC: (uloc) =>
    set({
      uloc,
      selectedPart: null,
    }),

  setPVIList: (list) => set({ pviList: list }),
  setULOCList: (list) => set({ ulocList: list }),

  setRows: (rows) => set({ rows }),

  setSelectedPart: (row) => set({ selectedPart: row }),

  reset: () =>
    set({
      step: 1,
      pvi: '',
      uloc: '',
      pviList: [],
      ulocList: [],
      rows: [],
      selectedPart: null,
    }),
}));
