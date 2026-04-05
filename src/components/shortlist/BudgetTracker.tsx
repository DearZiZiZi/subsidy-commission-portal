"use client";

import { useState } from "react";
import { formatKZT } from "@/lib/score-utils";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n-provider";
import { Input } from "@/components/ui/Input";
import { Pencil } from "lucide-react";

export function BudgetTracker({
  total,
  allocated,
  onChangeTotal,
  className,
}: {
  total: number;
  allocated: number;
  onChangeTotal?: (n: number) => void;
  className?: string;
}) {
  const { t } = useI18n();
  const remaining = Math.max(0, total - allocated);
  const pct = total > 0 ? (allocated / total) * 100 : 0;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(total));

  const barColor =
    pct >= 90 ? "#FF3B30" : pct >= 70 ? "#FF9500" : "#34C759";

  function commitEdit() {
    const n = Number(draft.replace(/\s/g, "")) || 0;
    onChangeTotal?.(n);
    setEditing(false);
  }

  return (
    <div
      className={cn(
        "rounded-[12px] border border-border bg-card p-5 shadow-card",
        className
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-muted-fg">{t("budget_total")}</p>
          {editing && onChangeTotal ? (
            <div className="mt-1 flex items-center gap-2">
              <Input
                type="number"
                className="w-44 font-mono text-sm"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                autoFocus
              />
            </div>
          ) : (
            <button
              type="button"
              className="group mt-1 flex items-center gap-2 text-left"
              onClick={() => {
                if (!onChangeTotal) return;
                setDraft(String(total));
                setEditing(true);
              }}
            >
              <p className="font-mono text-lg font-semibold text-foreground">
                {formatKZT(total)}
              </p>
              {onChangeTotal ? (
                <Pencil className="h-3.5 w-3.5 text-muted-fg opacity-0 transition-opacity group-hover:opacity-100" />
              ) : null}
            </button>
          )}
        </div>
        <div>
          <p className="text-[13px] font-medium text-muted-fg">
            {t("budget_reserved")}
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-foreground">
            {formatKZT(allocated)}
          </p>
        </div>
        <div>
          <p className="text-[13px] font-medium text-muted-fg">
            {t("budget_remaining")}
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-foreground">
            {formatKZT(remaining)}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[11px] text-muted-fg">
          <span className="font-mono tabular-nums">
            {pct.toFixed(0)}% {t("budget_used_pct")}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-accent">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, pct)}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
    </div>
  );
}
