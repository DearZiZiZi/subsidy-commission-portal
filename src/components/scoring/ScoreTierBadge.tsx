"use client";

import { cn } from "@/lib/utils";
import { getTier, tierColorClass } from "@/lib/score-utils";
import type { ScoreTier } from "@/types/scoring";
import { useI18n } from "@/providers/i18n-provider";

const TIER_KEYS: Record<ScoreTier, string> = {
  recommended: "tier_recommended",
  review: "tier_review",
  verify: "tier_verify",
  low: "tier_low",
};

export function ScoreTierBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const { t } = useI18n();
  const tier = getTier(score);
  const label = t(TIER_KEYS[tier]);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[20px] px-2.5 py-[3px] text-[11px] font-medium tracking-normal",
        tierColorClass(tier),
        className
      )}
    >
      {label}
    </span>
  );
}
