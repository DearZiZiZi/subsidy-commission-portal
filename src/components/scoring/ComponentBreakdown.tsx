"use client";

import type { ComponentBreakdown } from "@/types/scoring";
import { COMPONENT_KEYS } from "@/types/scoring";
import { formatScoreOneDecimal } from "@/lib/score-utils";
import { cn } from "@/lib/utils";

export function ComponentBreakdownTable({
  breakdown,
  className,
}: {
  breakdown: ComponentBreakdown;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {COMPONENT_KEYS.map((key) => {
        const v = breakdown[key];
        const pct = (v / 20) * 100;
        return (
          <div key={key}>
            <div className="mb-1 flex justify-between gap-2 text-xs">
              <span className="text-muted line-clamp-2 leading-snug">{key}</span>
              <span className="font-mono text-foreground shrink-0">
                {formatScoreOneDecimal(v)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-navy-800/40 dark:bg-navy-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ComponentSparkBars({
  breakdown,
  className,
}: {
  breakdown: ComponentBreakdown;
  className?: string;
}) {
  return (
    <div className={cn("flex h-8 items-end gap-0.5", className)}>
      {COMPONENT_KEYS.map((k) => (
        <div
          key={k}
          title={`${k}: ${formatScoreOneDecimal(breakdown[k])}`}
          className="w-2 rounded-sm bg-gold-500/90"
          style={{ height: `${Math.max(8, (breakdown[k] / 20) * 100)}%` }}
        />
      ))}
    </div>
  );
}
