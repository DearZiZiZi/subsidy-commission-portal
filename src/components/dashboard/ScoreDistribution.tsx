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

const COLORS = ["#FF3B30", "#FF9500", "#FF9500", "#007AFF", "#34C759"];

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #E8EAED",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "var(--font-inter), system-ui, sans-serif",
} as const;

export function ScoreDistribution({ rows }: { rows: ApplicantPortfolioRow[] }) {
  const mounted = useMounted();
  const { t } = useI18n();
  const data = useMemo(() => {
    const counts = BUCKETS.map(() => 0);
    for (const r of rows) {
      const s = r.final_score_100;
      const idx = s <= 20 ? 0 : s <= 40 ? 1 : s <= 60 ? 2 : s <= 80 ? 3 : 4;
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
      <div className="flex h-64 items-center justify-center rounded-[12px] border border-dashed border-[#E8EAED] text-sm text-[#8E8E93]">
        {t("empty_charts")}
      </div>
    );
  }

  if (!mounted) {
    return <Skeleton className="h-[280px] w-full rounded-lg" />;
  }

  return (
    <div className="min-h-[280px] w-full min-w-0 rounded-[12px] bg-white" style={{ height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#F2F2F7" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#8E8E93", fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: "#8E8E93", fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`c-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
