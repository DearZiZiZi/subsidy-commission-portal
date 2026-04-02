"use client";

import { motion } from "framer-motion";
import type { ApplicantPortfolioRow } from "@/types/scoring";
import { ScoreTierBadge } from "@/components/scoring/ScoreTierBadge";
import { ComponentSparkBars, ComponentBreakdownTable } from "@/components/scoring/ComponentBreakdown";
import type { Lang } from "@/lib/i18n-dict";

/** Компактные метрики строки: бейдж уровня + спарк-бары компонентов. */
export function ApplicationRowMetrics({
  row,
  lang,
}: {
  row: ApplicantPortfolioRow;
  lang: Lang;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <ScoreTierBadge score={row.final_score_100} lang={lang} />
      <ComponentSparkBars breakdown={row.component_breakdown} />
    </div>
  );
}

/** Развёрнутая панель: таблица компонентов + пояснение. */
export function ApplicationExpandPanel({
  row,
  motionLayout = true,
}: {
  row: ApplicantPortfolioRow;
  motionLayout?: boolean;
}) {
  const inner = (
    <>
      <ComponentBreakdownTable
        breakdown={row.component_breakdown}
        className="max-w-xl"
      />
      <p className="mt-4 text-xs text-muted">Обоснование</p>
      <p className="mt-1 text-sm leading-relaxed">{row.explanation}</p>
    </>
  );
  if (!motionLayout) return inner;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      {inner}
    </motion.div>
  );
}
