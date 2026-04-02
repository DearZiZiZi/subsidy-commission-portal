"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useI18n } from "@/providers/i18n-provider";
import { ScoringMethodologySection } from "@/components/dashboard/ScoringMethodologySection";

export default function MethodologyPage() {
  const { t } = useI18n();
  const [a, setA] = useState(14);
  const [b, setB] = useState(12);
  const [c, setC] = useState(16);
  const [d, setD] = useState(18);
  const [e, setE] = useState(15);
  const [penalty, setPenalty] = useState(false);
  const [bonus, setBonus] = useState(false);

  const base = useMemo(() => a + b + c + d + e, [a, b, c, d, e]);
  const penAmt = useMemo(() => (penalty ? base * 0.1 : 0), [penalty, base]);
  const bonAmt = bonus ? 7 : 0;
  const final = useMemo(
    () => Math.min(100, base - penAmt + bonAmt),
    [base, penAmt, bonAmt]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold tracking-tight">
        {t("methodology_title")}
      </h1>

      {/* Техническая методология: архитектура, веса, нормализация, источники */}
      <ScoringMethodologySection />

      {/* Интерактивный калькулятор */}
      <Card>
        <CardHeader>
          <CardTitle>Интерактивная модель (v2)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            Двигайте компоненты и переключайте штраф/бонус, чтобы увидеть как
            формируется итоговый балл.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span>Стратегия (Госплан)</span>
              <Input
                type="number"
                className="font-mono"
                value={a}
                min={0}
                max={20}
                onChange={(ev) => setA(Number(ev.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Технологии</span>
              <Input
                type="number"
                className="font-mono"
                value={b}
                min={0}
                max={20}
                onChange={(ev) => setB(Number(ev.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Масштаб</span>
              <Input
                type="number"
                className="font-mono"
                value={c}
                min={0}
                max={20}
                onChange={(ev) => setC(Number(ev.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Надёжность</span>
              <Input
                type="number"
                className="font-mono"
                value={d}
                min={0}
                max={20}
                onChange={(ev) => setD(Number(ev.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span>Регион</span>
              <Input
                type="number"
                className="font-mono"
                value={e}
                min={0}
                max={20}
                onChange={(ev) => setE(Number(ev.target.value))}
              />
            </label>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={penalty}
              onChange={(ev) => setPenalty(ev.target.checked)}
            />
            Риск крупной суммы (≥100 млн ₸): −10% от BASE
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={bonus}
              onChange={(ev) => setBonus(ev.target.checked)}
            />
            Сезонный бонус овцеводства (янв–апр): +7
          </label>
          <div className="rounded-lg border border-border bg-card/80 p-4 font-mono text-sm">
            <p>BASE = {base.toFixed(1)}</p>
            <p>Штраф = {penAmt.toFixed(1)}</p>
            <p>Бонус = {bonAmt.toFixed(1)}</p>
            <p className="mt-2 text-gold-500">
              FINAL = {final.toFixed(1)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Компоненты и ограничения */}
      <Card>
        <CardHeader>
          <CardTitle>Компоненты и ограничения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Технологический уровень оценивается эвристикой по тексту цели
            субсидирования (ключевые слова: генетика, импорт, производство,
            корма). Планируется уточнение с помощью LLM-классификатора.
          </p>
          <p>
            Известные ограничения: неполнота районных карт приёмки,
            чувствительность к формулировкам цели, отсутствие онлайн-верификации
            поголовья в реальном времени.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
