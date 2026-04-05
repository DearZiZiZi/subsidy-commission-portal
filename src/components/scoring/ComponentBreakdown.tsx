"use client";

import type { ComponentBreakdown } from "@/types/scoring";
import { COMPONENT_KEYS } from "@/types/scoring";
import { componentBarColor, formatScoreOneDecimal } from "@/lib/score-utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function BreakdownRow({ label, v }: { label: string; v: number }) {
  const pct = (v / 20) * 100;
  const fill = componentBarColor(v);
  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 text-xs">
        <span className="line-clamp-2 leading-snug text-[#8E8E93]">{label}</span>
        <span className="shrink-0 font-semibold tabular-nums tracking-tight text-[#1C1C1E]">
          {formatScoreOneDecimal(v)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#F2F2F7]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: fill }}
        />
      </div>
    </div>
  );
}

export function ComponentBreakdownTable({
  breakdown,
  className,
  stagger,
}: {
  breakdown: ComponentBreakdown;
  className?: string;
  stagger?: boolean;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {COMPONENT_KEYS.map((key, i) => {
        const v = breakdown[key];
        if (stagger) {
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.35 }}
            >
              <BreakdownRow label={key} v={v} />
            </motion.div>
          );
        }
        return <BreakdownRow key={key} label={key} v={v} />;
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
    <div
      className={cn("flex items-end gap-[3px]", className)}
      style={{ height: 24 }}
    >
      {COMPONENT_KEYS.map((k) => {
        const v = breakdown[k];
        const h = Math.max(2, Math.round((v / 20) * 24));
        const fill = componentBarColor(v);
        return (
          <div
            key={k}
            title={`${k}: ${formatScoreOneDecimal(v)}`}
            className="w-[6px] shrink-0 rounded-sm"
            style={{ height: h, backgroundColor: fill }}
          />
        );
      })}
    </div>
  );
}
