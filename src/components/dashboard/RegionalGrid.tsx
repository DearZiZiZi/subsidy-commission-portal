"use client";

import type { ApplicantPortfolioRow } from "@/types/scoring";
import { REGIONS } from "@/types/scoring";
import { useMemo } from "react";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

function heatColor(avg: number): string {
  const t = Math.min(1, Math.max(0, (avg - 30) / 55));
  const r = Math.round(239 + (34 - 239) * t);
  const g = Math.round(68 + (197 - 68) * t);
  const b = Math.round(68 + (94 - 68) * t);
  return `rgb(${r},${g},${b})`;
}

export function RegionalGrid({ rows }: { rows: ApplicantPortfolioRow[] }) {
  const { t } = useI18n();
  const cellMap = useMemo(() => {
    const map = new Map<string, { sum: number; n: number }>();
    for (const r of rows) {
      const cur = map.get(r.region) ?? { sum: 0, n: 0 };
      cur.sum += r.final_score_100;
      cur.n += 1;
      map.set(r.region, cur);
    }
    const out = new Map<string, number>();
    for (const [reg, agg] of Array.from(map.entries())) {
      out.set(reg, agg.sum / agg.n);
    }
    return out;
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
        {t("empty_charts")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {REGIONS.map((region) => {
        const avg = cellMap.get(region);
        const display = avg !== undefined ? avg.toFixed(1) : "—";
        const bg =
          avg !== undefined ? heatColor(avg) : "rgba(148,163,184,0.15)";
        return (
          <div
            key={region}
            className={cn(
              "rounded-lg border border-border/60 p-3 text-center transition-shadow",
              avg !== undefined && "shadow-inner"
            )}
            style={{ backgroundColor: bg }}
          >
            <p className="text-[10px] font-medium leading-tight text-navy-950 dark:text-navy-950">
              {region}
            </p>
            <p className="mt-2 font-mono text-lg font-semibold text-navy-950">
              {display}
            </p>
          </div>
        );
      })}
    </div>
  );
}
