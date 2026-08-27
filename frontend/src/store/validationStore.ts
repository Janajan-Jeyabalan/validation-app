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

  history: ValidationRecord[];
  syncing: boolean;

  setStep: (step: number) => void;
  setPVI: (pvi: string) => void;
  setULOC: (uloc: string) => void;
  setPVIList: (list: string[]) => void;
  setULOCList: (list: string[]) => void;
  setRows: (rows: PartRow[]) => void;
  setSelectedParts: (rows: PartRow[]) => void;

  saveValidationRecord: (
    parts: { part: string; item: string; partDesc: string; suppnm: string; duns: string; validated: boolean }[],
    validatedCount: number
  ) => void;
  saveValidationRecordToServer: (
    userId: string | number,
    parts: { part: string; item: string; partDesc: string; suppnm: string; duns: string; validated: boolean }[],
    validatedCount: number
  ) => Promise<string | null>;
  loadHistoryFromServer: (userId: string | number) => Promise<void>;
  syncLocalHistoryToServer: (userId: string | number) => Promise<{ synced: number; errors: string[] }>;
  syncBulkToServer: (items: any[]) => Promise<{ synced: number; errors: string[] }>;
  deleteRecord: (id: string) => void;
  clearHistory: () => void;

  reset: () => void;
}


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


export const useValidationStore = create<ValidationState>((set, get) => ({
  step: 1,

  pvi: '',
  uloc: '',

  pviList: [],
  ulocList: [],

  rows: [],
  selectedParts: [],

  history: loadHistory(),
  syncing: false,


  setStep: (step) => set({ step }),

  setPVI: (pvi) => set({ pvi, uloc: '', selectedParts: [] }),

  setULOC: (uloc) => set({ uloc, selectedParts: [] }),

  setPVIList: (list) => set({ pviList: list }),
  setULOCList: (list) => set({ ulocList: list }),
  setRows: (rows) => set({ rows }),
  setSelectedParts: (rows) => set({ selectedParts: rows }),


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

  // Save to server for a logged-in user
  saveValidationRecordToServer: async (userId, parts, validatedCount) => {
    if (!userId) return null;

    const { pvi, uloc, history } = get();

    const status: 'complete' | 'partial' = validatedCount === parts.length ? 'complete' : 'partial';

    const payload = {
      user_id: userId,
      status,
      metadata: { pvi, uloc },
      steps: parts.map((p) => ({ step_name: 'parts', data: p })),
    };

    try {
      const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${base}/api/validations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error('saveValidationRecordToServer failed', await res.text());
        return null;
      }

      const data = await res.json();
      const serverId = data.id?.toString() ?? crypto.randomUUID();

      const record: ValidationRecord = {
        id: serverId,
        timestamp: new Date().toISOString(),
        pvi,
        uloc,
        parts,
        totalParts: parts.length,
        validatedCount,
        status,
      };

      const updated = [record, ...history];
      persistHistory(updated);
      set({ history: updated });

      return serverId;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  // Load history from server for a user (maps DB rows to local shape)
  loadHistoryFromServer: async (userId) => {
    if (!userId) return;

    try {
      const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${base}/api/validations/user/${userId}`);
      if (!res.ok) {
        console.error('loadHistoryFromServer failed', await res.text());
        return;
      }

      const json = await res.json();
      const items = (json.validations || []).map((v: any) => {
        const meta = v.metadata ? JSON.parse(v.metadata) : v.metadata || {};
        return {
          id: v.id?.toString(),
          timestamp: v.created_at,
          pvi: meta.pvi || '',
          uloc: meta.uloc || '',
          parts: [],
          totalParts: 0,
          validatedCount: 0,
          status: v.status || 'partial',
        } as ValidationRecord;
      });

      persistHistory(items);
      set({ history: items });
    } catch (err) {
      console.error(err);
    }
  },

  // Bulk sync: upload an array of validation objects in a single request
  syncBulkToServer: async (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return { synced: 0, errors: [] };
    }

    try {
      const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${base}/api/validations/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error('bulk sync failed', txt);
        return { synced: 0, errors: [txt] };
      }

      const json = await res.json();
      const results = json.results || [];

      let synced = 0;
      const errors: string[] = [];

      results.forEach((r: any, i: number) => {
        if (r.success) {
          synced += 1;
        } else {
          errors.push(`item ${i}: ${r.error}`);
        }
      });

      return { synced, errors };
    } catch (err: any) {
      console.error(err);
      return { synced: 0, errors: [err?.message || 'error'] };
    }
  },

  // Upload local history items to server (skips numeric ids which are assumed server-side)
  syncLocalHistoryToServer: async (userId) => {
    if (!userId) return { synced: 0, errors: ['no userId'] };

    set({ syncing: true });

    const { history } = get();

    // build payload for items not yet on server (non-numeric ids)
    const toSync = history
      .filter((rec) => rec.id && isNaN(Number(rec.id)))
      .map((rec) => ({
        user_id: userId,
        status: rec.status,
        metadata: { pvi: rec.pvi, uloc: rec.uloc },
        steps: rec.parts.map((p) => ({ step_name: 'parts', data: p })),
      }));

    let syncResult = { synced: 0, errors: [] as string[] };

    // use bulk endpoint if items to sync
    if (toSync.length > 0) {
      try {
        syncResult = await (get() as any).syncBulkToServer(toSync);
      } catch (err) {
        console.error('bulk sync failed', err);
        syncResult = { synced: 0, errors: [(err as any)?.message || 'bulk error'] };
      }
    }

    // refresh from server after sync
    try {
      await (get() as any).loadHistoryFromServer(userId);
    } catch (err) {
      console.error('error loading history after sync', err);
      syncResult.errors.push(`loadError:${(err as any)?.message ?? err}`);
    } finally {
      set({ syncing: false });
    }

    return syncResult;
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