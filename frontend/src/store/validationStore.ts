import { create } from 'zustand';

interface ValidationState {
  step: number;
  pvi: string;
  uloc: string;
  setStep: (step: number) => void;
  setPVI: (pvi: string) => void;
  setULOC: (uloc: string) => void;
  reset: () => void;
}

export const useValidationStore = create<ValidationState>((set) => ({
  step: 1,
  pvi: '',
  uloc: '',
  setStep: (step) => set({ step }),
  setPVI: (pvi) => set({ pvi }),
  setULOC: (uloc) => set({ uloc }),
  reset: () => set({ step: 1, pvi: '', uloc: '' }),
}));
