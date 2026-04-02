"use client";

import {
  Bar,
  BarChart,
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
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
        {t("empty_charts")}
      </div>
    );
  }

  if (!mounted) {
    return <Skeleton className="h-[320px] w-full rounded-lg" />;
  }

  return (
    <div className="min-h-[320px] w-full min-w-0" style={{ height: 320 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fill: "var(--muted)", fontSize: 10 }}
          />
          <Tooltip
            formatter={(v) => [
              `${Number(v ?? 0).toFixed(1)}`,
              "средний балл",
            ]}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          />
          <Bar dataKey="avg" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
