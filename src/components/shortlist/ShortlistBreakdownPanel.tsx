"use client";

import { useMemo } from "react";
import type { ApplicantPortfolioRow } from "@/types/scoring";
import { COMPONENT_KEYS } from "@/types/scoring";
import {
  componentBarColor,
  formatScoreOneDecimal,
  getTier,
  tierHex,
} from "@/lib/score-utils";
import { ComponentRadar } from "@/components/scoring/ComponentRadar";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

function splitExplanation(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ShortlistBreakdownPanel({ row }: { row: ApplicantPortfolioRow }) {
  const { t } = useI18n();
  const tier = getTier(row.final_score_100);
  const color = tierHex(tier);

  const topTwo = useMemo(() => {
    const entries = COMPONENT_KEYS.map((k) => [k, row.component_breakdown[k]] as const);
    return [...entries].sort((a, b) => b[1] - a[1]).slice(0, 2);
  }, [row.component_breakdown]);

  const bullets = useMemo(() => splitExplanation(row.explanation), [row.explanation]);

  return (
    <div className="grid gap-8 rounded-[12px] border border-border bg-accent p-5 lg:grid-cols-[3fr_2fr]">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {t("breakdown_title")}
        </h3>
        <div className="mt-4 space-y-4">
          {COMPONENT_KEYS.map((key) => {
            const v = row.component_breakdown[key];
            const pct = (v / 20) * 100;
            const fill = componentBarColor(v);
            return (
              <div key={key}>
                <div className="mb-1 flex justify-between gap-3 text-xs">
                  <span className="leading-snug text-muted-fg">{key}</span>
                  <span className="shrink-0 font-semibold tabular-nums tracking-tight text-foreground">
                    {formatScoreOneDecimal(v)}/20
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-background/50 dark:bg-card">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: fill }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <ul className="mt-5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-fg">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center gap-4 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        <div className="w-full max-w-[200px]">
          <ComponentRadar breakdown={row.component_breakdown} compact />
        </div>
        <div
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold tabular-nums tracking-tight text-white shadow-card"
          )}
          style={{ backgroundColor: color }}
        >
          {formatScoreOneDecimal(row.final_score_100)}
        </div>
        <div className="w-full text-sm">
          <p className="font-medium text-muted-fg">{t("strong_sides")}</p>
          <ul className="mt-2 space-y-1 text-foreground">
            {topTwo.map(([k, val]) => (
              <li key={k}>
                <span className="font-medium">{k}</span>
                <span className="text-muted-fg"> — </span>
                <span className="tabular-nums font-semibold text-ios-purple">
                  {formatScoreOneDecimal(val)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
