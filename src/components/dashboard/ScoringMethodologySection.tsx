"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { STRATEGIC_WEIGHT_ROWS } from "@/data/strategic-weight-meta";
import { useMounted } from "@/hooks/useMounted";
import { Skeleton } from "@/components/ui/Skeleton";

const NORM_POINTS = Array.from({ length: 37 }, (_, i) => {
  const x = i * 5;
  return {
    x,
    log1p: Math.log1p(x),
    sqrt: Math.sqrt(x),
    cbrt: Math.cbrt(x),
  };
});

const flowVariants = {
  hidden: { opacity: 0.35, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.3, duration: 0.35, ease: "easeOut" as const },
  }),
};

export function ScoringMethodologySection() {
  const mounted = useMounted();
  return (
    <section className="space-y-6 pt-2">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Техническая методология скоринга
        </h2>
        <p className="mt-1 text-sm text-muted">
          Как устроена модель: от входных полей до итогового балла 0–100.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Архитектура расчёта</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoringFlowDiagram />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Стратегические веса направлений</CardTitle>
        </CardHeader>
        <CardContent className="h-[340px] min-h-[280px] w-full min-w-0">
          {!mounted ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={260}>
            <BarChart
              data={STRATEGIC_WEIGHT_ROWS}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" domain={[0, 16]} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="shortLabel"
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as (typeof STRATEGIC_WEIGHT_ROWS)[0];
                  return (
                    <div className="max-w-xs rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-panel dark:shadow-panel-dark">
                      <p className="font-semibold text-foreground">{p.direction}</p>
                      <p className="mt-1 text-gold-500">Вес: {p.weight}</p>
                      <p className="mt-2 text-muted">{p.justification}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                {STRATEGIC_WEIGHT_ROWS.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i % 2 === 0 ? "rgba(245, 158, 11, 0.85)" : "rgba(30, 58, 138, 0.75)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Нормализация масштаба (поголовье)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="grid gap-2 text-sm sm:grid-cols-3">
            <li className="rounded-lg border border-border bg-card/60 px-3 py-2">
              <span className="font-mono text-gold-500">log1p(x)</span>
              <p className="mt-1 text-muted">
                Делает разницу между малыми и средними объёмами слишком несущественной.
              </p>
            </li>
            <li className="rounded-lg border border-border bg-card/60 px-3 py-2">
              <span className="font-mono text-orange-500">sqrt(x)</span>
              <p className="mt-1 text-muted">
                Создаёт аномальные разрывы между соседними значениями на хвосте.
              </p>
            </li>
            <li className="rounded-lg border border-gold-500/40 bg-gold-500/10 px-3 py-2">
              <span className="font-mono text-gold-400">cbrt(x)</span>
              <p className="mt-1 text-foreground">
                Оптимальное сглаживание распределения — используется в модели.
              </p>
            </li>
          </ul>
          <div className="h-[280px] min-h-[240px] w-full min-w-0">
            {!mounted ? (
              <Skeleton className="h-[260px] w-full rounded-lg" />
            ) : (
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <LineChart data={NORM_POINTS} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="x" tick={{ fontSize: 10 }} label={{ value: "x (усл. поголовье)", position: "bottom", offset: 0, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Legend />
                <Line type="monotone" dataKey="log1p" name="log1p(x)" stroke="#94a3b8" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="sqrt" name="sqrt(x)" stroke="#f97316" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="cbrt" name="cbrt(x)" stroke="#fbbf24" dot={false} strokeWidth={2.5} />
                <ReferenceLine x={17.5} stroke="#64748b" strokeDasharray="4 4" label={{ value: "μ≈17.5", fontSize: 10, fill: "var(--muted)" }} />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
          <p className="text-center text-xs text-muted">
            Выбрано на основе анализа 28 627 успешных заявок за 2025 год (среднее ~17.5, макс. 180 по
            нормативу, σ≈21.2).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Источники данных</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="py-2 pr-4 font-medium">Источник</th>
                <th className="py-2 pr-4 font-medium">Что даёт</th>
                <th className="py-2 pr-4 font-medium">Компонент</th>
                <th className="py-2 font-medium">Ссылка</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4">Приказ МСХ РК №V1900018404</td>
                <td className="py-2 pr-4">Правила субсидирования</td>
                <td className="py-2 pr-4">Все компоненты</td>
                <td className="py-2">
                  <a className="text-gold-500 hover:underline" href="https://adilet.zan.kz" target="_blank" rel="noopener noreferrer">
                    adilet.zan.kz
                  </a>
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4">Постановление №51 (2026)</td>
                <td className="py-2 pr-4">Приоритеты 2026–2030</td>
                <td className="py-2 pr-4">Стратегический приоритет</td>
                <td className="py-2">
                  <a className="text-gold-500 hover:underline" href="https://adilet.zan.kz" target="_blank" rel="noopener noreferrer">
                    adilet.zan.kz
                  </a>
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4">ИС ИСЗХ</td>
                <td className="py-2 pr-4">Поголовье по регионам</td>
                <td className="py-2 pr-4">Региональная специализация</td>
                <td className="py-2">
                  <a className="text-gold-500 hover:underline" href="https://iszh.gov.kz" target="_blank" rel="noopener noreferrer">
                    iszh.gov.kz
                  </a>
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4">Бюро национальной статистики РК</td>
                <td className="py-2 pr-4">Макроэкономические данные</td>
                <td className="py-2 pr-4">Стратегический приоритет</td>
                <td className="py-2">
                  <a className="text-gold-500 hover:underline" href="https://stat.gov.kz" target="_blank" rel="noopener noreferrer">
                    stat.gov.kz
                  </a>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Данные заявок 2025</td>
                <td className="py-2 pr-4">Исторические acceptance rates по районам</td>
                <td className="py-2 pr-4">Надёжность заявителя</td>
                <td className="py-2 text-muted">Внутренние данные</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}

function ScoringFlowDiagram() {
  return (
    <div className="space-y-3">
      <motion.div
        className="mx-auto w-full max-w-lg rounded-lg border border-navy-700 bg-navy-900/40 px-4 py-3 text-center shadow-[0_0_0_0_rgba(245,158,11,0)] dark:bg-navy-950/60"
        variants={flowVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <p className="text-sm font-semibold text-gold-400">Данные заявки</p>
        <p className="text-xs text-muted">направление, сумма, район, месяц…</p>
      </motion.div>

      <p className="text-center text-gold-500/90">↓</p>

      <motion.div
        className="rounded-xl border border-border bg-card/80 p-4 shadow-[0_0_0_0_rgba(245,158,11,0)]"
        variants={flowVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted">
          5 компонентов оценки
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            ["Стратег. приоритет", "(×20)"],
            ["Технолог. уровень", "(×20)"],
            ["Масштаб произв.", "(×20)"],
            ["Надёжность заявителя", "(×20)"],
            ["Регион. специал.", "(×20)"],
          ].map(([a, b]) => (
            <div
              key={a}
              className="rounded-md border border-border bg-background/80 px-2 py-2 text-center text-[11px] leading-tight sm:text-xs"
            >
              <div className="font-medium text-foreground">{a}</div>
              <div className="font-mono text-gold-500">{b}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <p className="text-center text-gold-500/90">↓</p>

      <motion.div
        className="mx-auto w-full max-w-lg rounded-lg border border-border bg-card px-4 py-3 text-center"
        variants={flowVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <p className="font-mono text-sm font-semibold text-foreground">BASE_SCORE</p>
        <p className="text-xs text-muted">сумма компонентов</p>
      </motion.div>

      <p className="text-center text-gold-500/90">↓</p>

      <motion.div
        className="mx-auto w-full max-w-lg rounded-lg border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-center"
        variants={flowVariants}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <p className="text-sm font-semibold text-foreground">Применение правил</p>
        <p className="text-xs text-muted">бонус +7 · штраф 10% от базы (при сумме ≥ 100 млн ₸)</p>
      </motion.div>

      <p className="text-center text-gold-500/90">↓</p>

      <motion.div
        className="mx-auto w-full max-w-lg rounded-lg border border-navy-600 bg-navy-800/30 px-4 py-3 text-center"
        variants={flowVariants}
        initial="hidden"
        animate="visible"
        custom={4}
      >
        <p className="font-mono text-sm font-semibold text-gold-400">FINAL_SCORE</p>
        <p className="text-xs text-muted">min(100, BASE − штраф + бонус)</p>
      </motion.div>
    </div>
  );
}
