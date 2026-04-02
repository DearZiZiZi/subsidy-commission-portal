"use client";

import { cn } from "@/lib/utils";

export function BatchProgress({
  done,
  total,
  className,
}: {
  done: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-xs text-muted">
        <span>Обработано</span>
        <span className="font-mono">
          {done} / {total}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-navy-800/50">
        <div
          className="h-full rounded-full bg-gold-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
