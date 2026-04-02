import type { Direction, MeritScoreRequest, Region } from "@/types/scoring";
import { DIRECTIONS, REGIONS } from "@/types/scoring";

const dirSet = new Set<string>(DIRECTIONS);
const regSet = new Set<string>(REGIONS);

function parseLine(line: string): string[] {
  return line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
}

export interface CsvRowResult {
  row: MeritScoreRequest | null;
  error: string | null;
  lineIndex: number;
}

export function parseApplicantCsv(text: string): CsvRowResult[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = parseLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/^\uFEFF/, "")
  );
  const col = (name: string) => header.indexOf(name);

  const results: CsvRowResult[] = [];
  for (let li = 1; li < lines.length; li++) {
    const cells = parseLine(lines[li]);
    const err = (msg: string): CsvRowResult => ({
      row: null,
      error: msg,
      lineIndex: li + 1,
    });

    try {
      const applicant_id = cells[col("applicant_id")] ?? "";
      const direction = cells[col("direction")] ?? "";
      const standard = Number(cells[col("standard")] ?? NaN);
      const subsidy_purpose = cells[col("subsidy_purpose")] ?? "";
      const requested_amount = Number(cells[col("requested_amount")] ?? NaN);
      const region = cells[col("region")] ?? "";
      const month = Number(cells[col("month")] ?? NaN);
      const farm_area = cells[col("farm_area")] ?? "";

      if (col("applicant_id") < 0) {
        results.push(err("Отсутствует колонка applicant_id в заголовке"));
        break;
      }

      if (!applicant_id) {
        results.push(err("Пустой applicant_id"));
        continue;
      }
      if (!dirSet.has(direction)) {
        results.push(err(`Недопустимое direction: ${direction}`));
        continue;
      }
      if (!regSet.has(region)) {
        results.push(err(`Недопустимое region: ${region}`));
        continue;
      }
      if (!Number.isFinite(standard) || standard <= 0) {
        results.push(err("Некорректный standard"));
        continue;
      }
      if (!Number.isFinite(requested_amount) || requested_amount < 0) {
        results.push(err("Некорректный requested_amount"));
        continue;
      }
      if (!Number.isFinite(month) || month < 1 || month > 12) {
        results.push(err("Некорректный month"));
        continue;
      }
      if (!subsidy_purpose.trim()) {
        results.push(err("Пустой subsidy_purpose"));
        continue;
      }
      if (!farm_area.trim()) {
        results.push(err("Пустой farm_area"));
        continue;
      }

      results.push({
        row: {
          applicant_id,
          direction: direction as Direction,
          standard: Math.round(standard),
          subsidy_purpose,
          requested_amount: Math.round(requested_amount),
          region: region as Region,
          month: Math.round(month),
          farm_area,
        },
        error: null,
        lineIndex: li + 1,
      });
    } catch {
      results.push({
        row: null,
        error: "Не удалось разобрать строку",
        lineIndex: li + 1,
      });
    }
  }
  return results;
}

export function csvTemplate(): string {
  const header =
    "applicant_id,direction,standard,subsidy_purpose,requested_amount,region,month,farm_area";
  const example = [
    "02200100000001",
    "Субсидирование в скотоводстве",
    "300",
    "Производство и реализация молока",
    "2500000",
    "Костанайская область",
    "3",
    "Узункольский район",
  ].join(",");
  return `${header}\n${example}`;
}
