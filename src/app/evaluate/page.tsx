"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ChevronDown, HelpCircle, Lightbulb } from "lucide-react";
import type { MeritScoreRequest } from "@/types/scoring";
import {
  SUBSIDY_DEMO_PENDING_KEY,
  SUBSIDY_DEMO_TOUR_EVENT,
} from "@/lib/demo-tour";

const DEMO_VALUES: MeritFormValues = {
  applicant_id: "DEMO-JUDGES-2026",
  direction: "Субсидирование в скотоводстве",
  standard: 300,
  subsidy_purpose:
    "Производство и реализация молока, модернизация молочного блока, закупка племенных животных",
  requested_amount: 49_380_000,
  region: "Костанайская область",
  month: 3,
  farm_area: "Узункольский район",
};

function splitExplanation(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const selectClass =
  "flex h-10 w-full appearance-none rounded-lg border border-border bg-card px-[14px] pr-10 text-sm text-foreground shadow-sm focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

export default function EvaluatePage() {
  const { t, lang } = useI18n();
  const addToShortlist = useShortlistStore((s) => s.addToShortlist);
  const isInShortlist = useShortlistStore((s) => s.isInShortlist);
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

  const onSubmit = useCallback(async (values: MeritFormValues) => {
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
      toast.success(t("toast_scoring_ok"));
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : t("error");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  useEffect(() => {
    const run = () => {
      form.reset(DEMO_VALUES);
      window.setTimeout(() => {
        void form.handleSubmit((data) => void onSubmitRef.current(data))();
      }, 400);
    };
    window.addEventListener(SUBSIDY_DEMO_TOUR_EVENT, run);
    return () => window.removeEventListener(SUBSIDY_DEMO_TOUR_EVENT, run);
  }, [form]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SUBSIDY_DEMO_PENDING_KEY) === "1") {
        sessionStorage.removeItem(SUBSIDY_DEMO_PENDING_KEY);
        form.reset(DEMO_VALUES);
        window.setTimeout(() => {
          void form.handleSubmit((data) => void onSubmitRef.current(data))();
        }, 450);
      }
    } catch {
      /* ignore */
    }
  }, [form]);

  const sheepBonus =
    lastReq?.direction === "Субсидирование в овцеводстве" &&
    (lastReq?.month ?? 0) <= 4;
  const highPenalty = (lastReq?.requested_amount ?? 0) >= 100_000_000;
  const baseFromComponents = result
    ? Object.values(result.component_breakdown).reduce((a, b) => a + b, 0)
    : 0;
  const penaltyPoints =
    highPenalty && result ? Math.round(baseFromComponents * 0.1 * 10) / 10 : 0;

  const inList = result ? isInShortlist(result.applicant_id) : false;
  const explainBullets = useMemo(
    () => (result ? splitExplanation(result.explanation) : []),
    [result]
  );

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
            className="space-y-5"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div>
              <label className="text-[13px] font-medium text-muted-fg">
                {t("field_applicant")}
              </label>
              <Input
                className="mt-1 font-mono"
                placeholder={t("field_ph_applicant")}
                {...form.register("applicant_id")}
              />
              {form.formState.errors.applicant_id && (
                <p className="mt-1 text-xs text-[#FF3B30]">
                  {form.formState.errors.applicant_id.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-fg">
                {t("field_direction")}
              </label>
              <div className="relative mt-1">
                <select className={selectClass} {...form.register("direction")}>
                  {DIRECTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg"
                  aria-hidden
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <label className="text-[13px] font-medium text-muted-fg">
                  {t("field_standard")}
                </label>
                <span title={t("field_standard_hint")} className="text-muted-fg">
                  <HelpCircle className="h-3.5 w-3.5" />
                </span>
              </div>
              <Input
                type="number"
                className="mt-1 font-mono"
                placeholder="300"
                {...form.register("standard", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-fg">
                {t("field_purpose")}
              </label>
              <textarea
                className="mt-1 min-h-[88px] w-full rounded-lg border border-border bg-card px-[14px] py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-fg focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                placeholder={t("field_ph_purpose")}
                {...form.register("subsidy_purpose")}
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-fg">
                {t("field_amount")}
              </label>
              <Input
                type="number"
                className="mt-1 font-mono"
                placeholder="2500000"
                {...form.register("requested_amount", { valueAsNumber: true })}
              />
              <p className="mt-1 font-semibold tabular-nums tracking-tight text-[#5856D6]">
                {formatKZT(Number(form.watch("requested_amount") || 0))}
              </p>
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-fg">
                {t("field_region")}
              </label>
              <div className="relative mt-1">
                <select className={selectClass} {...form.register("region")}>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg"
                  aria-hidden
                />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-fg">
                {t("field_month")}
              </label>
              <div className="relative mt-1">
                <select
                  className={selectClass}
                  {...form.register("month", { valueAsNumber: true })}
                >
                  {MONTHS_RU.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg"
                  aria-hidden
                />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-fg">
                {t("field_farm_area")}
              </label>
              <Input
                className="mt-1"
                placeholder={t("field_ph_farm")}
                {...form.register("farm_area")}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-[10px] font-semibold"
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
        <CardContent key={result?.applicant_id ?? "empty"} className="space-y-6">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="mx-auto h-52 w-52 rounded-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {!loading && !result && (
            <p className="text-sm text-muted-fg">{t("evaluate_empty_hint")}</p>
          )}
          {result && !loading && (
            <>
              <div className="flex flex-col items-center gap-4">
                <ScoreGauge
                  score={result.final_score_100}
                  animateKey={result.applicant_id}
                />
                <ScoreTierBadge score={result.final_score_100} />
                <div className="flex flex-wrap justify-center gap-2">
                  {sheepBonus && (
                    <span className="rounded-full border border-[#34C759]/40 bg-[#E8F5E9] px-3 py-1 text-xs text-[#1B5E20]">
                      +7 {t("bonus_season")}
                    </span>
                  )}
                  {highPenalty && (
                    <span className="rounded-full border border-[#FF3B30]/40 bg-[#FFEBEE] px-3 py-1 text-xs text-[#B71C1C]">
                      −{penaltyPoints.toFixed(1)} балл (10% от базы) ·{" "}
                      {t("penalty_risk")}
                    </span>
                  )}
                </div>
              </div>
              <ComponentRadar breakdown={result.component_breakdown} animateIn />
              <ComponentBreakdownTable breakdown={result.component_breakdown} stagger />
              <div className="rounded-[12px] border border-border bg-accent p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Lightbulb className="h-4 w-4 text-ios-orange" aria-hidden />
                  {t("why_score_title")}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-fg">
                  {explainBullets.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="primary"
                  className={
                    inList
                      ? "h-12 w-full rounded-[10px] border-0 bg-[#34C759] font-semibold text-white hover:bg-[#34C759]"
                      : "h-12 w-full rounded-[10px] font-semibold"
                  }
                  disabled={inList}
                  onClick={() => {
                    if (!lastReq || !result) return;
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
                    toast.success(t("toast_added_shortlist"));
                  }}
                >
                  {inList ? t("already_in_shortlist") : `＋ ${t("btn_add_shortlist")}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-[10px]"
                  onClick={() => {
                    void downloadApplicantPdf(
                      result.applicant_id,
                      result.final_score_100,
                      result.explanation,
                      result.component_breakdown as Record<string, number>,
                      lang
                    )
                      .then(() => toast.success(t("toast_pdf_ok")))
                      .catch((e: unknown) =>
                        toast.error(
                          e instanceof Error ? e.message : t("error")
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
