"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BudgetTracker } from "@/components/shortlist/BudgetTracker";
import { ShortlistTable } from "@/components/shortlist/ShortlistTable";
import { getDashboardDataset } from "@/data/sample-results";
import {
  filterPool,
  useShortlistStore,
} from "@/store/useShortlistStore";
import { DIRECTIONS, REGIONS } from "@/types/scoring";
import { useI18n } from "@/providers/i18n-provider";
import { downloadCommissionPdf } from "@/lib/pdf-generator";
import { downloadShortlistXlsx } from "@/lib/excel-export";
import { formatKZT } from "@/lib/score-utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShortlistPage() {
  const { t, lang } = useI18n();
  const [filtersOpen, setFiltersOpen] = useState(true);

  const shortlist = useShortlistStore((s) => s.shortlist);
  const budgetTotal = useShortlistStore((s) => s.budgetTotal);
  const setBudgetTotal = useShortlistStore((s) => s.setBudgetTotal);
  const filters = useShortlistStore((s) => s.filters);
  const setFilters = useShortlistStore((s) => s.setFilters);
  const resetFilters = useShortlistStore((s) => s.resetFilters);
  const addToShortlist = useShortlistStore((s) => s.addToShortlist);
  const addManyToShortlist = useShortlistStore((s) => s.addManyToShortlist);
  const removeByApplicantId = useShortlistStore((s) => s.removeByApplicantId);
  const removeMany = useShortlistStore((s) => s.removeMany);
  const budgetAllocated = useShortlistStore((s) => s.budgetAllocated);
  const manualReviewIds = useShortlistStore((s) => s.manualReviewIds);
  const toggleManualReviewApplicant = useShortlistStore(
    (s) => s.toggleManualReviewApplicant
  );

  const allApplicants = useMemo(() => getDashboardDataset(), []);
  const pool = useMemo(
    () => filterPool(allApplicants, filters),
    [allApplicants, filters]
  );

  const shortlistIds = useMemo(
    () => new Set(shortlist.map((x) => x.applicant_id)),
    [shortlist]
  );

  const manualSet = useMemo(
    () => new Set(manualReviewIds),
    [manualReviewIds]
  );

  const summary = useMemo(() => {
    const n = shortlist.length;
    const total = shortlist.reduce((a, x) => a + x.requested_amount, 0);
    const avg =
      n > 0
        ? shortlist.reduce((a, x) => a + x.final_score_100, 0) / n
        : 0;
    return { n, total, avg };
  }, [shortlist]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("shortlist_title")}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("table_pool")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => downloadShortlistXlsx(shortlist)}
          >
            {t("export_xlsx")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void downloadCommissionPdf(shortlist, budgetTotal, lang)
                .then(() => toast.success("PDF сформирован"))
                .catch((e: unknown) =>
                  toast.error(
                    e instanceof Error ? e.message : "Ошибка экспорта PDF"
                  )
                );
            }}
          >
            {t("export_commission_pdf")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className={cn(!filtersOpen && "hidden lg:block")}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("filters")}</CardTitle>
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="mb-2 text-xs uppercase text-muted">{t("filter_direction")}</p>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {DIRECTIONS.map((d) => (
                  <label key={d} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.directions.includes(d)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...filters.directions, d]
                          : filters.directions.filter((x) => x !== d);
                        setFilters({ directions: next });
                      }}
                      className="rounded border-border"
                    />
                    <span className="line-clamp-2 text-xs">{d}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase text-muted">{t("filter_region")}</p>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {REGIONS.map((r) => (
                  <label key={r} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.regions.includes(r)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...filters.regions, r]
                          : filters.regions.filter((x) => x !== r);
                        setFilters({ regions: next });
                      }}
                      className="rounded border-border"
                    />
                    <span className="text-xs">{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase text-muted">{t("filter_score")}</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  className="font-mono"
                  value={filters.scoreMin}
                  onChange={(e) =>
                    setFilters({ scoreMin: Number(e.target.value) || 0 })
                  }
                />
                <Input
                  type="number"
                  className="font-mono"
                  value={filters.scoreMax}
                  onChange={(e) =>
                    setFilters({ scoreMax: Number(e.target.value) || 100 })
                  }
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase text-muted">{t("filter_month")}</p>
              <select
                className="w-full rounded-lg border border-border bg-card px-2 py-2 text-sm"
                value={filters.month ?? ""}
                onChange={(e) =>
                  setFilters({
                    month: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              >
                <option value="">Все</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase text-muted">{t("filter_top")}</p>
              <select
                className="w-full rounded-lg border border-border bg-card px-2 py-2 text-sm"
                value={filters.topN}
                onChange={(e) =>
                  setFilters({
                    topN: e.target.value as typeof filters.topN,
                  })
                }
              >
                <option value="10">{t("top_10")}</option>
                <option value="25">{t("top_25")}</option>
                <option value="50">{t("top_50")}</option>
                <option value="all">{t("top_all")}</option>
              </select>
            </div>
            <Button type="button" variant="ghost" onClick={resetFilters}>
              Сбросить
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!filtersOpen && (
            <Button
              type="button"
              variant="outline"
              className="lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <ChevronRight className="mr-2 h-4 w-4" />
              {t("filters")}
            </Button>
          )}

          <BudgetTracker total={budgetTotal} allocated={budgetAllocated()} />
          <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-4">
            <div>
              <label className="text-xs text-muted">{t("budget_total")}</label>
              <Input
                type="number"
                className="mt-1 w-56 font-mono"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                addManyToShortlist(pool);
                toast.success(t("bulk_add"));
              }}
            >
              {t("bulk_add")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const ids = shortlist.map((x) => x.id);
                removeMany(ids);
                toast.message(t("bulk_remove"));
              }}
            >
              {t("bulk_remove")}
            </Button>
          </div>

          <ShortlistTable
            rows={pool}
            lang={lang}
            shortlistIds={shortlistIds}
            onAdd={addToShortlist}
            onRemoveByApplicantId={removeByApplicantId}
            onToggleManualReview={toggleManualReviewApplicant}
            manualReviewIds={manualSet}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("shortlist_summary")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-6 text-sm">
              <span>
                N = <span className="font-mono">{summary.n}</span>
              </span>
              <span>
                Σ ={" "}
                <span className="font-mono">{formatKZT(summary.total)}</span>
              </span>
              <span>
                Ø балл ={" "}
                <span className="font-mono">{summary.avg.toFixed(1)}</span>
              </span>
              <Button
                type="button"
                onClick={() => {
                  void downloadCommissionPdf(shortlist, budgetTotal, lang)
                    .then(() => toast.success("PDF сформирован"))
                    .catch((e: unknown) =>
                      toast.error(
                        e instanceof Error ? e.message : "Ошибка экспорта PDF"
                      )
                    );
                }}
              >
                {t("generate_conclusion")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
