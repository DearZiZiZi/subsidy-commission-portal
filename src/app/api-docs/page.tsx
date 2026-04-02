"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CodeBlock } from "@/components/api-docs/CodeBlock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { COMPONENT_KEYS } from "@/types/scoring";
import { getApiBaseUrl, isDemoMode } from "@/lib/api";

const DEFAULT_BASE = "http://127.0.0.1:8000";

const EXAMPLE_PAYLOAD = {
  applicant_id: "238892375",
  direction: "Субсидирование в скотоводстве",
  standard: 4000,
  subsidy_purpose: "Производство и реализация молока и мяса",
  requested_amount: 49380000,
  region: "область Абай",
  month: 5,
  farm_area: "Абайский район",
} as const;

const DOCKER_SNIPPET = `docker build -t merit-score-100-api .
docker run -p 8000:8000 merit-score-100-api`;

const PIP_SNIPPET = `pip install -r requirements.txt
uvicorn service:app --port 8000 --reload`;

const ENV_EXAMPLE = `# .env.local
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_DEMO_MODE=false`;

export default function ApiDocsPage() {
  const envHintBase = useMemo(() => {
    try {
      return getApiBaseUrl();
    } catch {
      return DEFAULT_BASE;
    }
  }, []);

  const [baseUrl, setBaseUrl] = useState(envHintBase || DEFAULT_BASE);
  const [requestText, setRequestText] = useState(
    () => JSON.stringify(EXAMPLE_PAYLOAD, null, 2)
  );
  const [responseText, setResponseText] = useState("");
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [connState, setConnState] = useState<"idle" | "ok" | "fail">("idle");
  const [connMs, setConnMs] = useState<number | null>(null);

  const [snippetTab, setSnippetTab] = useState<"python" | "javascript" | "curl">("python");

  const testConnection = useCallback(async () => {
    const root = baseUrl.replace(/\/$/, "");
    const t0 = performance.now();
    try {
      let res = await fetch(`${root}/health`, { method: "GET" });
      if (!res.ok) {
        res = await fetch(`${root}/`, { method: "GET" });
      }
      const t1 = performance.now();
      setConnMs(Math.round(t1 - t0));
      setConnState(res.ok ? "ok" : "fail");
    } catch {
      const t1 = performance.now();
      setConnMs(Math.round(t1 - t0));
      setConnState("fail");
    }
  }, [baseUrl]);

  const sendEvaluate = useCallback(async () => {
    const root = baseUrl.replace(/\/$/, "");
    let body: unknown;
    try {
      body = JSON.parse(requestText);
    } catch {
      setResponseText(JSON.stringify({ error: "Некорректный JSON тела запроса" }, null, 2));
      setHttpStatus(null);
      setElapsedMs(null);
      return;
    }
    setLoading(true);
    const t0 = performance.now();
    try {
      const res = await fetch(`${root}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const t1 = performance.now();
      setElapsedMs(Math.round(t1 - t0));
      setHttpStatus(res.status);
      const text = await res.text();
      try {
        setResponseText(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponseText(text);
      }
    } catch (e) {
      const t1 = performance.now();
      setElapsedMs(Math.round(t1 - t0));
      setHttpStatus(null);
      setResponseText(
        JSON.stringify(
          { error: e instanceof Error ? e.message : "Сеть или CORS" },
          null,
          2
        )
      );
    } finally {
      setLoading(false);
    }
  }, [baseUrl, requestText]);

  const curlCommand = useMemo(() => {
    const root = baseUrl.replace(/\/$/, "");
    const escaped = requestText.replace(/'/g, `'\\''`);
    return `curl -X POST '${root}/evaluate' \\
  -H 'Content-Type: application/json' \\
  -d '${escaped}'`;
  }, [baseUrl, requestText]);

  const pythonSnippet = useMemo(
    () => `import requests

payload = ${JSON.stringify(EXAMPLE_PAYLOAD, null, 4)}

response = requests.post("${baseUrl.replace(/\/$/, "")}/evaluate", json=payload)
print(response.json())`,
    [baseUrl]
  );

  const jsSnippet = useMemo(
    () => `const response = await fetch('${baseUrl.replace(/\/$/, "")}/evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${JSON.stringify(EXAMPLE_PAYLOAD, null, 2)})
});
const result = await response.json();
console.log(result.final_score_100);`,
    [baseUrl]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 pb-12"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          API для разработчиков
        </h1>
        <p className="mt-1 text-sm text-muted">
          Интеграция с сервисом скоринга Merit Score (FastAPI). База по умолчанию:{" "}
          <span className="font-mono text-gold-500/90">{DEFAULT_BASE}</span>
        </p>
        {isDemoMode() && (
          <p className="mt-2 text-xs text-orange-500">
            Включён NEXT_PUBLIC_DEMO_MODE: фронтенд может не вызывать API на странице «Оценка» — плейграунд ниже обращается к указанному URL напрямую.
          </p>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">1. Подключение</h2>
        <Card className="border-navy-700 bg-card/90">
          <CardHeader>
            <CardTitle>Проверка соединения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label className="text-xs text-muted">Базовый URL</label>
                <Input
                  className="mt-1 font-mono text-sm"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </div>
              <Button type="button" variant="secondary" onClick={testConnection}>
                Проверить соединение
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span
                className={
                  connState === "ok"
                    ? "text-score-green"
                    : connState === "fail"
                      ? "text-score-red"
                      : "text-muted"
                }
              >
                {connState === "idle" && "Не проверялось"}
                {connState === "ok" && "Подключено (GET /health или GET /)"}
                {connState === "fail" && "Ошибка"}
              </span>
              {connMs != null && (
                <span className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-xs">
                  {connMs} мс
                </span>
              )}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium text-muted">Docker</p>
                <CodeBlock code={DOCKER_SNIPPET} language="bash" label="bash" />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted">Локально (pip)</p>
                <CodeBlock code={PIP_SNIPPET} language="bash" label="bash" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">2. Живой запрос</h2>
        <Card className="border-navy-700 bg-card/90">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle>POST /evaluate</CardTitle>
            <Button type="button" onClick={sendEvaluate} disabled={loading}>
              {loading ? "Отправка…" : "Отправить запрос"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              {httpStatus != null && (
                <span className="rounded-full border border-border px-2 py-0.5 font-mono">
                  HTTP {httpStatus}
                </span>
              )}
              {elapsedMs != null && (
                <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 font-mono text-gold-500">
                  {elapsedMs} мс
                </span>
              )}
            </div>
            <div className="grid min-h-[320px] gap-4 lg:grid-cols-2">
              <div className="flex min-h-0 flex-col">
                <p className="mb-2 text-xs font-medium text-muted">Тело запроса (JSON)</p>
                <textarea
                  className="min-h-[280px] flex-1 rounded-lg border border-navy-600 bg-[#0d1117] p-3 font-mono text-[13px] text-slate-200 outline-none ring-gold-500 focus:ring-1"
                  spellCheck={false}
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                />
              </div>
              <div className="flex min-h-0 flex-col">
                <p className="mb-2 text-xs font-medium text-muted">Ответ</p>
                <div className="min-h-[280px] flex-1 overflow-hidden rounded-lg border border-navy-600">
                  {responseText ? (
                    <CodeBlock code={responseText} language="json" label="json" />
                  ) : (
                    <div className="flex h-full min-h-[200px] items-center justify-center bg-[#0d1117] text-sm text-slate-500">
                      Ответ появится после запроса
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted">cURL</p>
              <CodeBlock code={curlCommand} language="bash" label="curl" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">3. Примеры кода</h2>
        <Card className="border-navy-700 bg-card/90">
          <CardContent className="pt-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {(
                [
                  ["python", "Python"],
                  ["javascript", "JavaScript"],
                  ["curl", "cURL"],
                ] as const
              ).map(([k, lab]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSnippetTab(k)}
                  className={
                    snippetTab === k
                      ? "rounded-lg bg-gold-500/20 px-3 py-1.5 text-sm font-medium text-gold-400"
                      : "rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-white/5"
                  }
                >
                  {lab}
                </button>
              ))}
            </div>
            {snippetTab === "python" && <CodeBlock code={pythonSnippet} language="python" />}
            {snippetTab === "javascript" && (
              <CodeBlock code={jsSnippet} language="javascript" />
            )}
            {snippetTab === "curl" && <CodeBlock code={curlCommand} language="bash" label="curl" />}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">4. Схема ответа</h2>
        <Card className="border-navy-700 bg-card/90">
          <CardContent className="overflow-x-auto pt-6">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="py-2 pr-4 font-medium">Поле</th>
                  <th className="py-2 pr-4 font-medium">Тип</th>
                  <th className="py-2 pr-4 font-medium">Описание</th>
                  <th className="py-2 font-medium">Пример</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                <tr className="border-b border-border/60">
                  <td className="py-2 pr-4 font-mono text-xs">applicant_id</td>
                  <td className="py-2 pr-4">string</td>
                  <td className="py-2 pr-4 text-muted">
                    Идентификатор заявки / заявителя. <span className="text-slate-500">Application id.</span>
                  </td>
                  <td className="py-2 font-mono text-xs">238892375</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-2 pr-4 font-mono text-xs">final_score_100</td>
                  <td className="py-2 pr-4">number</td>
                  <td className="py-2 pr-4 text-muted">
                    Итоговый балл 0–100. <span className="text-slate-500">Final score.</span>
                  </td>
                  <td className="py-2 font-mono text-xs">72.4</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-2 pr-4 font-mono text-xs">explanation</td>
                  <td className="py-2 pr-4">string</td>
                  <td className="py-2 pr-4 text-muted">
                    Текстовое пояснение (сильные стороны, штрафы).{" "}
                    <span className="text-slate-500">Human-readable explanation.</span>
                  </td>
                  <td className="py-2 text-xs text-muted">…</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-2 pr-4 font-mono text-xs align-top">component_breakdown</td>
                  <td className="py-2 pr-4 align-top">object</td>
                  <td className="py-2 pr-4 text-muted align-top">
                    Пять компонентов с русскими ключами (как в модели).{" "}
                    <span className="text-slate-500">Per-component points.</span>
                  </td>
                  <td className="py-2 align-top font-mono text-[11px] text-muted">
                    {`{ ${COMPONENT_KEYS.map((k) => `"${k}"`).join(", ")} }`}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">5. Переменные окружения фронтенда</h2>
        <Card className="border-navy-700 bg-card/90">
          <CardContent className="overflow-x-auto pt-6">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="py-2 pr-4 font-medium">Переменная</th>
                  <th className="py-2 pr-4 font-medium">Назначение</th>
                  <th className="py-2 font-medium">Пример</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60">
                  <td className="py-2 pr-4 font-mono text-xs">NEXT_PUBLIC_API_URL</td>
                  <td className="py-2 pr-4 text-muted">
                    Базовый URL API для страницы «Оценка» и проверки здоровья.
                  </td>
                  <td className="py-2 font-mono text-xs">http://127.0.0.1:8000</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">NEXT_PUBLIC_DEMO_MODE</td>
                  <td className="py-2 pr-4 text-muted">
                    Если true — расчёт на клиенте без запроса к API (демо).
                  </td>
                  <td className="py-2 font-mono text-xs">false</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium text-muted">.env.local</p>
              <CodeBlock code={ENV_EXAMPLE} language="bash" label="env" />
            </div>
          </CardContent>
        </Card>
      </section>
    </motion.div>
  );
}
