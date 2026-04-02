"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { KPICard } from "@/components/dashboard/KPICard";
import { ScoreDistribution } from "@/components/dashboard/ScoreDistribution";
import { DirectionChart } from "@/components/dashboard/DirectionChart";
import { RegionalGrid } from "@/components/dashboard/RegionalGrid";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";

import { getDashboardDataset, PORTFOLIO_STATS } from "@/data/sample-results";
import { useI18n } from "@/providers/i18n-provider";
import { isDemoMode } from "@/lib/api";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { t } = useI18n();
  const rows = useMemo(() => getDashboardDataset(), []);

  const kpis = useMemo(() => {
    const n = PORTFOLIO_STATS.rowCount;
    const sumAmt = PORTFOLIO_STATS.totalAmount;
    const avg = PORTFOLIO_STATS.avgScore;
    const forecast = PORTFOLIO_STATS.forecastAbove60Pct;
    return {
      n,
      sumAmt,
      avg,
      forecast,
      billions: sumAmt / 1_000_000_000,
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {isDemoMode() && (
        <div className="rounded-lg border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-center text-xs text-foreground">
          {t("demo_banner")}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("nav_dashboard")}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Полный портфель: {PORTFOLIO_STATS.rowCount.toLocaleString("ru-RU")} успешных
          заявок за 2025–2026 гг.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard title={t("kpi_applications")} value={kpis.n} />
        <KPICard
          title={t("kpi_amount")}
          value={kpis.billions}
          decimals={2}
          suffix="млрд ₸"
          mono
        />
        <KPICard title={t("kpi_avg_score")} value={kpis.avg} decimals={1} mono />
        <KPICard
          title={t("kpi_forecast")}
          value={kpis.forecast}
          decimals={1}
          suffix="%"
          mono
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("chart_score_dist")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreDistribution rows={rows} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("chart_directions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <DirectionChart rows={rows} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("chart_regions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RegionalGrid rows={rows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("chart_monthly")}</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyChart rows={rows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("legend_title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="inline-block h-2 w-2 rounded-full bg-score-green" />{" "}
            80–100: РЕКОМЕНДОВАНО
          </p>
          <p>
            <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />{" "}
            60–79: НА РАССМОТРЕНИИ
          </p>
          <p>
            <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />{" "}
            40–59: ТРЕБУЕТ ПРОВЕРКИ
          </p>
          <p>
            <span className="inline-block h-2 w-2 rounded-full bg-score-red" />{" "}
            0–39: НИЗКИЙ ПРИОРИТЕТ
          </p>
        </CardContent>
      </Card>

    </motion.div>
  );
}
