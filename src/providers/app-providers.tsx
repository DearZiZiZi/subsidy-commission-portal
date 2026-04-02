"use client";

import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        {children}
        <Toaster richColors position="top-right" />
      </I18nProvider>
    </ThemeProvider>
  );
}
