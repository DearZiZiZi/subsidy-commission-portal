import * as XLSX from "xlsx";
import type { CommissionApplicant } from "@/types/scoring";
import { COMPONENT_KEYS } from "@/types/scoring";
import { getTier } from "@/lib/score-utils";

export function downloadShortlistXlsx(items: CommissionApplicant[]): void {
  const sorted = [...items].sort((a, b) => b.final_score_100 - a.final_score_100);
  const header = [
    "Ранг",
    "ID заявителя",
    "Направление",
    "Область",
    "Сумма",
    "Итоговый балл",
    "Уровень",
    ...COMPONENT_KEYS,
    "Доп. проверка",
  ];
  const rows = sorted.map((row, idx) => [
    idx + 1,
    row.applicant_id,
    row.direction,
    row.region,
    row.requested_amount,
    row.final_score_100,
    getTier(row.final_score_100),
    ...COMPONENT_KEYS.map((k) => row.component_breakdown[k]),
    row.needsReview ? "Да" : "Нет",
  ]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Shortlist");
  XLSX.writeFile(wb, `shortlist-${Date.now()}.xlsx`);
}

export function downloadBatchResultsXlsx(
  results: Array<{
    applicant_id: string;
    final_score_100?: number;
    error?: string;
  }>
): void {
  const header = ["applicant_id", "final_score_100", "error"];
  const rows = results.map((r) => [
    r.applicant_id,
    r.final_score_100 ?? "",
    r.error ?? "",
  ]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  XLSX.writeFile(wb, `batch-results-${Date.now()}.xlsx`);
}
