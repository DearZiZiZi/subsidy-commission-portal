/** Порядок совпадает с Literal в FastAPI `MeritScoreRequest.direction` (service.py). */
export const DIRECTIONS = [
  "Субсидирование в скотоводстве",
  "Субсидирование в овцеводстве",
  "Субсидирование в птицеводстве",
  "Субсидирование в свиноводстве",
  "Субсидирование в верблюдоводстве",
  "Субсидирование в коневодстве",
  "Субсидирование затрат по искусственному осеменению",
  "Субсидирование в пчеловодстве",
  "Субсидирование в козоводстве",
] as const;

export type Direction = (typeof DIRECTIONS)[number];

/** Порядок совпадает с Literal в FastAPI `MeritScoreRequest.region`. */
export const REGIONS = [
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
] as const;

export type Region = (typeof REGIONS)[number];

export const COMPONENT_KEYS = [
  "Стратегический приоритет (Госплан)",
  "Технологический уровень заявки",
  "Масштаб производства (Поголовье)",
  "Надежность заявителя (по 2025)",
  "Региональная специализация",
] as const;

export type ComponentKey = (typeof COMPONENT_KEYS)[number];

export type ComponentBreakdown = Record<ComponentKey, number>;

export interface ScoreResult {
  applicant_id: string;
  final_score_100: number;
  explanation: string;
  component_breakdown: ComponentBreakdown;
}

export interface MeritScoreRequest {
  applicant_id: string;
  direction: Direction;
  standard: number;
  subsidy_purpose: string;
  requested_amount: number;
  region: Region;
  month: number;
  farm_area: string;
}

export interface ApplicantPortfolioRow extends ScoreResult {
  direction: Direction;
  region: Region;
  requested_amount: number;
  month: number;
  farm_area: string;
  standard: number;
  subsidy_purpose: string;
  /** При наличии в выгрузке портфеля */
  application_status?: string;
  received_at?: string;
}

export interface CommissionApplicant extends ApplicantPortfolioRow {
  needsReview: boolean;
  addedAt: number;
  id: string;
}

export type ScoreTier = "recommended" | "review" | "verify" | "low";

export interface FilterState {
  directions: Direction[];
  regions: Region[];
  scoreMin: number;
  scoreMax: number;
  month: number | null;
  topN: "10" | "25" | "50" | "all";
}
