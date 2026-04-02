"use client";

import { CheckCircle2, AlertTriangle, AlertOctagon, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTier, tierColorClass } from "@/lib/score-utils";
import type { ScoreTier } from "@/types/scoring";
import type { Lang } from "@/lib/i18n-dict";

export function ScoreTierBadge({
  score,
  lang,
  className,
}: {
  score: number;
  lang: Lang;
  className?: string;
}) {
  const tier = getTier(score);
  const Icon =
    tier === "recommended"
      ? CheckCircle2
      : tier === "review"
        ? AlertTriangle
        : tier === "verify"
          ? AlertOctagon
          : XCircle;

  const labelRu: Record<ScoreTier, string> = {
    recommended: "РЕКОМЕНДОВАНО",
    review: "НА РАССМОТРЕНИИ",
    verify: "ТРЕБУЕТ ПРОВЕРКИ",
    low: "НИЗКИЙ ПРИОРИТЕТ",
  };
  const labelKk: Record<ScoreTier, string> = {
    recommended: "ҰСЫНЫЛАДЫ",
    review: "ҚАРАЛУДА",
    verify: "ТЕКСЕРУДІ ҚАЖЕТ",
    low: "ТӨМЕН БАСЫМДЫЛЫҚ",
  };
  const label = lang === "kk" ? labelKk[tier] : labelRu[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        tierColorClass(tier),
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
}
