"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { meritFormSchema, type MeritFormValues } from "@/lib/evaluate-schema";
import { evaluateMeritScore, ApiError } from "@/lib/api";
import { DIRECTIONS, REGIONS } from "@/types/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScoreGauge } from "@/components/scoring/ScoreGauge";
import { ComponentRadar } from "@/components/scoring/ComponentRadar";
import { ScoreTierBadge } from "@/components/scoring/ScoreTierBadge";
import { ComponentBreakdownTable } from "@/components/scoring/ComponentBreakdown";
import type { ScoreResult } from "@/types/scoring";
import { useShortlistStore } from "@/store/useShortlistStore";
import { useI18n } from "@/providers/i18n-provider";
import { MONTHS_RU } from "@/data/months";
import { formatKZT } from "@/lib/score-utils";
import { downloadApplicantPdf } from "@/lib/pdf-generator";
import { Skeleton } from "@/components/ui/Skeleton";
import { HelpCircle } from "lucide-react";
import type { MeritScoreRequest } from "@/types/scoring";

export default function EvaluatePage() {
  const { t, lang } = useI18n();
  const addToShortlist = useShortlistStore((s) => s.addToShortlist);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastReq, setLastReq] = useState<MeritScoreRequest | null>(null);

  const form = useForm<MeritFormValues>({
    resolver: zodResolver(meritFormSchema),
    defaultValues: {
      applicant_id: "",
      direction: DIRECTIONS[0],
      standard: 300,
      subsidy_purpose: "Производство и реализация молока и мяса",
      requested_amount: 2_500_000,
      region: "Костанайская область",
      month: 3,
      farm_area: "Узункольский район",
    },
  });

  async function onSubmit(values: MeritFormValues) {
    const body: MeritScoreRequest = {
      applicant_id: values.applicant_id,
      direction: values.direction as MeritScoreRequest["direction"],
      standard: values.standard,
      subsidy_purpose: values.subsidy_purpose,
      requested_amount: values.requested_amount,
      region: values.region as MeritScoreRequest["region"],
      month: values.month,
      farm_area: values.farm_area,
    };
    setLoading(true);
    setResult(null);
    try {
      const res = await evaluateMeritScore(body);
      setResult(res);
      setLastReq(body);
      toast.success("Скоринг выполнен");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Ошибка запроса";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const sheepBonus =
    lastReq?.direction === "Субсидирование в овцеводстве" &&
    (lastReq?.month ?? 0) <= 4;
  const highPenalty = (lastReq?.requested_amount ?? 0) >= 100_000_000;
  const baseFromComponents = result
    ? Object.values(result.component_breakdown).reduce((a, b) => a + b, 0)
    : 0;
  const penaltyPoints =
    highPenalty && result ? Math.round(baseFromComponents * 0.1 * 10) / 10 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-6 xl:grid-cols-2"
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("evaluate_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div>
              <label className="text-xs text-muted">{t("field_applicant")}</label>
              <Input className="mt-1 font-mono" {...form.register("applicant_id")} />
              {form.formState.errors.applicant_id && (
                <p className="mt-1 text-xs text-score-red">
                  {form.formState.errors.applicant_id.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted">{t("field_direction")}</label>
              <select
                className="mt-1 flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
                {...form.register("direction")}
              >
                {DIRECTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <label className="text-xs text-muted">{t("field_standard")}</label>
                <span
                  className="text-muted"
                  title={t("field_standard_hint")}
                  aria-label={t("field_standard_hint")}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </span>
              </div>
              <Input
                type="number"
                className="mt-1 font-mono"
                {...form.register("standard", {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div>
              <label className="text-xs text-muted">{t("field_purpose")}</label>
              <textarea
                className="mt-1 min-h-[88px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                {...form.register("subsidy_purpose")}
              />
            </div>
            <div>
              <label className="text-xs text-muted">{t("field_amount")}</label>
              <Input
                type="number"
                className="mt-1 font-mono"
                {...form.register("requested_amount", { valueAsNumber: true })}
              />
              <p className="mt-1 font-mono text-xs text-muted">
                {formatKZT(Number(form.watch("requested_amount") || 0))}
              </p>
            </div>
            <div>
              <label className="text-xs text-muted">{t("field_region")}</label>
              <select
                className="mt-1 flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
                {...form.register("region")}
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted">{t("field_month")}</label>
              <select
                className="mt-1 flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
                {...form.register("month", { valueAsNumber: true })}
              >
                {MONTHS_RU.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted">{t("field_farm_area")}</label>
              <Input className="mt-1" {...form.register("farm_area")} />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? t("loading") : t("evaluate_submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("evaluate_result")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="mx-auto h-52 w-52 rounded-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {!loading && !result && (
            <p className="text-sm text-muted">
              Заполните форму и нажмите «{t("evaluate_submit")}».
            </p>
          )}
          {result && !loading && (
            <>
              <div className="flex flex-col items-center gap-4">
                <ScoreGauge score={result.final_score_100} />
                <ScoreTierBadge score={result.final_score_100} lang={lang} />
                <div className="flex flex-wrap justify-center gap-2">
                  {sheepBonus && (
                    <span className="rounded-full border border-score-green/50 bg-score-green/10 px-3 py-1 text-xs text-score-green">
                      +7 {t("bonus_season")}
                    </span>
                  )}
                  {highPenalty && (
                    <span className="rounded-full border border-score-red/50 bg-score-red/10 px-3 py-1 text-xs text-score-red">
                      −{penaltyPoints.toFixed(1)} балл (10% от базы) · {t("penalty_risk")}
                    </span>
                  )}
                </div>
              </div>
              <ComponentRadar breakdown={result.component_breakdown} />
              <ComponentBreakdownTable breakdown={result.component_breakdown} />
              <div className="rounded-lg border border-border bg-card/80 p-4 text-sm leading-relaxed">
                {result.explanation}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (!lastReq) return;
                    addToShortlist({
                      applicant_id: result.applicant_id,
                      direction: lastReq.direction,
                      region: lastReq.region,
                      requested_amount: lastReq.requested_amount,
                      month: lastReq.month,
                      farm_area: lastReq.farm_area,
                      standard: lastReq.standard,
                      subsidy_purpose: lastReq.subsidy_purpose,
                      final_score_100: result.final_score_100,
                      explanation: result.explanation,
                      component_breakdown: result.component_breakdown,
                    });
                    toast.success("Добавлено в шортлист");
                  }}
                >
                  {t("add_shortlist")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void downloadApplicantPdf(
                      result.applicant_id,
                      result.final_score_100,
                      result.explanation,
                      result.component_breakdown as Record<string, number>,
                      lang
                    )
                      .then(() => toast.success("PDF сохранён"))
                      .catch((e: unknown) =>
                        toast.error(
                          e instanceof Error ? e.message : "Ошибка экспорта PDF"
                        )
                      );
                  }}
                >
                  {t("export_pdf")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
