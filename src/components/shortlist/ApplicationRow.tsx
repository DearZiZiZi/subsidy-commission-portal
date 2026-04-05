"use client";

import type { ApplicantPortfolioRow } from "@/types/scoring";
import { ScoreTierBadge } from "@/components/scoring/ScoreTierBadge";
import { ComponentSparkBars } from "@/components/scoring/ComponentBreakdown";

/** Компактные метрики строки: бейдж уровня + спарк-бары компонентов. */
export function ApplicationRowMetrics({ row }: { row: ApplicantPortfolioRow }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <ScoreTierBadge score={row.final_score_100} />
      <ComponentSparkBars breakdown={row.component_breakdown} />
    </div>
  );
}
