import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ApplicantPortfolioRow,
  CommissionApplicant,
  Direction,
  FilterState,
  Region,
} from "@/types/scoring";

const defaultFilters: FilterState = {
  directions: [],
  regions: [],
  scoreMin: 0,
  scoreMax: 100,
  month: null,
  topN: "all",
};

function makeId(applicant_id: string, addedAt: number): string {
  return `${applicant_id}__${addedAt}`;
}

export function rowToCommission(
  row: ApplicantPortfolioRow,
  needsReview = false
): CommissionApplicant {
  const addedAt = Date.now();
  return {
    ...row,
    needsReview,
    addedAt,
    id: makeId(row.applicant_id, addedAt),
  };
}

interface ShortlistState {
  shortlist: CommissionApplicant[];
  budgetTotal: number;
  filters: FilterState;
  manualReviewIds: string[];
  setBudgetTotal: (n: number) => void;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  addToShortlist: (row: ApplicantPortfolioRow) => void;
  addManyToShortlist: (rows: ApplicantPortfolioRow[]) => void;
  removeFromShortlist: (id: string) => void;
  removeByApplicantId: (applicant_id: string) => void;
  removeMany: (ids: string[]) => void;
  toggleNeedsReview: (id: string) => void;
  toggleManualReviewApplicant: (applicant_id: string) => void;
  isInShortlist: (applicant_id: string) => boolean;
  budgetAllocated: () => number;
  budgetRemaining: () => number;
}

export const useShortlistStore = create<ShortlistState>()(
  persist(
    (set, get) => ({
      shortlist: [],
      budgetTotal: 50_000_000_000,
      filters: defaultFilters,
      manualReviewIds: [],

      setBudgetTotal: (n) => set({ budgetTotal: Math.max(0, n) }),

      setFilters: (f) =>
        set((s) => ({
          filters: { ...s.filters, ...f },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      addToShortlist: (row) => {
        const { shortlist } = get();
        if (shortlist.some((x) => x.applicant_id === row.applicant_id)) return;
        set({ shortlist: [...shortlist, rowToCommission(row, false)] });
      },

      addManyToShortlist: (rows) => {
        const { shortlist } = get();
        const existing = new Set(shortlist.map((x) => x.applicant_id));
        const next = [...shortlist];
        for (const row of rows) {
          if (existing.has(row.applicant_id)) continue;
          existing.add(row.applicant_id);
          next.push(rowToCommission(row, false));
        }
        set({ shortlist: next });
      },

      removeFromShortlist: (id) =>
        set((s) => ({ shortlist: s.shortlist.filter((x) => x.id !== id) })),

      removeByApplicantId: (applicant_id) =>
        set((s) => ({
          shortlist: s.shortlist.filter((x) => x.applicant_id !== applicant_id),
        })),

      removeMany: (ids) => {
        const idSet = new Set(ids);
        set((s) => ({
          shortlist: s.shortlist.filter((x) => !idSet.has(x.id)),
        }));
      },

      toggleNeedsReview: (id) =>
        set((s) => ({
          shortlist: s.shortlist.map((x) =>
            x.id === id ? { ...x, needsReview: !x.needsReview } : x
          ),
        })),

      toggleManualReviewApplicant: (applicant_id) =>
        set((s) => {
          const has = s.manualReviewIds.includes(applicant_id);
          return {
            manualReviewIds: has
              ? s.manualReviewIds.filter((x) => x !== applicant_id)
              : [...s.manualReviewIds, applicant_id],
          };
        }),

      isInShortlist: (applicant_id) =>
        get().shortlist.some((x) => x.applicant_id === applicant_id),

      budgetAllocated: () =>
        get().shortlist.reduce((a, x) => a + x.requested_amount, 0),

      budgetRemaining: () => {
        const { budgetTotal } = get();
        return budgetTotal - get().budgetAllocated();
      },
    }),
    {
      name: "subsidy-commission-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        shortlist: s.shortlist,
        budgetTotal: s.budgetTotal,
        manualReviewIds: s.manualReviewIds,
      }),
    }
  )
);

export function filterPool(
  rows: ApplicantPortfolioRow[],
  filters: FilterState
): ApplicantPortfolioRow[] {
  const dirSet = filters.directions.length > 0 ? new Set<Direction>(filters.directions) : null;
  const regSet = filters.regions.length > 0 ? new Set<Region>(filters.regions) : null;
  const { scoreMin, scoreMax, month } = filters;

  const out: ApplicantPortfolioRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (dirSet && !dirSet.has(r.direction)) continue;
    if (regSet && !regSet.has(r.region)) continue;
    if (r.final_score_100 < scoreMin || r.final_score_100 > scoreMax) continue;
    if (month !== null && r.month !== month) continue;
    out.push(r);
  }

  out.sort((a, b) => b.final_score_100 - a.final_score_100);

  if (filters.topN === "10") return out.slice(0, 10);
  if (filters.topN === "25") return out.slice(0, 25);
  if (filters.topN === "50") return out.slice(0, 50);
  return out;
}
