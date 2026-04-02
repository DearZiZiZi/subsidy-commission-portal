import type { ApplicantPortfolioRow } from "@/types/scoring";
import {
  getAllApplicants,
  PORTFOLIO_STATS,
  PORTFOLIO_SOURCE,
} from "@/data/portfolio-generated";

export { PORTFOLIO_STATS, PORTFOLIO_SOURCE };

/** Полный набор из CSV (28 627 строк), lazy-initialized. */
export function getDashboardDataset(): ApplicantPortfolioRow[] {
  return getAllApplicants();
}
