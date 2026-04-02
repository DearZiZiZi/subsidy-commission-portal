"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAnimatedScalar } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

export function KPICard({
  title,
  value,
  decimals = 0,
  suffix,
  loading,
  mono,
  className,
}: {
  title: string;
  value: number;
  decimals?: number;
  suffix?: string;
  loading?: boolean;
  mono?: boolean;
  className?: string;
}) {
  const display = useAnimatedScalar(value, decimals);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{title}</p>
        {loading ? (
          <Skeleton className="mt-3 h-10 w-32" />
        ) : (
          <p
            className={cn(
              "mt-2 text-3xl font-semibold tracking-tight text-foreground",
              mono && "font-mono"
            )}
          >
            {decimals > 0
              ? display.toLocaleString("ru-RU", {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals,
                })
              : display.toLocaleString("ru-RU")}
            {suffix ? (
              <span className="ml-1 text-lg font-normal text-muted">{suffix}</span>
            ) : null}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
