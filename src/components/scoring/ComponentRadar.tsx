"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ComponentBreakdown } from "@/types/scoring";
import { COMPONENT_KEYS } from "@/types/scoring";
import { useMemo } from "react";
import { useMounted } from "@/hooks/useMounted";
import { Skeleton } from "@/components/ui/Skeleton";

const LABELS_RU: Record<string, string> = {
  "Стратегический приоритет (Госплан)": "Госплан",
  "Технологический уровень заявки": "Технологии",
  "Масштаб производства (Поголовье)": "Масштаб",
  "Надежность заявителя (по 2025)": "Надёжность",
  "Региональная специализация": "Регион",
};

export function ComponentRadar({
  breakdown,
  className,
}: {
  breakdown: ComponentBreakdown;
  className?: string;
}) {
  const mounted = useMounted();
  const data = useMemo(
    () =>
      COMPONENT_KEYS.map((k) => ({
        metric: LABELS_RU[k] ?? k,
        full: k,
        value: breakdown[k],
        max: 20,
      })),
    [breakdown]
  );

  if (!mounted) {
    return <Skeleton className={className} style={{ height: 280, width: "100%" }} />;
  }

  return (
    <div className={className} style={{ width: "100%", height: 280, minWidth: 0 }}>
      <ResponsiveContainer>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(148,163,184,0.35)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
          />
          <Tooltip
            formatter={(v) => [`${Number(v ?? 0).toFixed(1)}`, "балл"]}
            labelFormatter={(_, payload) =>
              (payload?.[0]?.payload as { full?: string })?.full ?? ""
            }
          />
          <Radar
            name="Баллы"
            dataKey="value"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.25}
            strokeWidth={2}
            dot={{ r: 3, fill: "#fbbf24" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
