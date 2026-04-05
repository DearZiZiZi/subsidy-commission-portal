"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { KPICard } from "@/components/dashboard/KPICard";
import { ScoreDistribution } from "@/components/dashboard/ScoreDistribution";
import { DirectionChart } from "@/components/dashboard/DirectionChart";
import { RegionalGrid } from "@/components/dashboard/RegionalGrid";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { getDashboardDataset } from "@/data/sample-results";
import { useI18n } from "@/providers/i18n-provider";
import { motion } from "framer-motion";
import { computePortfolioKpis, formatBillionsKZT } from "@/lib/score-utils";
import { ArrowRight, FileText, Gauge, Layers } from "lucide-react";

export default function DashboardPage() {
  const { t } = useI18n();
  const rows = useMemo(() => getDashboardDataset(), []);

  const kpis = useMemo(() => computePortfolioKpis(rows), [rows]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1C1C1E]">
          {t("nav_dashboard")}
        </h1>
        <p className="mt-1 text-sm text-[#8E8E93]">{t("dashboard_subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title={t("kpi_applications")}
          value={kpis.n}
          dotClassName="bg-[#007AFF]"
        />
        <KPICard
          title={t("kpi_amount")}
          valueText={formatBillionsKZT(kpis.totalAmount)}
          dotClassName="bg-[#34C759]"
        />
        <KPICard
          title={t("kpi_avg_score")}
          value={kpis.avgScore}
          decimals={1}
          dotClassName="bg-[#5856D6]"
        />
        <KPICard
          title={t("kpi_forecast")}
          value={kpis.forecastAbove60Pct}
          decimals={1}
          suffix="%"
          dotClassName="bg-[#FF9500]"
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
          <CardTitle>{t("scoring_how_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2F2F7] text-[#1C1C1E]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#8E8E93]">1</p>
                <p className="text-sm font-medium text-[#1C1C1E]">
                  {t("scoring_step_1")}
                </p>
              </div>
            </div>
            <ArrowRight className="hidden h-5 w-5 shrink-0 text-[#C7C7CC] sm:block" />
            <div className="flex flex-1 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2F2F7] text-[#1C1C1E]">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#8E8E93]">2</p>
                <p className="text-sm font-medium text-[#1C1C1E]">
                  {t("scoring_step_2")}
                </p>
              </div>
            </div>
            <ArrowRight className="hidden h-5 w-5 shrink-0 text-[#C7C7CC] sm:block" />
            <div className="flex flex-1 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2F2F7] text-[#1C1C1E]">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#8E8E93]">3</p>
                <p className="text-sm font-medium text-[#1C1C1E]">
                  {t("scoring_step_3")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("legend_title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p className="flex items-center gap-2 text-[#3C3C43]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#34C759]" />
            {t("legend_tier_rec")}
          </p>
          <p className="flex items-center gap-2 text-[#3C3C43]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF9500]" />
            {t("legend_tier_rev")}
          </p>
          <p className="flex items-center gap-2 text-[#3C3C43]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#F57F17]" />
            {t("legend_tier_ver")}
          </p>
          <p className="flex items-center gap-2 text-[#3C3C43]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF3B30]" />
            {t("legend_tier_low")}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
