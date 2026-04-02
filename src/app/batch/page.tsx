"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CSVUpload } from "@/components/batch/CSVUpload";
import { BatchProgress } from "@/components/batch/BatchProgress";
import { parseApplicantCsv, csvTemplate } from "@/lib/csv";
import { evaluateMeritScore, ApiError } from "@/lib/api";
import { runWithProgress } from "@/lib/batch-queue";
import type { MeritScoreRequest } from "@/types/scoring";
import type { ScoreResult } from "@/types/scoring";
import { formatScoreOneDecimal } from "@/lib/score-utils";
import { downloadBatchResultsXlsx } from "@/lib/excel-export";
import { useI18n } from "@/providers/i18n-provider";
import * as XLSX from "xlsx";

type RowOutcome =
  | { applicant_id: string; final_score_100: number; breakdown: ScoreResult["component_breakdown"] }
  | { applicant_id: string; error: string };

export default function BatchPage() {
  const { t } = useI18n();
  const [preview, setPreview] = useState<string[][]>([]);
  const [rows, setRows] = useState<MeritScoreRequest[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [outcomes, setOutcomes] = useState<(RowOutcome | undefined)[]>([]);

  const onFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = parseApplicantCsv(text);
      const okRows = parsed.filter((p) => p.row).map((p) => p.row as MeritScoreRequest);
      const prev = text.split(/\r?\n/).slice(0, 6).map((l) => l.split(","));
      setPreview(prev);
      setRows(okRows);
      setOutcomes([]);
      setDone(0);
      const bad = parsed.filter((p) => p.error).length;
      if (bad) toast.message(`Пропущено строк с ошибками: ${bad}`);
    };
    reader.readAsText(file);
  }, []);

  async function run() {
    if (rows.length === 0) {
      toast.error("Нет валидных строк");
      return;
    }
    setRunning(true);
    setOutcomes(Array.from({ length: rows.length }, () => undefined));
    setDone(0);
    try {
      await runWithProgress(
        rows,
        10,
        async (req) => {
          try {
            const r = await evaluateMeritScore(req);
            return {
              applicant_id: r.applicant_id,
              final_score_100: r.final_score_100,
              breakdown: r.component_breakdown,
            } satisfies RowOutcome;
          } catch (e) {
            const msg = e instanceof ApiError ? e.message : "Ошибка";
            return {
              applicant_id: req.applicant_id,
              error: msg,
            } satisfies RowOutcome;
          }
        },
        (i, r) => {
          setOutcomes((prev) => {
            const next = [...prev];
            next[i] = r;
            return next;
          });
          setDone((d) => d + 1);
        }
      );
      toast.success("Пакет обработан");
    } finally {
      setRunning(false);
    }
  }

  function downloadCsv() {
    const flat = outcomes.filter((o): o is RowOutcome => o !== undefined);
    const ws = XLSX.utils.json_to_sheet(
      flat.map((o) =>
        "error" in o
          ? { applicant_id: o.applicant_id, final_score_100: "", error: o.error }
          : {
              applicant_id: o.applicant_id,
              final_score_100: o.final_score_100,
              error: "",
            }
      )
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, `batch-${Date.now()}.csv`, { bookType: "csv" });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold tracking-tight">{t("batch_title")}</h1>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const blob = new Blob([csvTemplate()], { type: "text/csv" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "template.csv";
            a.click();
            URL.revokeObjectURL(a.href);
          }}
        >
          {t("batch_template")}
        </Button>
      </div>

      <CSVUpload onFile={onFile} />

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("batch_preview")}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <tbody>
                {preview.map((line, i) => (
                  <tr key={i} className="border-b border-border/60">
                    {line.map((c, j) => (
                      <td key={j} className="px-2 py-1 font-mono">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Button
        type="button"
        size="lg"
        disabled={running || rows.length === 0}
        onClick={run}
      >
        {running ? t("loading") : t("batch_run")}
      </Button>

      {running && (
        <BatchProgress done={done} total={rows.length} />
      )}

      {outcomes.some((o) => o !== undefined) && (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle>Результаты</CardTitle>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={downloadCsv}>
                CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const flat = outcomes.filter((o): o is RowOutcome => o !== undefined);
                  downloadBatchResultsXlsx(
                    flat.map((o) =>
                      "error" in o
                        ? { applicant_id: o.applicant_id, error: o.error }
                        : {
                            applicant_id: o.applicant_id,
                            final_score_100: o.final_score_100,
                          }
                    )
                  );
                }}
              >
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2">ID</th>
                  <th className="py-2">Балл</th>
                  <th className="py-2">Ошибка</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const o = outcomes[i];
                  return (
                    <tr key={row.applicant_id} className="border-b border-border/60">
                      <td className="py-2 font-mono text-xs">{row.applicant_id}</td>
                      <td className="py-2 font-mono">
                        {!o
                          ? "…"
                          : "error" in o
                            ? "—"
                            : formatScoreOneDecimal(o.final_score_100)}
                      </td>
                      <td className="py-2 text-xs text-score-red">
                        {o && "error" in o ? o.error : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
