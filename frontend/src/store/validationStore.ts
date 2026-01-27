import { create } from 'zustand';
import type { PartRow } from '../utils/excelReader';

export interface ValidationState {
  step: number;

  pvi: string;
  uloc: string;

  pviList: string[];
  ulocList: string[];

  rows: PartRow[];

  /** 🔥 MULTIPLE PARTS */
  selectedParts: PartRow[];

  setStep: (step: number) => void;
  setPVI: (pvi: string) => void;
  setULOC: (uloc: string) => void;

  setPVIList: (list: string[]) => void;
  setULOCList: (list: string[]) => void;
  setRows: (rows: PartRow[]) => void;

  setSelectedParts: (rows: PartRow[]) => void;

  reset: () => void;
}

export const useValidationStore = create<ValidationState>((set) => ({
  step: 1,

  pvi: '',
  uloc: '',

  pviList: [],
  ulocList: [],

  rows: [],
  selectedParts: [],

  setStep: (step) => set({ step }),

  setPVI: (pvi) =>
    set({
      pvi,
      uloc: '',
      selectedParts: [],
    }),

  setULOC: (uloc) =>
    set({
      uloc,
      selectedParts: [],
    }),

  setPVIList: (list) => set({ pviList: list }),
  setULOCList: (list) => set({ ulocList: list }),
  setRows: (rows) => set({ rows }),

  setSelectedParts: (rows) => set({ selectedParts: rows }),

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
