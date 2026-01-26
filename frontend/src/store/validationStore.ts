import { create } from 'zustand';
import type { BOMData } from '../utils/excelReader';

interface ValidationState {
  step: number;
  pvi: string;
  uloc: string;
  excelData: BOMData[];
  pviList: string[];
  setStep: (step: number) => void;
  setPVI: (pvi: string) => void;
  setULOC: (uloc: string) => void;
  setExcelData: (data: BOMData[]) => void;
  setPVIList: (pvis: string[]) => void;
  reset: () => void;
}

export const useValidationStore = create<ValidationState>((set) => ({
  step: 1,
  pvi: '',
  uloc: '',
  excelData: [],
  pviList: [],
  setStep: (step) => set({ step }),
  setPVI: (pvi) => set({ pvi }),
  setULOC: (uloc) => set({ uloc }),
  setExcelData: (excelData) => set({ excelData }),
  setPVIList: (pviList) => set({ pviList }),
  reset: () => set({ step: 1, pvi: '', uloc: '', excelData: [], pviList: [] }),
}));
