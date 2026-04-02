/**
 * Читает data/applications-portfolio.csv и генерирует:
 *   src/data/portfolio-generated.ts   — ВСЕ строки в компактном формате
 * Запуск: node scripts/ingest-portfolio.mjs
 */
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/* ---------- helpers ---------- */
function parseBreakdown(raw) {
  if (raw == null || raw === "") return null;
  let s = String(raw).trim();
  if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
  s = s.replace(/np\.float64\(([^)]+)\)/g, "$1");
  const out = {};
  const re = /'([^']+)':\s*([\d.]+)/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    out[m[1]] = parseFloat(m[2]);
  }
  return Object.keys(out).length >= 5 ? out : null;
}

const COMP_KEYS = [
  "Стратегический приоритет (Госплан)",
  "Технологический уровень заявки",
  "Масштаб производства (Поголовье)",
  "Надежность заявителя (по 2025)",
  "Региональная специализация",
];

const DIRECTIONS = [
  "Субсидирование в скотоводстве",
  "Субсидирование в овцеводстве",
  "Субсидирование в птицеводстве",
  "Субсидирование в свиноводстве",
  "Субсидирование в верблюдоводстве",
  "Субсидирование в коневодстве",
  "Субсидирование затрат по искусственному осеменению",
  "Субсидирование в пчеловодстве",
  "Субсидирование в козоводстве",
];

const REGIONS = [
  "область Абай",
  "Восточно-Казахстанская область",
  "Жамбылская область",
  "Акмолинская область",
  "Павлодарская область",
  "область Ұлытау",
  "Алматинская область",
  "Кызылординская область",
  "Карагандинская область",
  "область Жетісу",
  "Актюбинская область",
  "Западно-Казахстанская область",
  "Костанайская область",
  "г.Шымкент",
  "Атырауская область",
  "Северо-Казахстанская область",
  "Туркестанская область",
  "Мангистауская область",
];

const DIRECTIONS_SET = new Set(DIRECTIONS);
const REGIONS_SET = new Set(REGIONS);

/* ---------- main ---------- */
function main() {
  const csvPath = path.join(root, "data", "applications-portfolio.csv");
  const text = fs.readFileSync(csvPath, "utf8");
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  // Compact tuple: [id, dirIdx, regIdx, amount, month, score, [5 comp], farmArea, status, receivedAt]
  const tuples = [];
  let totalAmount = 0;
  let sumScore = 0;
  let above60 = 0;

  for (const r of records) {
    const direction = r["направление_водства"]?.trim();
    const region = r["область"]?.trim();
    if (!direction || !DIRECTIONS_SET.has(direction)) continue;
    if (!region || !REGIONS_SET.has(region)) continue;

    const bd = parseBreakdown(r["component_breakdown"]);
    if (!bd) continue;

    const applicant_id = String(r["applicant_id"] ?? r["номер_заявки"] ?? "").trim();
    const final_score_100 = parseFloat(r["final_score_100"]);
    const standard = Math.round(parseFloat(r["норматив"])) || 0;
    const requested_amount = Math.round(parseFloat(r["причитающая_сумма"]));
    const month = parseInt(r["month"], 10);
    const farm_area = String(r["район_хозяйства"] ?? "").trim();
    const status = r["статус_заявки"]?.trim() || "";
    const receivedAt = r["дата_поступления"]?.trim() || "";

    if (!applicant_id || Number.isNaN(final_score_100)) continue;

    totalAmount += requested_amount;
    sumScore += final_score_100;
    if (final_score_100 > 60) above60 += 1;

    const dirIdx = DIRECTIONS.indexOf(direction);
    const regIdx = REGIONS.indexOf(region);
    const comps = COMP_KEYS.map((k) => Math.round((bd[k] ?? 0) * 10) / 10);
    const score = Math.round(final_score_100 * 10) / 10;

    // tuple: [id, dirIdx, regIdx, amount, month, score, comps, farmArea, standard, status, receivedAt]
    tuples.push([applicant_id, dirIdx, regIdx, requested_amount, month, score, comps, farm_area, standard, status, receivedAt]);
  }

  const n = tuples.length;
  const stats = {
    rowCount: n,
    totalAmount,
    avgScore: n > 0 ? Math.round((sumScore / n) * 1000) / 1000 : 0,
    forecastAbove60Pct: n > 0 ? Math.round((above60 / n) * 10000) / 100 : 0,
  };

  const tuplesJson = JSON.stringify(tuples);

  const out = `/* eslint-disable */
/**
 * Автогенерация: node scripts/ingest-portfolio.mjs
 * Источник: data/applications-portfolio.csv (${n} валидных строк — ВСЕ данные)
 */
import { DIRECTIONS, REGIONS, COMPONENT_KEYS, type ApplicantPortfolioRow } from "@/types/scoring";

export const PORTFOLIO_SOURCE = "applications-portfolio.csv" as const;

export const PORTFOLIO_STATS = {
  rowCount: ${stats.rowCount},
  totalAmount: ${stats.totalAmount},
  avgScore: ${stats.avgScore},
  forecastAbove60Pct: ${stats.forecastAbove60Pct},
} as const;

type CompactRow = [string, number, number, number, number, number, number[], string, number, string, string];

const _RAW: CompactRow[] = ${tuplesJson};

function expand(t: CompactRow): ApplicantPortfolioRow {
  const direction = DIRECTIONS[t[1]];
  const region = REGIONS[t[2]];
  const breakdown: Record<string, number> = {};
  for (let i = 0; i < 5; i++) breakdown[COMPONENT_KEYS[i]] = t[6][i];
  const sorted = [...Object.entries(breakdown)].sort((a, b) => b[1] - a[1]);
  return {
    applicant_id: t[0],
    direction,
    region,
    requested_amount: t[3],
    month: t[4],
    final_score_100: t[5],
    component_breakdown: breakdown as ApplicantPortfolioRow["component_breakdown"],
    farm_area: t[7],
    standard: t[8],
    subsidy_purpose: "",
    explanation: \`Итоговый балл: \${t[5].toFixed(1)}/100. Сильные стороны заявки: \${sorted[0][0]} (\${sorted[0][1].toFixed(1)} баллов) и \${sorted[1][0]} (\${sorted[1][1].toFixed(1)} баллов).\`,
    application_status: t[9] || undefined,
    received_at: t[10] || undefined,
  };
}

let _cache: ApplicantPortfolioRow[] | null = null;

export function getAllApplicants(): ApplicantPortfolioRow[] {
  if (!_cache) _cache = _RAW.map(expand);
  return _cache;
}
`;

  const outPath = path.join(root, "src", "data", "portfolio-generated.ts");
  fs.writeFileSync(outPath, out, "utf8");
  const fileSizeMB = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2);
  console.log("Wrote", outPath, `(${fileSizeMB} MB)`, "rows:", n, "stats:", stats);
}

main();
