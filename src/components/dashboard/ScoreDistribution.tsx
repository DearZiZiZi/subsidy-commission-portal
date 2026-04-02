"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ApplicantPortfolioRow } from "@/types/scoring";
import { useMemo } from "react";
import { useI18n } from "@/providers/i18n-provider";
import { useMounted } from "@/hooks/useMounted";
import { Skeleton } from "@/components/ui/Skeleton";

const BUCKETS = [
  { label: "0–20", min: 0, max: 20 },
  { label: "20–40", min: 20, max: 40 },
  { label: "40–60", min: 40, max: 60 },
  { label: "60–80", min: 60, max: 80 },
  { label: "80–100", min: 80, max: 100 },
];

const COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

export function ScoreDistribution({ rows }: { rows: ApplicantPortfolioRow[] }) {
  const mounted = useMounted();
  const { t } = useI18n();
  const data = useMemo(() => {
    const counts = BUCKETS.map(() => 0);
    for (const r of rows) {
      const s = r.final_score_100;
      const idx =
        s <= 20 ? 0 : s <= 40 ? 1 : s <= 60 ? 2 : s <= 80 ? 3 : 4;
      counts[idx] += 1;
    }
    return BUCKETS.map((b, i) => ({
      name: b.label,
      count: counts[i],
      fill: COLORS[i],
    }));
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
        {t("empty_charts")}
      </div>
    );
  }

  if (!mounted) {
    return <Skeleton className="h-[280px] w-full rounded-lg" />;
  }

  return (
    <div className="min-h-[280px] w-full min-w-0" style={{ height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`c-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
