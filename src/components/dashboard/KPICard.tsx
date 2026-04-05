"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function KPICard({
  title,
  value,
  valueText,
  decimals = 0,
  suffix,
  loading,
  dotClassName,
  className,
}: {
  title: string;
  /** Число для отображения (если не задано valueText) */
  value?: number;
  /** Готовая строка (например млрд ₸) */
  valueText?: string;
  decimals?: number;
  suffix?: string;
  loading?: boolean;
  dotClassName?: string;
  className?: string;
}) {
  const display =
    valueText ??
    (value !== undefined
      ? decimals > 0
        ? value.toLocaleString("ru-RU", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : value.toLocaleString("ru-RU")
      : "—");

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex gap-4 p-5">
        <div
          className={cn(
            "mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#007AFF]",
            dotClassName
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-[32px] font-bold leading-none tracking-tight text-[#1C1C1E]">
            {loading ? (
              <Skeleton className="inline-block h-9 w-28" />
            ) : (
              <>
                {display}
                {suffix ? (
                  <span className="ml-1 text-lg font-semibold text-[#8E8E93]">
                    {suffix}
                  </span>
                ) : null}
              </>
            )}
          </p>
          <p className="mt-2 text-[13px] text-[#8E8E93]">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
