"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { StateEmblem } from "@/components/layout/StateEmblem";
import { isDemoMode } from "@/lib/api";
import { ApiStatusBadge } from "@/components/layout/ApiStatusBadge";
import { Button } from "@/components/ui/Button";
import {
  SUBSIDY_DEMO_PENDING_KEY,
  SUBSIDY_DEMO_TOUR_EVENT,
} from "@/lib/demo-tour";

const ROUTE_TITLE_KEYS: Record<string, string> = {
  "/": "nav_dashboard",
  "/evaluate": "nav_evaluate",
  "/shortlist": "nav_shortlist",
  "/batch": "nav_batch",
  "/methodology": "nav_methodology",
  "/settings": "nav_settings",
  "/api-docs": "nav_api_docs",
};

export function Header({
  className,
  onMenuClick,
}: {
  className?: string;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const titleKey = useMemo(() => {
    if (pathname === "/") return ROUTE_TITLE_KEYS["/"];
    const hit = Object.keys(ROUTE_TITLE_KEYS)
      .filter((k) => k !== "/")
      .find((k) => pathname.startsWith(k));
    return hit ? ROUTE_TITLE_KEYS[hit] : "app_name";
  }, [pathname]);

  const demo = isDemoMode();
  const isDark = resolvedTheme === "dark";

  function runDemoTour() {
    if (pathname.startsWith("/evaluate")) {
      window.dispatchEvent(new CustomEvent(SUBSIDY_DEMO_TOUR_EVENT));
    } else {
      try {
        sessionStorage.setItem(SUBSIDY_DEMO_PENDING_KEY, "1");
      } catch {
        /* ignore */
      }
      router.push("/evaluate");
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-[52px] min-h-[52px] shrink-0 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-[12px] dark:bg-background/95 md:px-6",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-foreground hover:bg-accent lg:hidden"
          onClick={onMenuClick}
          aria-label="Меню"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card sm:flex">
          <StateEmblem size={28} className="max-h-7 max-w-7" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
              {t(titleKey)}
            </h1>
            {demo && (
              <span className="shrink-0 rounded-full border border-border bg-ios-orange/15 px-2 py-0.5 text-[10px] font-medium text-ios-orange dark:bg-ios-orange/25">
                {t("demo_badge")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ApiStatusBadge className="hidden sm:inline-flex" />
        {demo && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-[10px] text-xs sm:hidden"
              onClick={runDemoTour}
              aria-label={t("demo_tour")}
            >
              ▶
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="hidden rounded-[10px] text-xs sm:inline-flex"
              onClick={runDemoTour}
            >
              {t("demo_tour")}
            </Button>
          </>
        )}
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-lg border border-border bg-card p-2 text-foreground hover:bg-accent"
            aria-label={isDark ? t("theme_light") : t("theme_dark")}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
