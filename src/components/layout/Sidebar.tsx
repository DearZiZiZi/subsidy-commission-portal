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

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-border bg-navy-900 text-slate-300 transition-[width] dark:bg-navy-950",
        collapsed ? "w-16" : "w-[240px]"
      )}
    >
      <div className="flex h-14 items-center justify-between gap-1 border-b border-navy-700 px-2">
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2",
            collapsed && "justify-center"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gold-500/20 bg-white/95 dark:bg-navy-800">
            <StateEmblem size={32} className="max-h-8 max-w-8" />
          </div>
          {!collapsed && (
            <span className="truncate text-xs font-semibold uppercase tracking-wider text-gold-400">
              {t("team_name")}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="shrink-0 rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-gold-400"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gold-500/15 text-gold-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
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
}
