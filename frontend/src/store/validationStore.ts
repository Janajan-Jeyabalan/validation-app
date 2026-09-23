import { create } from 'zustand';
import type { PartRow } from '../utils/excelReader';

const HISTORY_KEY = 'gm-validation-history';

interface ValidatedPart {
  part: string;
  item: string;
  partDesc: string;
  suppnm: string;
  duns: string;
  validated: boolean;
}

export interface ValidationRecord {
  id: string;
  timestamp: string;
  pvi: string;
  uloc: string;
  parts: ValidatedPart[];
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
    parts: ValidatedPart[],
    validatedCount: number,
    serverId?: string | number
  ) => void;

  saveValidationRecordToServer: (
    userId: string | number,
    parts: ValidatedPart[],
    validatedCount: number
  ) => Promise<string | null>;

  loadHistoryFromServer: (
    userId: string | number
  ) => Promise<void>;

  syncLocalHistoryToServer: (
    userId: string | number
  ) => Promise<{
    synced: number;
    errors: string[];
  }>;

  syncBulkToServer: (
    items: any[]
  ) => Promise<{
    synced: number;
    errors: string[];
  }>;

  deleteRecord: (id: string) => void;
  clearHistory: () => void;
  reset: () => void;
}

function loadHistory(): ValidationRecord[] {
  try {
    return JSON.parse(
      localStorage.getItem(HISTORY_KEY) ?? '[]'
    );
  } catch {
    return [];
  }
}

function persistHistory(
  records: ValidationRecord[]
): void {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(records)
  );
}

function getApiBaseUrl(): string {
  return (
    (import.meta as any).env?.VITE_API_URL ||
    'http://localhost:4000'
  );
}

function parseMetadata(metadata: unknown): any {
  if (!metadata) {
    return {};
  }

  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }

  return metadata;
}

export const useValidationStore =
  create<ValidationState>((set, get) => ({
    step: 1,

    pvi: '',
    uloc: '',

    pviList: [],
    ulocList: [],

    rows: [],
    selectedParts: [],

    history: loadHistory(),
    syncing: false,

    setStep: (step) => {
      set({ step });
    },

    setPVI: (pvi) => {
      set({
        pvi,
        uloc: '',
        selectedParts: []
      });
    },

    setULOC: (uloc) => {
      set({
        uloc,
        selectedParts: []
      });
    },

    setPVIList: (list) => {
      set({ pviList: list });
    },

    setULOCList: (list) => {
      set({ ulocList: list });
    },

    setRows: (rows) => {
      set({ rows });
    },

    setSelectedParts: (rows) => {
      set({ selectedParts: rows });
    },

    saveValidationRecord: (
      parts,
      validatedCount,
      serverId
    ) => {
      const {
        pvi,
        uloc,
        history
      } = get();

      const record: ValidationRecord = {
        id: serverId
          ? String(serverId)
          : crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        pvi,
        uloc,
        parts,
        totalParts: parts.length,
        validatedCount,
        status:
          validatedCount === parts.length
            ? 'complete'
            : 'partial'
      };

      const updated = [record, ...history];

      persistHistory(updated);

      set({
        history: updated
      });
    },

    saveValidationRecordToServer: async (
      userId,
      parts,
      validatedCount
    ) => {
      if (!userId) {
        return null;
      }

      const {
        pvi,
        uloc,
        history
      } = get();

      const status: 'complete' | 'partial' =
        validatedCount === parts.length
          ? 'complete'
          : 'partial';

      const payload = {
        user_id: userId,
        status,
        metadata: {
          pvi,
          uloc
        },
        steps: parts.map((part) => ({
          step_name: 'parts',
          data: part
        }))
      };

      try {
        const response = await fetch(
          `${getApiBaseUrl()}/api/validations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          }
        );

        if (!response.ok) {
          console.error(
            'saveValidationRecordToServer failed',
            await response.text()
          );

          return null;
        }

        const data = await response.json();

        const serverId =
          data.id?.toString() ??
          crypto.randomUUID();

        const record: ValidationRecord = {
          id: serverId,
          timestamp: new Date().toISOString(),
          pvi,
          uloc,
          parts,
          totalParts: parts.length,
          validatedCount,
          status
        };

        const updated = [record, ...history];

        persistHistory(updated);

        set({
          history: updated
        });

        return serverId;
      } catch (err) {
        console.error(err);
        return null;
      }
    },

    loadHistoryFromServer: async (userId) => {
      if (!userId) {
        return;
      }

      try {
        const response = await fetch(
          `${getApiBaseUrl()}/api/validations/user/${userId}`
        );

        if (!response.ok) {
          console.error(
            'loadHistoryFromServer failed',
            await response.text()
          );

          return;
        }

        const json = await response.json();

        const items = (
          json.validations || []
        )
          .map((validation: any) => {
            const metadata = parseMetadata(
              validation.metadata
            );

            const parts: ValidatedPart[] = Array.isArray(
              validation.parts
            )
              ? validation.parts.map((part: any) => ({
                  part: String(part.part || ''),
                  item: String(part.item || ''),
                  partDesc: String(part.partDesc || ''),
                  suppnm: String(part.suppnm || ''),
                  duns: String(part.duns || ''),
                  validated: Boolean(part.validated)
                }))
              : [];

            const totalParts = Number(
              validation.total_parts ?? parts.length
            );

            const validatedCount = Number(
              validation.validated_count ??
                parts.filter((part) => part.validated).length
            );

            return {
              id: String(validation.id),
              timestamp:
                validation.created_at ||
                new Date().toISOString(),
              pvi: String(
                validation.pvi || metadata.pvi || ''
              ),
              uloc: String(
                validation.uloc || metadata.uloc || ''
              ),
              parts,
              totalParts,
              validatedCount,
              status:
                validation.status === 'complete'
                  ? 'complete'
                  : 'partial'
            } as ValidationRecord;
          })
          // Do not show unfinished file-upload drafts
          // as completed validation records.
          .filter(
            (record: ValidationRecord) =>
              record.totalParts > 0 ||
              record.parts.length > 0
          );

        persistHistory(items);

        set({
          history: items
        });
      } catch (err) {
        console.error(err);
      }
    },

    syncBulkToServer: async (items) => {
      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return {
          synced: 0,
          errors: []
        };
      }

      try {
        const response = await fetch(
          `${getApiBaseUrl()}/api/validations/bulk`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(items)
          }
        );

        if (!response.ok) {
          const text = await response.text();

          console.error(
            'bulk sync failed',
            text
          );

          return {
            synced: 0,
            errors: [text]
          };
        }

        const json = await response.json();
        const results = json.results || [];

        let synced = 0;
        const errors: string[] = [];

        results.forEach(
          (result: any, index: number) => {
            if (result.success) {
              synced += 1;
            } else {
              errors.push(
                `item ${index}: ${result.error}`
              );
            }
          }
        );

        return {
          synced,
          errors
        };
      } catch (err: any) {
        console.error(err);

        return {
          synced: 0,
          errors: [
            err?.message || 'error'
          ]
        };
      }
    },

    syncLocalHistoryToServer: async (
      userId
    ) => {
      if (!userId) {
        return {
          synced: 0,
          errors: ['no userId']
        };
      }

      set({
        syncing: true
      });

      const { history } = get();

      const toSync = history
        .filter(
          (record) =>
            record.id &&
            isNaN(Number(record.id))
        )
        .map((record) => ({
          user_id: userId,
          status: record.status,
          metadata: {
            pvi: record.pvi,
            uloc: record.uloc
          },
          steps: record.parts.map(
            (part) => ({
              step_name: 'parts',
              data: part
            })
          )
        }));

      let syncResult = {
        synced: 0,
        errors: [] as string[]
      };

      if (toSync.length > 0) {
        try {
          syncResult =
            await get().syncBulkToServer(
              toSync
            );
        } catch (err) {
          console.error(
            'bulk sync failed',
            err
          );

          syncResult = {
            synced: 0,
            errors: [
              (err as any)?.message ||
                'bulk error'
            ]
          };
        }
      }

      try {
        await get().loadHistoryFromServer(
          userId
        );
      } catch (err) {
        console.error(
          'error loading history after sync',
          err
        );

        syncResult.errors.push(
          `loadError:${
            (err as any)?.message ?? err
          }`
        );
      } finally {
        set({
          syncing: false
        });
      }

      return syncResult;
    },

    deleteRecord: (id) => {
      const updated = get().history.filter(
        (record) => record.id !== id
      );

      persistHistory(updated);

      set({
        history: updated
      });
    },

    clearHistory: () => {
      localStorage.removeItem(HISTORY_KEY);

      set({
        history: []
      });
    },

    // Start another validation using the workbook
    // that is already loaded.
    reset: () => {
      const { rows } = get();

      set({
        step: rows.length > 0 ? 2 : 1,
        pvi: '',
        uloc: '',
        selectedParts: []
      });
    }
  }));
