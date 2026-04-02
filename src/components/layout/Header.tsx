"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { StateEmblem } from "@/components/layout/StateEmblem";

export function Header({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold-500/25 bg-white/90 shadow-sm dark:bg-navy-800/80">
          <StateEmblem size={36} priority className="max-h-9 max-w-9" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">
            {t("app_name")}
          </p>
          <p className="truncate font-mono text-[10px] text-muted">
            {t("header_subtitle")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden font-mono text-xs font-medium text-gold-600 dark:text-gold-400 sm:inline">
          {t("team_name")}
        </span>
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg border border-border p-2 text-foreground hover:bg-accent"
            aria-label={theme === "dark" ? t("theme_light") : t("theme_dark")}
          >
            {theme === "dark" ? (
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
