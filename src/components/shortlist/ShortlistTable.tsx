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
import { ApplicationExpandPanel } from "@/components/shortlist/ApplicationRow";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n-dict";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const PAGE_SIZE = 50;

export function ShortlistTable({
  rows,
  lang,
  shortlistIds,
  onAdd,
  onRemoveByApplicantId,
  onToggleManualReview,
  manualReviewIds,
}: {
  rows: ApplicantPortfolioRow[];
  lang: Lang;
  shortlistIds: Set<string>;
  onAdd: (row: ApplicantPortfolioRow) => void;
  onRemoveByApplicantId: (applicant_id: string) => void;
  onToggleManualReview: (applicant_id: string) => void;
  manualReviewIds: Set<string>;
}) {
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
          <span className="font-mono text-xs text-muted">
            {row.index + 1 + pagination.pageIndex * PAGE_SIZE}
          </span>
        ),
      },
      {
        accessorKey: "applicant_id",
        header: "ID",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: "direction",
        header: "Направление",
        cell: ({ getValue }) => (
          <span className="max-w-[200px] truncate text-xs">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: "region",
        header: "Область",
      },
      {
        accessorKey: "requested_amount",
        header: "Сумма",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">
            {formatKZT(Number(getValue()))}
          </span>
        ),
      },
      {
        accessorKey: "final_score_100",
        header: "Балл",
        cell: ({ getValue }) => (
          <span className="font-mono">{formatScoreOneDecimal(Number(getValue()))}</span>
        ),
      },
      {
        id: "tier",
        header: "Уровень",
        cell: ({ row }) => (
          <ScoreTierBadge score={row.original.final_score_100} lang={lang} />
        ),
      },
      {
        id: "radar",
        header: "Компоненты",
        cell: ({ row }) => (
          <ComponentSparkBars breakdown={row.original.component_breakdown} />
        ),
      },
      {
        id: "rec",
        header: "Реком.",
        cell: ({ row }) => {
          const t = getTier(row.original.final_score_100);
          const ok = t === "recommended" || t === "review";
          return <span className="font-mono text-xs">{ok ? "YES" : "NO"}</span>;
        },
      },
      {
        id: "actions",
        header: "Действия",
        cell: ({ row }) => {
          const id = row.original.applicant_id;
          const inList = shortlistIds.has(id);
          const rev = manualReviewIds.has(id);
          const isOpen = expanded[id] ?? false;
          return (
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() =>
                  setExpanded((e) => ({ ...e, [id]: !e[id] }))
                }
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </Button>
              {!inList ? (
                <Button size="sm" variant="secondary" type="button" onClick={() => onAdd(row.original)}>
                  +
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => onRemoveByApplicantId(id)}
                >
                  −
                </Button>
              )}
              <Button
                size="sm"
                variant={rev ? "primary" : "ghost"}
                type="button"
                onClick={() => onToggleManualReview(id)}
              >
                !
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expanded, lang, manualReviewIds, shortlistIds, pagination.pageIndex]
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
      <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted">
        Нет заявок по выбранным фильтрам
      </div>
    );
  }

  const pageCount = table.getPageCount();
  const pageIdx = table.getState().pagination.pageIndex;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead className="bg-navy-900/90 text-slate-200 dark:bg-navy-950">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="whitespace-nowrap px-3 py-3 font-semibold"
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
                  <tr className="border-b border-border/80 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {isOpen && (
                    <tr className="bg-navy-900/5 dark:bg-black/25">
                      <td colSpan={columns.length} className="px-6 py-4">
                        <ApplicationExpandPanel
                          row={row.original}
                          motionLayout={false}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted">
          Всего: <span className="font-mono text-foreground">{rows.length.toLocaleString("ru-RU")}</span>{" "}
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
              <span key={`e${i}`} className="px-1 text-muted">
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
