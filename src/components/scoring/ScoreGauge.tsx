"use client";

import { motion, animate } from "framer-motion";
import { useEffect, useState } from "react";
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
  animateKey,
}: {
  score: number;
  className?: string;
  tierOverride?: ScoreTier;
  /** Смена ключа перезапускает анимацию с 0 */
  animateKey?: string | number;
}) {
  const tier = tierOverride ?? getTier(score);
  const color = tierHex(tier);
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const offset = C * (1 - progress);

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const c = animate(0, score, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayScore(Number(latest.toFixed(1))),
    });
    return () => c.stop();
  }, [score, animateKey]);

  const label =
    tier === "recommended"
      ? "80–100"
      : tier === "review"
        ? "60–79"
        : tier === "verify"
          ? "40–59"
          : "0–39";

  return (
    <div
      className={cn("relative flex flex-col items-center justify-center", className)}
    >
      <svg
        width={220}
        height={220}
        viewBox="0 0 220 220"
        className="text-border"
        aria-hidden
      >
        <circle
          cx={110}
          cy={110}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
        />
        <motion.circle
          key={`${animateKey ?? "x"}-${score}`}
          cx={110}
          cy={110}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          transform="rotate(-90 110 110)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
          {formatScoreOneDecimal(displayScore)}
        </span>
        <span className="mt-1 text-xs tabular-nums text-muted-fg">/ 100</span>
        <span
          className="mt-2 text-[10px] font-medium uppercase tracking-wide text-muted-fg"
          style={{ color }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
