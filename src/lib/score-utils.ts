import {
  COMPONENT_KEYS,
  type ComponentBreakdown,
  type ScoreTier,
} from "@/types/scoring";

export function formatKZT(amount: number): string {
  const rounded = Math.round(amount);
  const s = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const sign = rounded < 0 ? "−" : "";
  return `${sign}${s} ₸`;
}

export function formatBillionsKZT(amount: number): string {
  const b = amount / 1_000_000_000;
  return `${b.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} млрд ₸`;
}

export function formatScoreOneDecimal(score: number): string {
  return score.toFixed(1);
}

export function getTier(score: number): ScoreTier {
  if (score >= 80) return "recommended";
  if (score >= 60) return "review";
  if (score >= 40) return "verify";
  return "low";
}

export function tierColorClass(tier: ScoreTier): string {
  switch (tier) {
    case "recommended":
      return "text-score-green bg-score-green/15 border-score-green/40";
    case "review":
      return "text-yellow-500 bg-yellow-500/15 border-yellow-500/40";
    case "verify":
      return "text-orange-500 bg-orange-500/15 border-orange-500/40";
    default:
      return "text-score-red bg-score-red/15 border-score-red/40";
  }
}

export function tierHex(tier: ScoreTier): string {
  switch (tier) {
    case "recommended":
      return "#22c55e";
    case "review":
      return "#eab308";
    case "verify":
      return "#f97316";
    default:
      return "#ef4444";
  }
}

export function buildBreakdown(
  strategic: number,
  tech: number,
  scale: number,
  reliability: number,
  region: number
): ComponentBreakdown {
  const r = (n: number) => Math.round(n * 10) / 10;
  return {
    "Стратегический приоритет (Госплан)": r(strategic),
    "Технологический уровень заявки": r(tech),
    "Масштаб производства (Поголовье)": r(scale),
    "Надежность заявителя (по 2025)": r(reliability),
    "Региональная специализация": r(region),
  };
}

export function makeExplanation(
  finalScore: number,
  breakdown: ComponentBreakdown
): string {
  const entries = COMPONENT_KEYS.map((k) => [k, breakdown[k]] as const).sort(
    (a, b) => b[1] - a[1]
  );
  const [first, second] = entries;
  return (
    `Итоговый балл: ${finalScore.toFixed(1)}/100. ` +
    `Сильные стороны заявки: ${first[0]} (${first[1].toFixed(1)} баллов) и ${second[0]} (${second[1].toFixed(1)} баллов).`
  );
}

export function orderedComponentValues(breakdown: ComponentBreakdown): number[] {
  return COMPONENT_KEYS.map((k) => breakdown[k]);
}
