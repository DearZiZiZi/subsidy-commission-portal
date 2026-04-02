"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ApplicantPortfolioRow } from "@/types/scoring";
import { useMemo } from "react";
import { MONTHS_RU } from "@/data/months";
import { useI18n } from "@/providers/i18n-provider";
import { useMounted } from "@/hooks/useMounted";
import { Skeleton } from "@/components/ui/Skeleton";

export function MonthlyChart({ rows }: { rows: ApplicantPortfolioRow[] }) {
  const mounted = useMounted();
  const { t } = useI18n();
  const data = useMemo(() => {
    const counts = Array.from({ length: 12 }, () => 0);
    for (const r of rows) {
      if (r.month >= 1 && r.month <= 12) counts[r.month - 1] += 1;
    }
    return counts.map((c, i) => ({
      month: MONTHS_RU[i]?.slice(0, 3) ?? String(i + 1),
      applications: c,
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
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          />
          <Line
            type="monotone"
            dataKey="applications"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3, fill: "#fbbf24" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
