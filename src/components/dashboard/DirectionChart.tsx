"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
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

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #E8EAED",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "var(--font-inter), system-ui, sans-serif",
} as const;

export function DirectionChart({ rows }: { rows: ApplicantPortfolioRow[] }) {
  const mounted = useMounted();
  const { t } = useI18n();
  const data = useMemo(() => {
    const map = new Map<string, { sum: number; n: number }>();
    for (const r of rows) {
      const cur = map.get(r.direction) ?? { sum: 0, n: 0 };
      cur.sum += r.final_score_100;
      cur.n += 1;
      map.set(r.direction, cur);
    }
    return Array.from(map.entries())
      .map(([name, { sum, n }]) => ({
        name: name.replace("Субсидирование ", "").slice(0, 28),
        avg: Math.round((sum / n) * 10) / 10,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-[12px] border border-dashed border-[#E8EAED] text-sm text-[#8E8E93]">
        {t("empty_charts")}
      </div>
    );
  }

  if (!mounted) {
    return <Skeleton className="h-[320px] w-full rounded-lg" />;
  }

  return (
    <div className="min-h-[320px] w-full min-w-0 rounded-[12px] bg-white" style={{ height: 320 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <CartesianGrid stroke="#F2F2F7" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#8E8E93", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fill: "#8E8E93", fontSize: 11 }}
          />
          <Tooltip
            formatter={(v) => [`${Number(v ?? 0).toFixed(1)}`, "средний балл"]}
            contentStyle={tooltipStyle}
          />
          <Bar dataKey="avg" fill="#007AFF" radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
