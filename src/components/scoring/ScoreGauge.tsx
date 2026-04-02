"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatScoreOneDecimal, getTier, tierHex } from "@/lib/score-utils";
import type { ScoreTier } from "@/types/scoring";

const R = 88;
const STROKE = 14;
const C = 2 * Math.PI * R;

export function ScoreGauge({
  score,
  className,
  tierOverride,
}: {
  score: number;
  className?: string;
  tierOverride?: ScoreTier;
}) {
  const tier = tierOverride ?? getTier(score);
  const color = tierHex(tier);
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const offset = C * (1 - progress);

  const label = useMemo(() => {
    switch (tier) {
      case "recommended":
        return "80–100";
      case "review":
        return "60–79";
      case "verify":
        return "40–59";
      default:
        return "0–39";
    }
  }, [tier]);

  return (
    <div
      className={cn("relative flex flex-col items-center justify-center", className)}
    >
      <svg
        width={220}
        height={220}
        viewBox="0 0 220 220"
        className="drop-shadow-lg"
        aria-hidden
      >
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity={0.85} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
        </defs>
        <circle
          cx={110}
          cy={110}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          className="text-border opacity-40"
        />
        <motion.circle
          cx={110}
          cy={110}
          r={R}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          transform="rotate(-90 110 110)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          className="font-mono text-5xl font-semibold tracking-tight text-foreground"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {formatScoreOneDecimal(score)}
        </motion.span>
        <span className="mt-1 font-mono text-xs text-muted">/ 100</span>
        <span
          className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted"
          style={{ color }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
