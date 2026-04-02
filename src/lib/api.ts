import {
  DIRECTIONS,
  type MeritScoreRequest,
  type ScoreResult,
} from "@/types/scoring";

/** Ответ POST `/evaluate` — совпадает с `evaluate_merit_score_100` в `utils.py`. */
export type MeritScoreApiResponse = ScoreResult;
import { buildBreakdown, makeExplanation } from "@/lib/score-utils";

const DEFAULT_API = "http://127.0.0.1:8000";

export function getApiBaseUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return DEFAULT_API;
}

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Совпадает с dicts/strategic_weights.json (порядок — как в DIRECTIONS). */
const STRATEGIC_WEIGHTS: number[] = [14, 11, 15, 6, 5, 9, 15, 4, 4];

function mockEvaluate(req: MeritScoreRequest): ScoreResult {
  const h = hashString(
    `${req.applicant_id}|${req.direction}|${req.subsidy_purpose}|${req.requested_amount}`
  );
  const di = DIRECTIONS.indexOf(req.direction);
  const strategic = di >= 0 ? (STRATEGIC_WEIGHTS[di] ?? 10) : 10;
  const tech = 4 + (h % 17);
  const scale = Math.min(
    20,
    Math.cbrt(req.requested_amount / Math.max(req.standard, 1))
  );
  const rel = 12 + (h % 9);
  const reg = 8 + (h % 12);
  const breakdown = buildBreakdown(strategic, tech, scale, rel, reg);
  const baseScore = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const penalty =
    req.requested_amount >= 100_000_000 ? baseScore * 0.1 : 0;
  const seasonalBonus =
    req.direction === "Субсидирование в овцеводстве" && req.month <= 4 ? 7 : 0;
  const finalScore = Math.min(
    100,
    Math.round((baseScore - penalty + seasonalBonus) * 10) / 10
  );
  const explanation =
    makeExplanation(finalScore, breakdown) +
    (req.requested_amount >= 100_000_000
      ? ` ВНИМАНИЕ: Применен риск-штраф (-${penalty.toFixed(1)} баллов) из-за суммы заявки ≥100 млн ₸. Требуется ручной аудит комиссии.`
      : "");
  return {
    applicant_id: req.applicant_id,
    final_score_100: finalScore,
    explanation,
    component_breakdown: breakdown,
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function evaluateMeritScore(
  body: MeritScoreRequest
): Promise<ScoreResult> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
    return mockEvaluate(body);
  }
  const url = `${getApiBaseUrl()}/evaluate`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(text || `HTTP ${res.status}`, res.status);
    }
    const data = (await res.json()) as MeritScoreApiResponse;
    return data;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e instanceof TypeError && e.message.includes("fetch")) {
      throw new ApiError("Сервер недоступен. Включите демо-режим или проверьте API.");
    }
    throw new ApiError(e instanceof Error ? e.message : "Неизвестная ошибка");
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

/** Тело ответа GET /health (FastAPI). */
export type HealthResponse = { status: string };

export async function fetchHealthJson(): Promise<HealthResponse> {
  const res = await fetch(`${getApiBaseUrl()}/health`, { method: "GET" });
  if (!res.ok) throw new ApiError(`HTTP ${res.status}`, res.status);
  return (await res.json()) as HealthResponse;
}
