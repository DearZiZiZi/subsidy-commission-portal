"use client";

import { formatKZT } from "@/lib/score-utils";
import { cn } from "@/lib/utils";

export function BudgetTracker({
  total,
  allocated,
  className,
}: {
  total: number;
  allocated: number;
  className?: string;
}) {
  const remaining = Math.max(0, total - allocated);
  const pct = total > 0 ? (allocated / total) * 100 : 0;
  const low = total > 0 && remaining / total < 0.2;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Бюджет</p>
          <p className="font-mono text-lg font-semibold text-foreground">
            {formatKZT(total)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Зарезервировано</p>
          <p className="font-mono text-lg font-semibold text-gold-500">
            {formatKZT(allocated)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Остаток</p>
          <p
            className={cn(
              "font-mono text-lg font-semibold",
              low ? "text-score-red" : "text-score-green"
            )}
          >
            {formatKZT(remaining)}
          </p>
        </div>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-navy-800/40">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            low ? "bg-score-red" : "bg-gold-500"
          )}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
