"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Fragment, useMemo, useState } from "react";
import type { ApplicantPortfolioRow } from "@/types/scoring";
import { formatKZT, formatScoreOneDecimal, getTier } from "@/lib/score-utils";
import { ScoreTierBadge } from "@/components/scoring/ScoreTierBadge";
import { ComponentSparkBars } from "@/components/scoring/ComponentBreakdown";
import { ShortlistBreakdownPanel } from "@/components/shortlist/ShortlistBreakdownPanel";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n-provider";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Flag,
  HelpCircle,
  Plus,
} from "lucide-react";

const PAGE_SIZE = 50;

export function ShortlistTable({
  rows,
  shortlistIds,
  onAdd,
  onRemoveByApplicantId,
  onToggleManualReview,
  manualReviewIds,
}: {
  rows: ApplicantPortfolioRow[];
  shortlistIds: Set<string>;
  onAdd: (row: ApplicantPortfolioRow) => void;
  onRemoveByApplicantId: (applicant_id: string) => void;
  onToggleManualReview: (applicant_id: string) => void;
  manualReviewIds: Set<string>;
}) {
  const { t } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "final_score_100", desc: true },
  ]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });

  const columns = useMemo<ColumnDef<ApplicantPortfolioRow>[]>(
    () => [
      {
        id: "rank",
        header: "#",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-fg">
            {row.index + 1 + pagination.pageIndex * PAGE_SIZE}
          </span>
        ),
      },
      {
        accessorKey: "applicant_id",
        header: t("col_id"),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: "direction",
        header: t("col_direction"),
        cell: ({ getValue }) => (
          <span className="max-w-[200px] truncate text-xs">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: "region",
        header: t("col_region"),
      },
      {
        accessorKey: "requested_amount",
        header: t("col_sum"),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">{formatKZT(Number(getValue()))}</span>
        ),
      },
      {
        accessorKey: "final_score_100",
        header: t("col_score"),
        cell: ({ getValue }) => (
          <span className="font-bold tabular-nums tracking-tight text-ios-purple">
            {formatScoreOneDecimal(Number(getValue()))}
          </span>
        ),
      },
      {
        id: "tier",
        header: t("col_tier"),
        cell: ({ row }) => <ScoreTierBadge score={row.original.final_score_100} />,
      },
      {
        id: "radar",
        header: () => (
          <span className="inline-flex items-center gap-1">
            {t("col_breakdown")}
            <span title={t("breakdown_help")} className="text-muted-fg">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden />
            </span>
          </span>
        ),
        cell: ({ row }) => (
          <ComponentSparkBars breakdown={row.original.component_breakdown} />
        ),
      },
      {
        id: "rec",
        header: t("recommendation"),
        cell: ({ row }) => {
          const tier = getTier(row.original.final_score_100);
          const ok = tier === "recommended" || tier === "review";
          return (
            <span className="font-mono text-xs text-muted-fg">
              {ok ? t("yes") : t("no")}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: t("actions"),
        cell: ({ row }) => {
          const id = row.original.applicant_id;
          const inList = shortlistIds.has(id);
          const rev = manualReviewIds.has(id);
          const isOpen = expanded[id] ?? false;
          return (
            <div
              className="flex flex-wrap items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-medium text-ios-blue hover:underline"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setExpanded((e) => ({ ...e, [id]: !e[id] }));
                }}
              >
                {t("shortlist_more")}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {!inList ? (
                <Button
                  size="sm"
                  variant="primary"
                  type="button"
                  className="h-8 gap-1 rounded-[10px] px-3 text-xs sm:inline-flex"
                  onClick={() => onAdd(row.original)}
                >
                  <Plus className="h-3.5 w-3.5 sm:hidden" />
                  <span className="hidden sm:inline">＋ {t("btn_add_shortlist")}</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  className="h-8 text-xs"
                  onClick={() => onRemoveByApplicantId(id)}
                >
                  −
                </Button>
              )}
              <Button
                size="sm"
                variant={rev ? "secondary" : "outline"}
                type="button"
                className="h-8 gap-1 px-2 text-xs"
                onClick={() => onToggleManualReview(id)}
                aria-pressed={rev}
              >
                <Flag className="h-3.5 w-3.5 sm:hidden" />
                <span className="hidden sm:inline">⚑ {t("btn_mark_flag")}</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [
      expanded,
      manualReviewIds,
      onAdd,
      onRemoveByApplicantId,
      onToggleManualReview,
      pagination.pageIndex,
      shortlistIds,
      t,
    ]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (rows.length === 0) {
    return (
      <div className="rounded-[12px] border border-dashed border-border p-12 text-center text-sm text-muted-fg">
        {t("shortlist_no_rows")}
      </div>
    );
  }

  const pageCount = table.getPageCount();
  const pageIdx = table.getState().pagination.pageIndex;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-[12px] border border-border bg-card shadow-card">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm text-foreground">
          <thead className="border-b border-border bg-accent">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-muted-fg"
                    onClick={h.column.getToggleSortingHandler()}
                    style={{ cursor: h.column.getCanSort() ? "pointer" : "default" }}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc"
                      ? " ↑"
                      : h.column.getIsSorted() === "desc"
                        ? " ↓"
                        : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const id = row.original.applicant_id;
              const isOpen = expanded[id] ?? false;
              return (
                <Fragment key={row.id}>
                  <tr
                    className="cursor-pointer border-b border-border/80 transition-colors hover:bg-accent"
                    title={t("shortlist_row_tip")}
                    onClick={() => setExpanded((e) => ({ ...e, [id]: !e[id] }))}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {isOpen && (
                    <tr className="bg-accent">
                      <td colSpan={columns.length} className="px-4 py-4">
                        <ShortlistBreakdownPanel row={row.original} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted-fg">
          Всего:{" "}
          <span className="font-mono font-medium text-foreground">
            {rows.length.toLocaleString("ru-RU")}
          </span>{" "}
          · Страница{" "}
          <span className="font-mono text-foreground">{pageIdx + 1}</span> из{" "}
          <span className="font-mono text-foreground">{pageCount}</span>
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Первая страница"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Предыдущая"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers(pageIdx, pageCount).map((p, i) =>
            p === "…" ? (
              <span key={`e${i}`} className="px-1 text-muted-fg">
                …
              </span>
            ) : (
              <Button
                key={p}
                type="button"
                variant={p === pageIdx ? "secondary" : "ghost"}
                size="sm"
                className="min-w-[32px] font-mono"
                onClick={() => table.setPageIndex(p as number)}
              >
                {(p as number) + 1}
              </Button>
            )
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Следующая"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Последняя страница"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | "…")[] = [];
  pages.push(0);
  if (current > 2) pages.push("…");
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 3) pages.push("…");
  pages.push(total - 1);
  return pages;
}
