"use client";

import { useEffect, useState } from "react";
import { healthCheck, isDemoMode } from "@/lib/api";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

export function ApiStatusBadge({ className }: { className?: string }) {
  const { t } = useI18n();
  const demo = isDemoMode();
  const [ok, setOk] = useState<boolean | null>(null);
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    const run = async () => {
      const t0 = performance.now();
      const connected = await healthCheck();
      const t1 = performance.now();
      if (!cancelled) {
        setOk(connected);
        setMs(connected ? Math.round(t1 - t0) : null);
      }
    };
    void run();
    const id = setInterval(run, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [demo]);

  if (demo) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-border bg-ios-orange/15 px-2 py-0.5 text-[10px] font-medium text-ios-orange dark:bg-ios-orange/20",
          className
        )}
      >
        <span className="text-[10px]" aria-hidden>
          🟡
        </span>
        {t("status_demo_mode")}
      </span>
    );
  }

  if (ok === null) {
    return (
      <span className={cn("text-[10px] text-muted-fg", className)}>API…</span>
    );
  }

  if (ok) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-border bg-ios-green/15 px-2 py-0.5 text-[10px] font-medium text-ios-green dark:bg-ios-green/25",
          className
        )}
      >
        <span aria-hidden>✓</span>
        {t("status_api_ok")}
        {ms != null ? (
          <span className="font-mono text-muted-fg">· {ms} ms</span>
        ) : null}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-ios-red/15 px-2 py-0.5 text-[10px] font-medium text-ios-red dark:bg-ios-red/25",
        className
      )}
    >
      API offline
    </span>
  );
}
