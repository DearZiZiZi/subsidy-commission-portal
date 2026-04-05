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

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #E8EAED",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "var(--font-inter), system-ui, sans-serif",
} as const;

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
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#F2F2F7" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fill: "#8E8E93", fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: "#8E8E93", fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="applications"
            stroke="#5856D6"
            strokeWidth={2}
            dot={{ r: 3, fill: "#5856D6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
