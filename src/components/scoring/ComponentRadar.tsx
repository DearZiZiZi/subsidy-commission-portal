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
import { motion } from "framer-motion";

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
  compact,
  animateIn,
}: {
  breakdown: ComponentBreakdown;
  className?: string;
  /** Компактный радар (~180px) для шортлиста */
  compact?: boolean;
  /** Плавное появление (страница оценки) */
  animateIn?: boolean;
}) {
  const mounted = useMounted();
  const height = compact ? 180 : 280;
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
    return (
      <Skeleton className={className} style={{ height, width: "100%" }} />
    );
  }

  const chart = (
    <ResponsiveContainer>
      <RadarChart
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={compact ? "70%" : "75%"}
      >
        <PolarGrid stroke="#F2F2F7" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: "#8E8E93", fontSize: compact ? 9 : 11 }}
        />
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #E8EAED",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
          }}
          formatter={(v) => [`${Number(v ?? 0).toFixed(1)}`, "балл"]}
          labelFormatter={(_, payload) =>
            (payload?.[0]?.payload as { full?: string })?.full ?? ""
          }
        />
        <Radar
          name="Баллы"
          dataKey="value"
          stroke="#5856D6"
          fill="#5856D6"
          fillOpacity={0.22}
          strokeWidth={2}
          dot={{ r: compact ? 2 : 3, fill: "#5856D6" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );

  return (
    <div className={className} style={{ width: "100%", height, minWidth: 0 }}>
      {animateIn ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.45 }}
          className="h-full w-full"
        >
          {chart}
        </motion.div>
      ) : (
        chart
      )}
    </div>
  );
}
