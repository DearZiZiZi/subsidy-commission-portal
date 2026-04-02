"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/providers/i18n-provider";
import type { Lang } from "@/lib/i18n-dict";

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();

  function pick(next: Lang) {
    setLang(next);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl space-y-6"
    >
      <h1 className="text-2xl font-bold tracking-tight">{t("settings_title")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("lang_ru")} / {t("lang_kk")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={lang === "ru" ? "primary" : "outline"}
            onClick={() => pick("ru")}
          >
            {t("lang_ru")}
          </Button>
          <Button
            type="button"
            variant={lang === "kk" ? "primary" : "outline"}
            onClick={() => pick("kk")}
          >
            {t("lang_kk")}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
