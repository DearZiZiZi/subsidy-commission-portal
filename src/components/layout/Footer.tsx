"use client";

import { useI18n } from "@/providers/i18n-provider";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto border-t border-border bg-background px-6 py-4">
      <p className="text-center text-[11px] leading-relaxed text-muted-fg">
        {t("footer_legal")}
      </p>
    </footer>
  );
}
