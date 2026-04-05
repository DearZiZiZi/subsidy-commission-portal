"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calculator,
  ClipboardList,
  Code2,
  FileStack,
  PanelLeftClose,
  PanelLeft,
  Scale,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n-provider";
import { StateEmblem } from "@/components/layout/StateEmblem";

const NAV = [
  { href: "/", key: "nav_dashboard", icon: BarChart3 },
  { href: "/evaluate", key: "nav_evaluate", icon: Calculator },
  { href: "/shortlist", key: "nav_shortlist", icon: ClipboardList },
  { href: "/batch", key: "nav_batch", icon: FileStack },
  { href: "/methodology", key: "nav_methodology", icon: Scale },
  { href: "/settings", key: "nav_settings", icon: Settings },
  { href: "/api-docs", key: "nav_api_docs", icon: Code2 },
] as const;

export function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  const aside = (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card text-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-[240px]"
      )}
    >
      <div className="flex h-[52px] items-center justify-between gap-1 border-b border-border px-2">
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2",
            collapsed && "justify-center"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
            <StateEmblem size={32} className="max-h-8 max-w-8" />
          </div>
          {!collapsed && (
            <span className="truncate text-[13px] font-semibold text-foreground">
              {t("sidebar_brand")}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "hidden shrink-0 rounded-md p-2 text-muted-fg hover:bg-accent hover:text-foreground lg:inline-flex",
            collapsed && "mx-auto"
          )}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
        {onMobileClose ? (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-md p-2 text-muted-fg hover:bg-accent lg:hidden"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {NAV.map(({ href, key, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => onMobileClose?.()}
              className={cn(
                "flex items-center gap-3 rounded-lg border-l-2 py-2.5 pl-[calc(0.75rem-2px)] pr-3 text-sm transition-colors",
                active
                  ? "border-foreground bg-accent font-semibold text-foreground"
                  : "border-transparent font-medium text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {!collapsed && <span className="truncate">{t(key)}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 lg:hidden"
          aria-label="Закрыть меню"
          onClick={onMobileClose}
        />
      ) : null}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-screen lg:sticky lg:top-0 lg:z-0 lg:flex lg:shrink-0",
          mobileOpen ? "flex" : "hidden lg:flex"
        )}
      >
        {aside}
      </div>
    </>
  );
}
