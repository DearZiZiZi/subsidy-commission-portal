import {
  COMPONENT_KEYS,
  type ApplicantPortfolioRow,
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

/** Цвет полосы компонента: ≥16 зелёный, ≥10 янтарь, иначе красный */
export function componentBarColor(value: number): string {
  if (value >= 16) return "#34C759";
  if (value >= 10) return "#FF9500";
  return "#FF3B30";
}

export function tierColorClass(tier: ScoreTier): string {
  switch (tier) {
    case "recommended":
      return "bg-[#E8F5E9] text-[#1B5E20]";
    case "review":
      return "bg-[#FFF3E0] text-[#E65100]";
    case "verify":
      return "bg-[#FFF8E1] text-[#F57F17]";
    default:
      return "bg-[#FFEBEE] text-[#B71C1C]";
  }
}

export function tierHex(tier: ScoreTier): string {
  switch (tier) {
    case "recommended":
      return "#34C759";
    case "review":
      return "#FF9500";
    case "verify":
      return "#FF9500";
    default:
      return "#FF3B30";
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

export function computePortfolioKpis(rows: ApplicantPortfolioRow[]): {
  n: number;
  totalAmount: number;
  avgScore: number;
  forecastAbove60Pct: number;
  billions: number;
} {
  const n = rows.length;
  if (n === 0) {
    return {
      n: 0,
      totalAmount: 0,
      avgScore: 0,
      forecastAbove60Pct: 0,
      billions: 0,
    };
  }
  let totalAmount = 0;
  let sumScore = 0;
  let above60 = 0;
  for (let i = 0; i < n; i++) {
    const r = rows[i];
    totalAmount += r.requested_amount;
    sumScore += r.final_score_100;
    if (r.final_score_100 > 60) above60 += 1;
  }
  return {
    n,
    totalAmount,
    avgScore: Math.round((sumScore / n) * 1000) / 1000,
    forecastAbove60Pct: Math.round((above60 / n) * 10000) / 100,
    billions: totalAmount / 1_000_000_000,
  };
}
