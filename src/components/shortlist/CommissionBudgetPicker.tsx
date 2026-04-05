"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { formatKZT } from "@/lib/score-utils";

/** Типовые лимиты (тенге); комиссия выбирает актуальный, не фиксированный системой. */
const PRESET_AMOUNTS = [
  5_000_000_000,
  10_000_000_000,
  25_000_000_000,
  50_000_000_000,
  100_000_000_000,
] as const;

function shortLabel(amount: number): string {
  const b = amount / 1_000_000_000;
  return `${b} млрд ₸`;
}

export function CommissionBudgetPicker({
  budgetTotal,
  onChangeTotal,
  className,
}: {
  budgetTotal: number;
  onChangeTotal: (n: number) => void;
  className?: string;
}) {
  const { t } = useI18n();
  const [custom, setCustom] = useState("");

  return (
    <div
      className={cn(
        "rounded-card border border-border bg-card p-5 shadow-card",
        className
      )}
    >
      <h2 className="text-base font-semibold text-foreground">
        {t("budget_choose_title")}
      </h2>
      <p className="mt-1 text-sm text-muted-fg">{t("budget_choose_hint")}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESET_AMOUNTS.map((amt) => {
          const active = budgetTotal === amt;
          return (
            <Button
              key={amt}
              type="button"
              size="sm"
              variant={active ? "primary" : "outline"}
              className="rounded-[10px] font-mono text-xs"
              onClick={() => onChangeTotal(amt)}
            >
              {shortLabel(amt)}
            </Button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <label className="text-[13px] font-medium text-muted-fg">
            {t("budget_custom_label")}
          </label>
          <Input
            type="number"
            min={0}
            className="mt-1 font-mono text-sm"
            placeholder="50000000000"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="rounded-[10px]"
          onClick={() => {
            const n = Number(String(custom).replace(/\s/g, "")) || 0;
            if (n > 0) onChangeTotal(n);
            setCustom("");
          }}
        >
          {t("budget_apply")}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-fg">
        {t("budget_current")}:{" "}
        <span className="font-mono font-semibold text-foreground">
          {formatKZT(budgetTotal)}
        </span>
      </p>
    </div>
  );
}
