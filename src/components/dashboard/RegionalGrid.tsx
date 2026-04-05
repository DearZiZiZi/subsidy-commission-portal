"use client";

import type { ApplicantPortfolioRow } from "@/types/scoring";
import { REGIONS } from "@/types/scoring";
import { useMemo } from "react";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

function accentForAvg(avg: number): string {
  if (avg >= 75) return "#34C759";
  if (avg >= 60) return "#007AFF";
  if (avg >= 45) return "#FF9500";
  return "#FF3B30";
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
      <div className="flex h-48 items-center justify-center rounded-[12px] border border-dashed border-[#E8EAED] text-sm text-[#8E8E93]">
        {t("empty_charts")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {REGIONS.map((region) => {
        const avg = cellMap.get(region);
        const display = avg !== undefined ? avg.toFixed(1) : "—";
        const accent =
          avg !== undefined ? accentForAvg(avg) : "transparent";
        return (
          <div
            key={region}
            className={cn(
              "rounded-[12px] border border-[#E8EAED] bg-white p-3 text-center shadow-card"
            )}
          >
            <div
              className="mx-auto mb-2 h-1 w-8 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <p className="text-[10px] font-medium leading-tight text-[#3C3C43]">
              {region}
            </p>
            <p className="mt-2 text-lg font-bold tabular-nums tracking-tight text-[#1C1C1E]">
              {display}
            </p>
          </div>
        );
      })}
    </div>
  );
}
